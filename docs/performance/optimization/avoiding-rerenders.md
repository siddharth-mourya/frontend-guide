# Avoiding Re-renders

## ⚡ Quick Revision
- **React.memo**: Prevents re-renders when props haven't changed (shallow comparison)
- **useMemo**: Memoizes expensive calculations to avoid recalculating on every render
- **useCallback**: Memoizes function references to prevent child re-renders
- **When to optimize**: Profile first - only optimize when performance problems are measured
- **Common pitfall**: Over-memoizing or using wrong dependencies causes stale closures
- **Rule of thumb**: Start without memoization, add only when needed

```jsx
// React.memo for component memoization
const ExpensiveChild = React.memo(function ExpensiveChild({ data, onUpdate }) {
  console.log('ExpensiveChild rendered');
  return (
    <div>
      {data.items.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={onUpdate}>Update</button>
    </div>
  );
});

// useMemo for expensive calculations
function ProductList({ products, filters }) {
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(product => 
      filters.category ? product.category === filters.category : true
    ).sort((a, b) => a.price - b.price);
  }, [products, filters.category]); // Only recalculate when these change

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// useCallback for stable function references
function TodoApp() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  }, []); // No dependencies - function never changes
  
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []); // No dependencies needed with functional updates

  return (
    <div>
      <TodoInput onAdd={addTodo} /> {/* Won't re-render when todos change */}
      <TodoList todos={todos} onToggle={toggleTodo} />
    </div>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
React re-render optimizations exist because **unnecessary re-renders** can cause performance issues:

**React's Default Behavior:**
- Every state change triggers re-render of component and all children
- Props are compared by reference, not value
- New function/object references cause child re-renders even with same content

**Performance Problems:**
```jsx
// ❌ Problematic pattern
function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'John' });
  
  return (
    <div>
      <ExpensiveComponent data={user} /> {/* Re-renders on count change! */}
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

// ExpensiveComponent re-renders unnecessarily when count changes
// because App re-renders and creates new data reference
```

**When Re-renders Matter:**
1. **Large lists** with hundreds/thousands of items
2. **Complex calculations** in render functions
3. **Heavy DOM operations** or animations
4. **Frequent state updates** (typing, scrolling, real-time data)
</details>

<details>
<summary>How it works</summary>
React's memoization uses **shallow comparison** and **dependency tracking**:

**1. React.memo Implementation:**
```jsx
// Simplified React.memo implementation
function memo(Component, arePropsEqual = shallowEqual) {
  return function MemoizedComponent(props) {
    const prevPropsRef = useRef();
    const memoizedComponentRef = useRef();
    
    if (!prevPropsRef.current || !arePropsEqual(prevPropsRef.current, props)) {
      memoizedComponentRef.current = <Component {...props} />;
      prevPropsRef.current = props;
    }
    
    return memoizedComponentRef.current;
  };
}

// Custom comparison
const MyComponent = React.memo(function MyComponent({ data, onUpdate }) {
  return <div>{data.name}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id; // Custom equality
});
```

**2. useMemo Dependency Tracking:**
```jsx
// Internal useMemo logic
function useMemo(factory, deps) {
  const [memoizedValue, setMemoizedValue] = useState(() => factory());
  const prevDepsRef = useRef(deps);
  
  if (!areEqual(prevDepsRef.current, deps)) {
    const newValue = factory();
    setMemoizedValue(newValue);
    prevDepsRef.current = deps;
  }
  
  return memoizedValue;
}
```

**3. useCallback Function Memoization:**
```jsx
// useCallback is just useMemo for functions
const useCallback = (fn, deps) => useMemo(() => fn, deps);
```

**4. Advanced Optimization Patterns:**
```jsx
// Context splitting to prevent cascade re-renders
const ExpensiveContext = createContext();
const CheapContext = createContext();

function OptimizedProvider({ children }) {
  const [expensiveData, setExpensiveData] = useState(heavyInitialData);
  const [cheapData, setCheapData] = useState(simpleData);
  
  // Separate contexts prevent unnecessary re-renders
  return (
    <ExpensiveContext.Provider value={expensiveData}>
      <CheapContext.Provider value={cheapData}>
        {children}
      </CheapContext.Provider>
    </ExpensiveContext.Provider>
  );
}

// State colocation - keep state close to where it's used
function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false); // Local to this item
  
  return (
    <div>
      {isEditing ? (
        <input defaultValue={todo.text} />
      ) : (
        <span>{todo.text}</span>
      )}
      <button onClick={() => setIsEditing(!isEditing)}>Edit</button>
    </div>
  );
}
```

**5. Profiling and Measurement:**
```jsx
// React DevTools Profiler
function ProfiledComponent() {
  return (
    <Profiler
      id="ProductList"
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        console.log('Component render time:', actualDuration);
      }}
    >
      <ProductList />
    </Profiler>
  );
}

