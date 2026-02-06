# Components

## ⚡ Quick Revision

- Function components: Modern default, use hooks for state/lifecycle
- Class components: Legacy, use `this.state` and lifecycle methods
- Component composition: Build complex UIs from smaller components
- Children prop: Special prop for content passed between opening/closing tags
- **Pitfall**: Class components need `.bind()` or arrow functions for event handlers
- **Pitfall**: `this.props.children` can be anything: element, array, function, string

```jsx
// Function component (modern)
function Greeting({ name, children }) {
  return <div>Hello {name}! {children}</div>;
}

// Class component (legacy)
class Greeting extends React.Component {
  render() {
    return <div>Hello {this.props.name}! {this.props.children}</div>;
  }
}

// Composition pattern
function App() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardBody>Content</CardBody>
    </Card>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Component model advantages:**
1. **Reusability**: Write once, use everywhere with different props
2. **Encapsulation**: Components manage their own logic and styling
3. **Composition over inheritance**: Build complex UIs by composing simple parts
4. **Testability**: Test components in isolation
5. **Maintainability**: Changes to one component don't affect others

Function components became preferred because:
- Simpler syntax, less boilerplate
- Hooks provide all class features without `this` confusion
- Better performance (no instance creation)
- Easier to optimize by bundlers
- Better TypeScript support

</details>

<details>
<summary>How it works</summary>
**Function Components:**
```jsx
function UserCard({ user, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    console.log('User changed:', user.name);
  }, [user.name]);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => setIsEditing(true)}>Edit</button>
    </div>
  );
}

// Every render, the function runs completely
// Hooks maintain state between renders via closures
```

**Class Components:**
```jsx
class UserCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isEditing: false };
    // Need to bind or use arrow functions
    this.handleEdit = this.handleEdit.bind(this);
  }
  
  componentDidMount() {
    console.log('Mounted:', this.props.user.name);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.user.name !== this.props.user.name) {
      console.log('User changed:', this.props.user.name);
    }
  }
  
  handleEdit() {
    this.setState({ isEditing: true });
  }
  
  render() {
    return (
      <div>
        <h2>{this.props.user.name}</h2>
        <button onClick={this.handleEdit}>Edit</button>
      </div>
    );
  }
}
```

**Component Composition:**
```jsx
// Container pattern
function Card({ children, className }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

// Slot pattern (named children)
function Dialog({ title, actions, children }) {
  return (
    <div className="dialog">
      <div className="dialog-title">{title}</div>
      <div className="dialog-content">{children}</div>
      <div className="dialog-actions">{actions}</div>
    </div>
  );
}

// Usage
<Dialog
  title={<h1>Confirm</h1>}
  actions={<Button>OK</Button>}
>
  <p>Are you sure?</p>
</Dialog>

// Render props pattern
function DataProvider({ children, data }) {
  return children(data);
}

<DataProvider data={users}>
  {(users) => <UserList users={users} />}
</DataProvider>
```

**Children prop variations:**
```jsx
// Single element
<Card>
  <p>Content</p>  // children is an element
</Card>

// Multiple elements
<Card>
  <p>Para 1</p>
  <p>Para 2</p>  // children is an array
</Card>

// Text
<Card>
  Hello  // children is a string
</Card>

// Function (render props)
<Card>
  {(props) => <div>{props.data}</div>}  // children is a function
</Card>

// Manipulating children
function Wrapper({ children }) {
  return (
    <>
      {React.Children.map(children, (child, index) => 
        React.cloneElement(child, { key: index, enhanced: true })
      )}
    </>
  );
}
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"Class components are deprecated"** - They still work, just not recommended for new code
- **"Function components are stateless"** - Hooks allow state and side effects
- **"children is always an array"** - It can be a single element, string, function, etc.
- **"Composition means avoiding props"** - Composition uses props, including children
- **"Class components are faster"** - Function components are typically faster (no instance)
- **"You need a wrapper element"** - Fragments (`<>...</>`) avoid extra DOM nodes

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **When to use which**: Can you choose the right component type?
- **Composition patterns**: How do you avoid prop drilling and build reusable UIs?
- **Performance**: Understanding of when components re-render
- **Migration**: Can you convert class to function components?

Critical concepts to explain:
- **Hooks vs lifecycle**: How `useEffect` maps to lifecycle methods
- **this binding**: Why class methods need binding or arrow functions
- **Composition benefits**: Why React favors composition over inheritance
- **Children API**: `React.Children` utilities for manipulating children

Common questions:
- "What's the difference between function and class components?"
- "How would you convert this class component to a function component?"
- "Explain how the children prop works"
- "When would you use composition over configuration (props)?"
- "Why do class methods need to be bound?"
- "How do you pass data down through multiple component layers?"

Key talking points:
- Function components with hooks are now standard
- Composition through children and specialized props
- Class components require understanding `this` context
- React.Children API for advanced children manipulation

</details>

---

## 📝 Code Examples

<details>
<summary>Converting class to function component</summary>
```jsx
// Before: Class component
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this);
  }
  
  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }
  
  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`;
  }
  
  componentWillUnmount() {
    console.log('Cleanup');
  }
  
  increment() {
    this.setState(prev => ({ count: prev.count + 1 }));
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}

// After: Function component
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
    
    return () => {
      console.log('Cleanup');
    };
  }, [count]);
  
  const increment = () => {
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

</details>

<details>
<summary>Advanced composition patterns</summary>
```jsx
// Compound component pattern
const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="tabs">
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

Tabs.TabList = ({ children, activeTab, setActiveTab }) => (
  <div className="tab-list">
    {React.Children.map(children, (child, index) =>
      React.cloneElement(child, {
        isActive: activeTab === index,
        onClick: () => setActiveTab(index)
      })
    )}
  </div>
);

Tabs.Tab = ({ children, isActive, onClick }) => (
  <button className={isActive ? 'active' : ''} onClick={onClick}>
    {children}
  </button>
);

Tabs.Panel = ({ children, activeTab, index }) =>
  activeTab === index ? <div>{children}</div> : null;

// Usage
<Tabs defaultTab={0}>
  <Tabs.TabList>
    <Tabs.Tab>Tab 1</Tabs.Tab>
    <Tabs.Tab>Tab 2</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.Panel index={0}>Content 1</Tabs.Panel>
  <Tabs.Panel index={1}>Content 2</Tabs.Panel>
</Tabs>

// Higher-Order Component pattern
function withAuth(Component) {
  return function AuthComponent(props) {
    const { user, loading } = useAuth();
    
    if (loading) return <Spinner />;
    if (!user) return <Login />;
    
    return <Component {...props} user={user} />;
  };
}

const ProtectedPage = withAuth(({ user }) => (
  <div>Welcome, {user.name}</div>
));

// Render props pattern
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return render(position);
}

// Usage
<MouseTracker
  render={({ x, y }) => <div>Mouse at ({x}, {y})</div>}
/>
```

</details>
