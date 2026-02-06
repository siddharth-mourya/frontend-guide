# Props and State

## ⚡ Quick Revision

- Props: Immutable data passed from parent to child
- State: Mutable data managed within a component
- Props flow down (one-way data flow), events flow up
- Never mutate state directly, use setter functions
- Lifting state up: Move shared state to closest common ancestor
- **Pitfall**: State updates are asynchronous and batched
- **Pitfall**: Modifying props directly has no effect (props are read-only)

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  
  return <Child count={count} onIncrement={() => setCount(c => c + 1)} />;
}

function Child({ count, onIncrement }) {
  // count is a prop (immutable)
  // onIncrement is a callback prop
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}

// WRONG: Never mutate props
function Child({ count }) {
  count++; // ❌ No effect, props are read-only
}

// WRONG: Never mutate state directly
function Counter() {
  const [items, setItems] = useState([]);
  
  const addItem = () => {
    items.push('new'); // ❌ Direct mutation
    setItems(items);   // React won't detect change
  };
  
  // ✅ Correct: Create new array
  const addItemCorrect = () => {
    setItems([...items, 'new']);
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Props (Properties):**
- Enable component reusability with different data
- Enforce unidirectional data flow (predictable state changes)
- Create clear parent-child relationships
- Make data flow explicit and traceable

**State:**
- Allows components to be dynamic and interactive
- Enables local data management without affecting parents
- Triggers re-renders when updated
- Provides encapsulation (private to component)

**Immutability:**
- Enables efficient change detection (reference comparison)
- Prevents bugs from unexpected mutations
- Supports time-travel debugging
- Makes React's reconciliation efficient

</details>

<details>
<summary>How it works</summary>
**Props immutability:**
```jsx
function UserCard({ user }) {
  // Props are frozen in development mode
  // This will throw in strict mode:
  // user.name = 'New Name'; // ❌ Cannot modify
  
  // To "change" props, parent must pass new values
  // React compares props to decide if re-render needed
  
  return <div>{user.name}</div>;
}

// Parent controls the data
function Parent() {
  const [user, setUser] = useState({ name: 'Alice' });
  
  const updateUser = () => {
    // ✅ Create new object
    setUser({ ...user, name: 'Bob' });
  };
  
  return <UserCard user={user} />;
}
```

**State updates:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // ❌ Wrong: Direct mutation
  const badIncrement = () => {
    count = count + 1; // Doesn't work
  };
  
  // ✅ Correct: Use setter
  const goodIncrement = () => {
    setCount(count + 1);
  };
  
  // ⚠️ Closure issue
  const problematicIncrement = () => {
    setCount(count + 1);
    setCount(count + 1); // Both use same count value!
    // Result: count increases by 1, not 2
  };
  
  // ✅ Functional update (recommended)
  const bestIncrement = () => {
    setCount(c => c + 1);
    setCount(c => c + 1); // Uses updated value
    // Result: count increases by 2
  };
}

// Complex state updates
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    // ❌ Wrong: Mutate array
    todos.push({ id: Date.now(), text });
    setTodos(todos);
    
    // ✅ Correct: New array
    setTodos([...todos, { id: Date.now(), text }]);
    
    // ✅ Also correct: Functional update
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  };
  
  const toggleTodo = (id) => {
    // ❌ Wrong: Mutate object in array
    const todo = todos.find(t => t.id === id);
    todo.completed = !todo.completed;
    setTodos(todos);
    
    // ✅ Correct: New array with new object
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  const removeTodo = (id) => {
    // ✅ Correct: Filter creates new array
    setTodos(todos.filter(todo => todo.id !== id));
  };
}

// Nested state updates
function UserProfile() {
  const [user, setUser] = useState({
    name: 'Alice',
    address: { city: 'NYC', zip: '10001' }
  });
  
  const updateCity = (newCity) => {
    // ❌ Wrong: Shallow copy doesn't deep clone
    const updated = { ...user };
    updated.address.city = newCity; // Mutates nested object
    setUser(updated);
    
    // ✅ Correct: Deep clone nested objects
    setUser({
      ...user,
      address: { ...user.address, city: newCity }
    });
    
    // ✅ Alternative: Immer library simplifies this
    // setUser(draft => {
    //   draft.address.city = newCity;
    // });
  };
}
```

**Lifting state up:**
```jsx
// Before: State in child, can't share
function SiblingA() {
  const [data, setData] = useState('value');
  return <div>{data}</div>;
}

function SiblingB() {
  // Can't access SiblingA's state!
  return <div>Need data from A</div>;
}

// After: Lift state to common parent
function Parent() {
  const [sharedData, setSharedData] = useState('value');
  
  return (
    <>
      <SiblingA data={sharedData} onDataChange={setSharedData} />
      <SiblingB data={sharedData} />
    </>
  );
}

function SiblingA({ data, onDataChange }) {
  return (
    <input
      value={data}
      onChange={(e) => onDataChange(e.target.value)}
    />
  );
}

function SiblingB({ data }) {
  return <div>Received: {data}</div>;
}
```

**State colocation:**
```jsx
// ❌ Bad: State too high (unnecessary re-renders)
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  return (
    <>
      <Header /> {/* Re-renders on every state change */}
      <MainContent /> {/* Re-renders unnecessarily */}
      {isModalOpen && <Modal data={formData} />}
    </>
  );
}

// ✅ Good: State as low as possible
function App() {
  return (
    <>
      <Header />
      <MainContent />
      <ModalContainer /> {/* Only this part re-renders */}
    </>
  );
}

function ModalContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  return isModalOpen ? <Modal data={formData} /> : null;
}
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"setState updates immediately"** - Updates are batched and asynchronous
- **"Props can be modified"** - Props are immutable (read-only)
- **"Shallow copy is enough"** - Nested objects need deep cloning
- **"State should be in top component"** - Colocate state close to where it's used
- **"You can't change props"** - Parent can pass different props, causing re-render
- **"Multiple setState calls mean multiple renders"** - React batches them (in event handlers)

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **Data flow**: Can you explain unidirectional data flow?
- **Immutability**: Why and how to update state immutably
- **State placement**: When to lift state vs keep it local
- **Performance**: Understanding of unnecessary re-renders

Critical concepts to explain:
- **Props vs state**: External vs internal data
- **Functional updates**: Why use `setState(prev => ...)` pattern
- **Batching**: How React optimizes multiple state updates
- **Lifting state**: Finding the right common ancestor
- **Derived state**: When to compute values instead of storing them

Common questions:
- "What's the difference between props and state?"
- "Why can't you mutate state directly?"
- "How do you update nested state immutably?"
- "When would you lift state up?"
- "Why isn't my state updating immediately after setState?"
- "How do you share state between sibling components?"
- "What happens if you call setState multiple times?"

Key talking points:
- Props flow down, events flow up
- State updates trigger re-renders
- Always create new objects/arrays for state
- Use functional updates when new state depends on old state
- Lift state to lowest common ancestor
- Avoid unnecessary state (derive when possible)

</details>

---

## 📝 Code Examples

<details>
<summary>Complex state management patterns</summary>
```jsx
// Pattern 1: Derived state (avoid storing computed values)
function ProductList({ products }) {
  const [sortOrder, setSortOrder] = useState('asc');
  const [filter, setFilter] = useState('');
  
  // ❌ Bad: Storing derived state
  // const [filteredProducts, setFilteredProducts] = useState([]);
  // useEffect(() => {
  //   setFilteredProducts(products.filter(...));
  // }, [products, filter]);
  
  // ✅ Good: Compute on render
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.includes(filter))
      .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
  }, [products, filter, sortOrder]);
  
  return <div>{filteredProducts.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}

// Pattern 2: Reducer pattern for complex state
function ShoppingCart() {
  const [state, setState] = useState({
    items: [],
    discount: 0,
    shippingCost: 0
  });
  
  // ❌ Complex: Multiple setState calls
  const addItemComplicated = (item) => {
    setState(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    setState(prev => ({
      ...prev,
      shippingCost: calculateShipping(prev.items.length + 1)
    }));
  };
  
  // ✅ Better: Single setState with all changes
  const addItemBetter = (item) => {
    setState(prev => {
      const newItems = [...prev.items, item];
      return {
        ...prev,
        items: newItems,
        shippingCost: calculateShipping(newItems.length)
      };
    });
  };
  
  // ✅ Best: Use useReducer for complex state logic
  // (See state-management section for useReducer examples)
}

// Pattern 3: Lifting state with context
function FilterableProductTable() {
  const [searchText, setSearchText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  return (
    <div>
      <SearchBar
        searchText={searchText}
        inStockOnly={inStockOnly}
        onSearchTextChange={setSearchText}
        onInStockOnlyChange={setInStockOnly}
      />
      <ProductTable
        searchText={searchText}
        inStockOnly={inStockOnly}
      />
    </div>
  );
}

// Pattern 4: Prop drilling solution
function UserProfile() {
  const [theme, setTheme] = useState('light');
  
  // ❌ Prop drilling through many levels
  return (
    <Layout theme={theme}>
      <Sidebar theme={theme}>
        <Menu theme={theme}>
          <MenuItem theme={theme} />
        </Menu>
      </Sidebar>
    </Layout>
  );
  
  // ✅ Better: Context API or composition
  // See context/composition examples
}
```

</details>

<details>
<summary>State update gotchas</summary>
```jsx
function StateGotchas() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([1, 2, 3]);
  
  // Gotcha 1: Stale closure
  const handleClickWrong = () => {
    setTimeout(() => {
      setCount(count + 1); // Uses stale count value
    }, 1000);
  };
  
  const handleClickCorrect = () => {
    setTimeout(() => {
      setCount(c => c + 1); // Uses current value
    }, 1000);
  };
  
  // Gotcha 2: Object mutation detection
  const handleObjectMutation = () => {
    const user = { name: 'Alice' };
    setUser(user);
    
    // Later...
    user.name = 'Bob';
    setUser(user); // ❌ React won't detect change (same reference)
    
    setUser({ ...user, name: 'Bob' }); // ✅ New reference
  };
  
  // Gotcha 3: Array methods
  const handleArrayMethods = () => {
    // ❌ Mutating methods
    items.push(4);    // Mutates
    items.pop();      // Mutates
    items.sort();     // Mutates
    items.reverse();  // Mutates
    setItems(items);  // Won't trigger re-render
    
    // ✅ Non-mutating methods
    setItems([...items, 4]);           // push
    setItems(items.slice(0, -1));      // pop
    setItems([...items].sort());       // sort
    setItems([...items].reverse());    // reverse
  };
  
  // Gotcha 4: Batching outside React event handlers
  const handleNonReactEvent = () => {
    // React 17: Not batched
    fetch('/api').then(() => {
      setCount(1);  // Render
      setCount(2);  // Render again
    });
    
    // React 18: Automatic batching everywhere
    // Both updates batched into single render
  };
  
  // Gotcha 5: setState doesn't merge
  const [state, setState] = useState({ a: 1, b: 2 });
  
  const updateA = () => {
    setState({ a: 10 }); // ❌ Loses b!
    setState({ ...state, a: 10 }); // ✅ Preserves b
  };
}
```

</details>
