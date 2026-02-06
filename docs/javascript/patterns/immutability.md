# Immutability

## ⚡ Quick Revision

- **Immutability:** Data cannot be modified after creation; changes create new copies
- Prevents unintended side effects, makes code predictable
- Essential for React (state updates), Redux, and functional programming
- JavaScript primitives are immutable; objects/arrays are mutable by default

**Core techniques:**
- Spread operator: `{...obj}`, `[...arr]`
- Array methods: `map`, `filter`, `reduce`, `concat`, `slice`
- Object methods: `Object.assign()`, `Object.freeze()`
- Libraries: Immer, Immutable.js

```javascript
// Mutable (BAD)
const user = { name: 'Alice', age: 25 };
user.age = 26; // Mutates original

const numbers = [1, 2, 3];
numbers.push(4); // Mutates original

// Immutable (GOOD)
const user = { name: 'Alice', age: 25 };
const updatedUser = { ...user, age: 26 }; // New object

const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4]; // New array

// React state updates (must be immutable)
// Bad
const [user, setUser] = useState({ name: 'Alice', age: 25 });
user.age = 26; // Won't trigger re-render
setUser(user);

// Good
setUser({ ...user, age: 26 });
setUser(prev => ({ ...prev, age: 26 }));

// Nested updates
const state = {
  user: {
    profile: {
      name: 'Alice'
    }
  }
};

// Bad - mutates original
state.user.profile.name = 'Bob';

// Good - immutable update
const newState = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name: 'Bob'
    }
  }
};
```

**Common immutable operations:**

```javascript
// Arrays
const arr = [1, 2, 3];

// Add
const added = [...arr, 4]; // [1, 2, 3, 4]
const prepend = [0, ...arr]; // [0, 1, 2, 3]

// Remove
const removed = arr.filter(x => x !== 2); // [1, 3]
const sliced = arr.slice(1); // [2, 3]

// Update
const updated = arr.map(x => x === 2 ? 20 : x); // [1, 20, 3]

// Objects
const obj = { a: 1, b: 2 };

// Add/Update
const updated = { ...obj, c: 3 }; // { a: 1, b: 2, c: 3 }

// Remove
const { b, ...rest } = obj; // rest = { a: 1 }
const removed = Object.fromEntries(
  Object.entries(obj).filter(([key]) => key !== 'b')
);

// Array of objects
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// Update by id
const updated = users.map(user => 
  user.id === 1 ? { ...user, name: 'Alice Smith' } : user
);

// Remove by id
const filtered = users.filter(user => user.id !== 1);
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Immutability is fundamental to predictable, maintainable code because:

1. **Predictability**: Functions don't have unexpected side effects
2. **Time-travel debugging**: Keep history of state changes
3. **Change detection**: Easy to check if data changed (reference equality)
4. **Concurrency**: Safe to share data across threads/operations
5. **Undo/redo**: Store previous states without corruption
6. **React optimization**: Shallow comparison enables `React.memo`, `PureComponent`

In React/Redux ecosystems, immutability is required for:
- State updates to trigger re-renders
- `shouldComponentUpdate` / `React.memo` optimization
- Time-travel debugging in Redux DevTools
- Predictable state management

Functional programming languages (Haskell, Elm, Clojure) enforce immutability by default. JavaScript requires discipline since objects are mutable.
</details>

<details>
<summary>How it works</summary>
**Primitive vs Reference types:**
```javascript
// Primitives (string, number, boolean, null, undefined, symbol)
// Always immutable
let x = 5;
let y = x; // Copy value
y = 10;
console.log(x); // 5 (unchanged)

// Reference types (objects, arrays)
// Mutable by default
let obj1 = { value: 5 };
let obj2 = obj1; // Copy reference
obj2.value = 10;
console.log(obj1.value); // 10 (mutated!)
```

**Shallow vs Deep copying:**
```javascript
// Shallow copy - only copies first level
const original = { a: 1, nested: { b: 2 } };
const shallow = { ...original };

shallow.a = 10; // Doesn't affect original
shallow.nested.b = 20; // MUTATES original! (same reference)

console.log(original.nested.b); // 20

// Deep copy options
// 1. JSON (limited - no functions, dates, undefined)
const deep1 = JSON.parse(JSON.stringify(original));

// 2. structuredClone (modern)
const deep2 = structuredClone(original);

// 3. Recursive copy
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepCopy(item));
  
  const copy = {};
  for (let key in obj) {
    copy[key] = deepCopy(obj[key]);
  }
  return copy;
}
```

**Immutable update patterns:**
```javascript
// Nested object update
const state = {
  users: {
    byId: {
      1: { id: 1, name: 'Alice', age: 25 },
      2: { id: 2, name: 'Bob', age: 30 }
    },
    allIds: [1, 2]
  }
};

// Update user 1's age
const newState = {
  ...state,
  users: {
    ...state.users,
    byId: {
      ...state.users.byId,
      1: {
        ...state.users.byId[1],
        age: 26
      }
    }
  }
};

