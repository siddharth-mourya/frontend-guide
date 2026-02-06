# Hook Pitfalls and Common Mistakes

## ⚡ Quick Revision

### Stale Closures
```tsx
// ❌ Problem: Stale closure captures initial value
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Always uses initial count (0)
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // Missing dependency!
}

// ✅ Solution 1: Functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1); // Uses current value
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// ✅ Solution 2: Include dependency
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [count]); // Effect recreated when count changes
```

### Infinite Loops
```tsx
// ❌ Problem: Missing dependency causes infinite loop
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // No dependency array - runs after every render!
}

// ❌ Problem: Object dependency causes infinite loop
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const config = { timeout: 5000 }; // New object every render
  
  useEffect(() => {
    fetchUser(userId, config).then(setUser);
  }, [userId, config]); // config changes every render!
}

// ✅ Solution: Stable dependencies
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const config = { timeout: 5000 }; // Create inside effect
    fetchUser(userId, config).then(setUser);
  }, [userId]);
}
```

### Dependency Array Issues
```tsx
// ❌ Problem: Missing function dependency
function SearchComponent({ onSearch }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    if (query) {
      onSearch(query); // onSearch might change between renders
    }
  }, [query]); // Missing onSearch dependency!
}

// ✅ Solution: Include all dependencies
useEffect(() => {
  if (query) {
    onSearch(query);
  }
}, [query, onSearch]);
```

### useState Pitfalls
```tsx
// ❌ Problem: Direct state mutation
const [items, setItems] = useState([]);
const addItem = (item) => {
  items.push(item); // Mutates existing array!
  setItems(items); // React won't re-render
};

// ✅ Solution: Create new array
const addItem = (item) => {
  setItems(prev => [...prev, item]);
};
```

**Quick Fixes:**
- Use functional updates for state that depends on previous value
- Include ALL dependencies in effect arrays
- Create objects/arrays inside effects or use useMemo
- Never mutate state directly

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**JavaScript closure behavior:**
- Functions capture variables from their lexical scope
- useEffect creates closures over current render's values
- Without proper dependencies, closures become "stale"
- React can't automatically track what should trigger re-runs

**React's reconciliation process:**
- React compares dependency arrays with Object.is()
- New objects/arrays are never equal to previous ones
- Functions are recreated on every render unless memoized
- Missing dependencies break React's optimization assumptions

**State update timing:**
- setState is asynchronous in terms of when re-render happens
- Multiple setState calls may be batched
- State mutations don't trigger re-renders
- Functional updates ensure consistency
</details>

<details>
<summary>How it works</summary>
**Stale closure mechanism:**
```tsx
// What React essentially does:
function Component() {
  const [count, setCount] = useState(0);
  
  // First render: count = 0
  const effectCallback1 = () => {
    const interval = setInterval(() => {
      setCount(0 + 1); // Closure captures count = 0
    }, 1000);
    return () => clearInterval(interval);
  };
  
  // Effect with empty deps only runs once
  // So effectCallback1 is the only one that ever runs
  useEffect(effectCallback1, []);
}
```

**Dependency comparison:**
```tsx
function areHookInputsEqual(prevDeps, nextDeps) {
  if (prevDeps === null || nextDeps === null) return false;
  if (prevDeps.length !== nextDeps.length) return false;
  
  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

// Why this causes issues:
Object.is({}, {}) // false - new objects never equal
Object.is([], []) // false - new arrays never equal
Object.is(() => {}, () => {}) // false - new functions never equal
```

**State update batching:**
```tsx
function handleClick() {
  setCount(count + 1); // Uses current count value
  setCount(count + 1); // Still uses same current count value!
  // Both updates use same base value, only increments by 1
  
  // Functional updates work correctly:
  setCount(c => c + 1); // Gets latest value
  setCount(c => c + 1); // Gets result from previous update
  // Correctly increments by 2
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Empty dependency arrays are always safe":**
- Only safe when effect doesn't use any reactive values
- Missing dependencies cause stale closures
- ESLint exhaustive-deps rule exists for a reason

**"useCallback/useMemo solve all performance issues":**
- They prevent unnecessary re-renders of child components
- Add overhead - only beneficial when children are expensive
- Don't memoize everything - profile first

**"setState immediately updates state":**
- State updates are scheduled, not immediate
- Multiple updates may be batched
- Use functional updates for state-dependent logic

**"Objects in dependency arrays are fine if they're stable":**
- Objects are never stable unless memoized
- Even identical objects trigger re-runs due to reference equality
- Use primitive dependencies when possible
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "Why do stale closures occur and how do you fix them?"
2. "What causes infinite loops in useEffect?"
3. "Explain the exhaustive-deps ESLint rule"
4. "When should you ignore the dependency warning?"

**Advanced debugging scenarios:**

**Race condition with async effects:**
```tsx
// ❌ Problem: Race condition
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(user => {
      setUser(user); // What if userId changed while fetching?
      setLoading(false);
    });
  }, [userId]);
}

// ✅ Solution: Cleanup to prevent race conditions
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetchUser(userId).then(user => {
      if (!cancelled) {
        setUser(user);
        setLoading(false);
      }
    });
    
    return () => { cancelled = true; };
  }, [userId]);
}
```

**Complex dependency management:**
```tsx
// ❌ Problem: Function dependency changes every render
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);
  
  const performSearch = async () => {
    const data = await searchAPI(query, filters);
    setResults(data);
  };
  
  useEffect(() => {
    performSearch(); // performSearch changes every render
  }, [query, performSearch]); // Effect runs every render!
}

// ✅ Solution 1: Move function inside effect
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const performSearch = async () => {
      const data = await searchAPI(query, filters);
      setResults(data);
    };
    
    performSearch();
  }, [query, filters]);
}

// ✅ Solution 2: useCallback with proper dependencies
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);
  
  const performSearch = useCallback(async () => {
    const data = await searchAPI(query, filters);
    setResults(data);
  }, [query, filters]);
  
  useEffect(() => {
    performSearch();
  }, [performSearch]);
}
```

**State update timing issues:**
```tsx
// ❌ Problem: Reading state immediately after setState
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = () => {
    setCount(count + 1);
    console.log(count); // Still logs old value!
    
    // Multiple updates don't accumulate
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1); // Only increments by 1, not 4
  };
}

// ✅ Solution: Use refs for immediate values
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const handleIncrement = () => {
    const newCount = countRef.current + 1;
    setCount(newCount);
    console.log(newCount); // Logs correct value
  };
}

// ✅ Better: Functional updates for accumulation
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleMultipleIncrements = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1); // Correctly increments by 3
  };
}
```

**Memory leak prevention:**
```tsx
// ❌ Problem: Subscription not cleaned up
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const subscription = dataSource.subscribe(setData);
    // Missing cleanup - memory leak!
  }, []);
}

// ✅ Solution: Always clean up subscriptions
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const subscription = dataSource.subscribe(setData);
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
```

**When to ignore exhaustive-deps (rarely!):**
```tsx
// Valid case: Stable external reference
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // analytics is a stable external object
    analytics.track('component_mounted', { count });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We want this to run only once
  
  // Better approach: use ref for stable reference
  const analyticsRef = useRef(analytics);
  
  useEffect(() => {
    analyticsRef.current.track('component_mounted', { count });
  }, []); // Now it's truly dependency-free
}
```
</details>