// Custom performance hook
function useRenderTracker(componentName) {
  const renderCount = useRef(0);
  const renderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    console.log(`${componentName} render #${renderCount.current} (${now - renderTime.current}ms)`);
    renderTime.current = now;
  });
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Always use React.memo"**
```jsx
// ❌ Unnecessary memoization
const SimpleComponent = React.memo(function SimpleComponent({ text }) {
  return <div>{text}</div>; // Simple component, memo overhead not worth it
});

// ✅ Memo when component is expensive or renders frequently
const ExpensiveChart = React.memo(function ExpensiveChart({ data }) {
  const processedData = processHeavyData(data); // Expensive calculation
  return <Chart data={processedData} />;
});
```

**❌ "useMemo prevents all re-renders"**
```jsx
// ❌ Misunderstanding - useMemo only memoizes the value
function Component({ items }) {
  const expensiveValue = useMemo(() => 
    items.reduce((sum, item) => sum + item.value, 0), [items]
  );
  
  return <div>{expensiveValue}</div>; // Component still re-renders, just calculation is skipped
}

// ✅ Combine with React.memo for complete optimization
const Component = React.memo(function Component({ items }) {
  const expensiveValue = useMemo(() => 
    items.reduce((sum, item) => sum + item.value, 0), [items]
  );
  
  return <div>{expensiveValue}</div>;
});
```

**❌ "useCallback prevents child re-renders automatically"**
```jsx
// ❌ Child still re-renders because parent re-renders
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <div>
      <Child onClick={handleClick} name={name} /> {/* Still re-renders when count changes! */}
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

// ✅ Child needs React.memo to skip re-renders
const Child = React.memo(function Child({ onClick, name }) {
  return <button onClick={onClick}>{name}</button>;
});
```

**❌ "Empty dependency array is always safe"**
```jsx
// ❌ Stale closure issue
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  const fetchUser = useCallback(() => {
    api.getUser(userId).then(setUser); // Stale userId!
  }, []); // Missing userId dependency
  
  // userId changes but fetchUser still uses old value
}

// ✅ Include all dependencies
const fetchUser = useCallback(() => {
  api.getUser(userId).then(setUser);
}, [userId]); // Now updates when userId changes
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"When should you use React.memo?"**
   - Components that render frequently with same props
   - Components with expensive render logic
   - Components that receive complex props that change rarely

2. **"What's the difference between useMemo and useCallback?"**
   - useMemo: Memoizes any value (objects, arrays, calculations)
   - useCallback: Specifically for memoizing functions

3. **"How do you identify performance problems?"**
   - Use React DevTools Profiler
   - Look for components rendering more than expected
   - Measure actual user impact, not just render counts

**Advanced Optimization Techniques:**

**1. Component Splitting:**
```jsx
// ❌ Expensive operation affects entire component
function UserDashboard({ user }) {
  const expensiveChart = generateChart(user.data); // Expensive!
  
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <div>{expensiveChart}</div>
      <UserProfile user={user} />
    </div>
  );
}

// ✅ Split expensive part into separate component
function UserDashboard({ user }) {
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <ExpensiveChart data={user.data} />
      <UserProfile user={user} />
    </div>
  );
}

const ExpensiveChart = React.memo(function ExpensiveChart({ data }) {
  const chart = useMemo(() => generateChart(data), [data]);
  return <div>{chart}</div>;
});
```

**2. State Structure Optimization:**
```jsx
// ❌ Flat state causes unnecessary re-renders
const [state, setState] = useState({
  user: { name: 'John', email: 'john@example.com' },
  posts: [...],
  comments: [...],
  ui: { loading: false, error: null }
});

// Changing loading triggers re-render of all components using any part of state

// ✅ Separate state by concern
const [user, setUser] = useState({ name: 'John', email: 'john@example.com' });
const [posts, setPosts] = useState([...]);
const [ui, setUi] = useState({ loading: false, error: null });
```

**3. Virtualization for Large Lists:**
```jsx
import { FixedSizeList as List } from 'react-window';

const Row = React.memo(function Row({ index, style, data }) {
  return (
    <div style={style}>
      <ItemComponent item={data[index]} />
    </div>
  );
});

function LargeList({ items }) {
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {Row}
    </List>
  );
}
```

**4. Optimization Measurement:**
```jsx
function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  
  useLayoutEffect(() => {
    const start = performance.now();
    renderCount.current++;
    
    return () => {
      const end = performance.now();
      renderTimes.current.push(end - start);
      
      if (renderTimes.current.length > 100) {
        renderTimes.current.shift();
      }
      
      const avg = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      
      if (avg > 16) { // More than one frame
        console.warn(`${componentName} average render time: ${avg.toFixed(2)}ms`);
      }
    };
  });
}
```

**Golden Rules:**
1. **Measure before optimizing** - use React DevTools Profiler
2. **State colocation** - keep state close to where it's used
3. **Split components** - separate expensive operations
4. **Memoize at boundaries** - between slow parent and fast child
5. **Avoid premature optimization** - React is fast by default
</details>