// Array of objects update
const todos = [
  { id: 1, text: 'Learn React', done: false },
  { id: 2, text: 'Learn Redux', done: false }
];

// Toggle done
const toggleTodo = (todos, id) => 
  todos.map(todo => 
    todo.id === id 
      ? { ...todo, done: !todo.done }
      : todo
  );
```

**Reference equality for performance:**
```javascript
// React optimization
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});

// Immutable update - new reference, triggers re-render
setData({ ...data, value: 10 });

// Mutation - same reference, NO re-render
data.value = 10;
setData(data); // Won't update!

// Performance check
const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = obj1;

obj1 === obj2; // false (different references)
obj1 === obj3; // true (same reference)

// Shallow comparison is fast O(1)
// Deep comparison is slow O(n)
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Immer library (recommended for complex updates):**
```javascript
import produce from 'immer';

const state = {
  users: [
    { id: 1, name: 'Alice', todos: [{ text: 'Learn Immer', done: false }] }
  ]
};

// With Immer - write "mutable" code, get immutable result
const newState = produce(state, draft => {
  draft.users[0].todos[0].done = true; // Looks mutable
  draft.users.push({ id: 2, name: 'Bob', todos: [] });
});

// Without Immer - verbose
const newState = {
  ...state,
  users: [
    {
      ...state.users[0],
      todos: state.users[0].todos.map((todo, i) => 
        i === 0 ? { ...todo, done: true } : todo
      )
    },
    { id: 2, name: 'Bob', todos: [] }
  ]
};

// In React with Immer
import { useImmer } from 'use-immer';

function Component() {
  const [state, updateState] = useImmer(initialState);
  
  const handleUpdate = () => {
    updateState(draft => {
      draft.user.name = 'New Name'; // Simple mutation syntax
    });
  };
}
```

**2. Object.freeze for enforcement:**
```javascript
const obj = Object.freeze({ a: 1, b: 2 });
obj.a = 10; // Silently fails (throws in strict mode)
console.log(obj.a); // 1

// Shallow freeze only
const nested = Object.freeze({
  a: 1,
  deep: { b: 2 }
});
nested.deep.b = 20; // Works! (nested object not frozen)

// Deep freeze
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach(value => {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  });
  return obj;
}
```

**3. Performance considerations:**
```javascript
// Bad - creates new object on every render
function Component() {
  return <Child config={{ option: true }} />; // New object every time
}

// Good - stable reference
const config = { option: true };
function Component() {
  return <Child config={config} />;
}

// Or with useMemo
function Component({ value }) {
  const config = useMemo(() => ({ option: value }), [value]);
  return <Child config={config} />;
}

// Structural sharing for efficiency
// Libraries like Immer reuse unchanged parts
const original = { a: 1, b: { c: 2 } };
const updated = produce(original, draft => {
  draft.a = 10;
});
// updated.b === original.b (same reference, not copied)
```

**4. Common gotchas:**

**Array methods that mutate:**
```javascript
const arr = [1, 2, 3];

// MUTATING (BAD)
arr.push(4);
arr.pop();
arr.shift();
arr.unshift(0);
arr.splice(1, 1);
arr.reverse();
arr.sort();
arr.fill(0);

// NON-MUTATING (GOOD)
[...arr, 4]; // push
arr.slice(0, -1); // pop
arr.slice(1); // shift
[0, ...arr]; // unshift
[...arr.slice(0, 1), ...arr.slice(2)]; // splice
arr.toReversed(); // reverse (ES2023)
arr.toSorted(); // sort (ES2023)
arr.map(() => 0); // fill
```

**Object method gotchas:**
```javascript
// Object.assign mutates first argument
const obj = { a: 1 };
Object.assign(obj, { b: 2 }); // Mutates obj

// Fix: use empty object as target
const updated = Object.assign({}, obj, { b: 2 });
// Or use spread
const updated = { ...obj, b: 2 };

// Array.prototype.slice vs Array.prototype.splice
const arr = [1, 2, 3];
arr.slice(1, 2); // Returns new array, doesn't mutate
arr.splice(1, 2); // Mutates original!
```

