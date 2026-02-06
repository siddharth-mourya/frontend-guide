# Rules of Hooks

## ⚡ Quick Revision

### The Two Rules

**Rule 1: Only call hooks at the top level**
```tsx
// ❌ Wrong - inside condition
function BadComponent({ shouldShow }) {
  if (shouldShow) {
    const [count, setCount] = useState(0); // Violates rule!
  }
}

// ❌ Wrong - inside loop
function BadList({ items }) {
  return items.map(item => {
    const [selected, setSelected] = useState(false); // Violates rule!
    return <Item key={item.id} selected={selected} />;
  });
}

// ✅ Correct - top level
function GoodComponent({ shouldShow }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(shouldShow);
}
```

**Rule 2: Only call hooks from React functions**
```tsx
// ❌ Wrong - regular function
function regularFunction() {
  const [state] = useState(0); // Violates rule!
}

// ❌ Wrong - class method
class MyClass {
  handleClick() {
    const [count] = useState(0); // Violates rule!
  }
}

// ✅ Correct - React component
function MyComponent() {
  const [count] = useState(0);
}

// ✅ Correct - Custom hook
function useMyHook() {
  const [count] = useState(0);
}
```

### ESLint Plugin
```json
{
  "extends": ["plugin:react-hooks/recommended"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Critical Facts:**
- React relies on hook call order to maintain state
- Conditional hooks break the hook queue
- ESLint plugin catches most violations
- Rules enable React's internal optimization

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**React's internal hook mechanism:**
- React uses linked list to track hook calls
- Each render must call hooks in identical order
- Hook position determines which state/effect to use
- No magic - just call order consistency

**Performance and correctness:**
- Predictable hook order enables optimization
- Fiber reconciler relies on stable hook indices
- Conditional hooks would break state association
- Rules prevent common bugs and edge cases

**Developer experience:**
- ESLint integration catches errors early
- Clear mental model for hook behavior
- Consistent patterns across codebases
- Better debugging and reasoning about state
</details>

<details>
<summary>How it works</summary>
**React's hook implementation (simplified):**
```tsx
let currentFiber = null;
let currentHookIndex = 0;

function useState(initialValue) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = currentHookIndex++;
  
  if (hooks[index] === undefined) {
    hooks[index] = {
      state: initialValue,
      queue: []
    };
  }
  
  const hook = hooks[index];
  
  const setState = (newValue) => {
    hook.queue.push(newValue);
    scheduleUpdate(fiber);
  };
  
  return [hook.state, setState];
}

function resetHookIndex() {
  currentHookIndex = 0;
}
```

**Why order matters:**
```tsx
function Component({ condition }) {
  // First render: hook indices
  const [a] = useState(1);     // Index 0
  const [b] = useState(2);     // Index 1
  
  // Second render with condition change
  if (condition) {
    const [c] = useState(3);   // Index 2 (but was 0 before!)
  }
  const [d] = useState(4);     // Index 1 or 3 depending on condition
  
  // React gets confused - state association breaks!
}
```

**ESLint rule implementation:**
```tsx
// Detects hook calls
function isHookCall(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name.startsWith('use')
  );
}

// Checks if inside conditional
function isConditionalContext(node) {
  return (
    isInIfStatement(node) ||
    isInLoop(node) ||
    isInFunction(node)
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"I can call hooks conditionally if I'm careful":**
- NO! Even if conditions seem stable, React can't guarantee it
- Code changes over time - future modifications might break
- React's reconciler assumes consistent hook order

**"Early returns are always safe":**
- Early returns before any hooks are fine
- Early returns after some hooks violate the rules
```tsx
function Component({ user }) {
  if (!user) return null; // ✅ Safe - no hooks called yet
  
  const [count, setCount] = useState(0);
  
  if (user.banned) return <div>Banned</div>; // ❌ Violates rule!
}
```

**"Loops are okay if they're stable":**
- Even stable loops violate rules
- Hook count might change with data changes
- Use component arrays instead

**"ESLint warnings are just suggestions":**
- Rules of hooks errors will cause bugs
- exhaustive-deps warnings prevent stale closures
- Trust the linter - it understands React's internals
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "Why can't hooks be called conditionally?"
2. "How does React track hook state between renders?"
3. "What would happen if you violate the rules of hooks?"
4. "Explain the exhaustive-deps rule"

**Debugging scenarios:**

**Stale closure from missing dependency:**
```tsx
function Timer() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Timer');
  
  useEffect(() => {
    const interval = setInterval(() => {
      // This closure captures the initial count value
      console.log(`${name}: ${count}`); // Always logs "Timer: 0"
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // Missing dependencies!
  
  // Correct version with exhaustive deps
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`${name}: ${count}`); // Logs current values
    }, 1000);
    
    return () => clearInterval(interval);
  }, [name, count]); // All dependencies included
}
```

**Common workarounds that violate rules:**
```tsx
// ❌ Wrong - conditional hook call
function ConditionalHook({ shouldUseData }) {
  let data = null;
  if (shouldUseData) {
    data = useApi('/data'); // Violates rules!
  }
  return <div>{data}</div>;
}

// ✅ Correct - hook always called
function ConditionalHook({ shouldUseData }) {
  const data = useApi(shouldUseData ? '/data' : null);
  return <div>{shouldUseData && data}</div>;
}

// ✅ Correct - conditional rendering
function ConditionalHook({ shouldUseData }) {
  if (!shouldUseData) return <div>No data</div>;
  
  const data = useApi('/data');
  return <div>{data}</div>;
}
```

**Advanced rule violations:**
```tsx
// ❌ Subtle violation - hook in callback
function BadExample() {
  const [items, setItems] = useState([]);
  
  const handleClick = () => {
    // This violates rules! Hooks can't be called in event handlers
    const [loading, setLoading] = useState(false);
    setLoading(true);
    // ... fetch logic
  };
}

// ✅ Correct approach
function GoodExample() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    // ... fetch logic
    setLoading(false);
  };
}
```

**ESLint rule bypassing (avoid!):**
```tsx
// ❌ Don't disable the linter without good reason
useEffect(() => {
  doSomething(externalValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // This will cause bugs!

// ✅ Better approaches:
// 1. Include the dependency
useEffect(() => {
  doSomething(externalValue);
}, [externalValue]);

// 2. Use ref for mutable values
const externalValueRef = useRef(externalValue);
externalValueRef.current = externalValue;
useEffect(() => {
  doSomething(externalValueRef.current);
}, []);

// 3. Extract stable function
const doSomethingStable = useCallback(() => {
  doSomething(externalValue);
}, [externalValue]);

useEffect(() => {
  doSomethingStable();
}, [doSomethingStable]);
```
</details>