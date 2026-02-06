# Core React Hooks

## ⚡ Quick Revision

### useState
```tsx
const [state, setState] = useState<T>(initialValue);
// Functional updates for performance
setState(prev => prev + 1);
// Lazy initial state
const [state] = useState(() => expensiveComputation());
```

### useEffect
```tsx
// Mount/unmount
useEffect(() => {
  const cleanup = setupSubscription();
  return cleanup;
}, []);

// Dependency tracking
useEffect(() => {
  fetchData(id);
}, [id]);
```

### useRef
```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null);
// Mutable value (doesn't trigger re-render)
const countRef = useRef(0);
```

### useMemo
```tsx
// Expensive computation memoization
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### useCallback
```tsx
// Function reference stability
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

**Critical Facts:**
- useState batches updates in React 18
- useEffect runs after DOM mutations
- useRef preserves values across renders
- useMemo/useCallback prevent unnecessary computations/re-renders

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**React's functional paradigm shift:**
- Class components had lifecycle methods scattered across multiple methods
- Hooks consolidate related logic into single, reusable units
- Enable state and side effects in functional components
- Better code reuse through custom hooks

**Performance considerations:**
- Direct state mutation triggers reconciliation
- Effects allow controlled side effect timing
- Memoization prevents expensive recalculations
</details>

<details>
<summary>How it works</summary>
**useState implementation concept:**
```tsx
// Simplified React internals
let hookIndex = 0;
const hooks = [];

function useState(initialValue) {
  const currentIndex = hookIndex++;
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = initialValue;
  }
  
  const setState = (newValue) => {
    hooks[currentIndex] = typeof newValue === 'function' 
      ? newValue(hooks[currentIndex]) 
      : newValue;
    rerender();
  };
  
  return [hooks[currentIndex], setState];
}
```

**useEffect scheduling:**
- Effects are queued during render
- Execute after DOM mutations (layout effects run synchronously)
- Cleanup functions run before next effect or unmount
- Dependencies compared with Object.is()

**useRef persistence:**
- Returns same object reference every render
- Mutations don't trigger re-renders
- Perfect for imperative DOM access or instance variables
</details>

<details>
<summary>Common misconceptions</summary>
**"useState is asynchronous":**
- setState is synchronous in React 18 with automatic batching
- The state update is scheduled, not the setState call itself

**"useEffect dependencies should be minimal":**
- Include ALL dependencies used inside effect
- ESLint plugin enforces this correctly
- Missing dependencies cause stale closures

**"useMemo/useCallback always improve performance":**
- Only beneficial when preventing expensive computations
- Adds overhead for primitive values or simple operations
- Profile before optimizing

**"useRef is just for DOM elements":**
- Any mutable value that shouldn't trigger re-renders
- Previous state values, timers, intervals, etc.
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "Explain useState batching in React 18"
2. "When would you use useRef over useState?"
3. "Why are dependency arrays necessary in useEffect?"
4. "How do useMemo and useCallback differ?"

**Advanced scenarios:**
```tsx
// Stale closure example
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // This creates a stale closure
    const interval = setInterval(() => {
      setCount(count + 1); // Always uses initial count (0)
    }, 1000);
    
    // Correct approach
    const interval2 = setInterval(() => {
      setCount(c => c + 1); // Uses current count
    }, 1000);
    
    return () => clearInterval(interval2);
  }, []); // Empty deps means effect only runs once
}
```

**Performance optimization patterns:**
```tsx
// Child component optimization
const MemoChild = React.memo(({ onClick, data }) => {
  return <div onClick={() => onClick(data.id)}>{data.name}</div>;
});

function Parent({ items }) {
  // Without useCallback, MemoChild re-renders every time
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);
  
  // Without useMemo, filter runs on every render
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  
  return filteredItems.map(item => (
    <MemoChild key={item.id} onClick={handleClick} data={item} />
  ));
}
```
</details>