**State update timing:**
```javascript
// React state updates are asynchronous
const [count, setCount] = useState(0);

// Bad - uses stale state
setCount(count + 1);
setCount(count + 1); // Still uses old count!
console.log(count); // Still 0! (not updated yet)

// Good - use updater function
setCount(prev => prev + 1);
setCount(prev => prev + 1); // Works correctly
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about immutability:**

1. **Definition**: "Immutability means data structures cannot be modified after creation. Instead of changing existing data, we create new copies with the desired changes."

2. **Why it matters**:
   - Predictable code without side effects
   - Efficient change detection (reference equality)
   - Required for React state updates and optimization
   - Enables time-travel debugging and undo/redo
   - Safe concurrent operations

3. **React-specific importance**:
   - State updates must return new references to trigger re-renders
   - `React.memo` and `PureComponent` use shallow comparison
   - Prevents bugs from shared mutable state
   - Enables Redux DevTools time-travel

4. **Common patterns**:
   - Spread operator for shallow copies
   - Array methods: `map`, `filter`, `slice`, `concat`
   - Avoid: `push`, `pop`, `splice`, `sort`, `reverse`
   - Immer for complex nested updates

5. **Trade-offs**:
   - **Pro**: Predictable, debuggable, optimizable code
   - **Pro**: No unintended mutations
   - **Con**: Memory overhead from copying
   - **Con**: Verbose for deeply nested updates
   - **Con**: Learning curve for new developers

6. **Performance**:
   - Structural sharing minimizes copying (Immer, Immutable.js)
   - Reference equality checks are O(1) vs deep equality O(n)
   - Copying small objects is negligible
   - Use `useMemo` to prevent unnecessary object creation

**Example answer**: "Immutability is critical in React because state updates must return new references to trigger re-renders. I use spread operators for shallow updates and Immer for complex nested state. The key benefit is predictable change detection - React can use reference equality to know if data changed, which is much faster than deep comparison. This enables optimizations like `React.memo`. The trade-off is slightly more memory usage, but structural sharing in Immer means we only copy what changed. I avoid mutating methods like `push` or `splice`, and instead use `map`, `filter`, and spread operators."
</details>

<details>
<summary>Real-world examples</summary>
**1. Redux reducer (must be immutable):**
```javascript
const initialState = {
  todos: [],
  filter: 'all'
};

function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    default:
      return state;
  }
}
```

**2. React component with complex state:**
```javascript
function ShoppingCart() {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    discount: null
  });

  const addItem = (product) => {
    setCart(prev => ({
      ...prev,
      items: [...prev.items, { ...product, quantity: 1 }],
      total: prev.total + product.price
    }));
  };

  const updateQuantity = (itemId, quantity) => {
    setCart(prev => {
      const items = prev.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const total = items.reduce((sum, item) => 
        sum + item.price * item.quantity, 0
      );
      return { ...prev, items, total };
    });
  };

  const removeItem = (itemId) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      total: prev.items
        .filter(item => item.id !== itemId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
    }));
  };
}
```

**3. Using Immer for complex updates:**
```javascript
import produce from 'immer';

function FormComponent() {
  const [formState, setFormState] = useState({
    personal: {
      firstName: '',
      lastName: '',
      address: {
        street: '',
        city: '',
        zip: ''
      }
    },
    preferences: {
      newsletter: false,
      notifications: []
    }
  });

  const updateField = (path, value) => {
    setFormState(produce(draft => {
      // Use lodash-style path
      _.set(draft, path, value);
    }));
  };

  // Or specific updates
  const updateStreet = (street) => {
    setFormState(produce(draft => {
      draft.personal.address.street = street;
    }));
  };
}
```

**4. Immutable array operations:**
```javascript
const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false },
  { id: 3, name: 'Charlie', active: true }
];

// Insert at specific index
const insertAt = (arr, index, item) => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index)
];

// Move item
const moveItem = (arr, fromIndex, toIndex) => {
  const item = arr[fromIndex];
  const withoutItem = arr.filter((_, i) => i !== fromIndex);
  return insertAt(withoutItem, toIndex, item);
};

// Update multiple items
const updateMultiple = (arr, ids, updates) => 
  arr.map(item => 
    ids.includes(item.id) 
      ? { ...item, ...updates }
      : item
  );

// Bulk delete
const deleteMultiple = (arr, ids) => 
  arr.filter(item => !ids.includes(item.id));
```

**5. Normalized state structure:**
```javascript
// Redux state shape
const state = {
  entities: {
    users: {
      byId: {
        1: { id: 1, name: 'Alice', postIds: [101, 102] },
        2: { id: 2, name: 'Bob', postIds: [103] }
      },
      allIds: [1, 2]
    },
    posts: {
      byId: {
        101: { id: 101, title: 'Post 1', authorId: 1 },
        102: { id: 102, title: 'Post 2', authorId: 1 },
        103: { id: 103, title: 'Post 3', authorId: 2 }
      },
      allIds: [101, 102, 103]
    }
  }
};

// Immutable update
function updatePost(state, postId, updates) {
  return {
    ...state,
    entities: {
      ...state.entities,
      posts: {
        ...state.entities.posts,
        byId: {
          ...state.entities.posts.byId,
          [postId]: {
            ...state.entities.posts.byId[postId],
            ...updates
          }
        }
      }
    }
  };
}

// With Immer
function updatePost(state, postId, updates) {
  return produce(state, draft => {
    Object.assign(draft.entities.posts.byId[postId], updates);
  });
}
```

**6. Time-travel debugging:**
```javascript
function useTimeTravel(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const setState = (newState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newState]);
    setCurrentIndex(newHistory.length);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}
```
</details>
