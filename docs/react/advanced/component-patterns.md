# React Component Patterns

## Overview

Advanced component patterns provide flexible, reusable solutions for complex UI problems. Understanding these patterns is essential for building maintainable React applications.

## Compound Components

Components that work together to form a cohesive API, sharing implicit state.

### Basic Implementation

```javascript
// Context for shared state
const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="tab-panel">{children}</div>;
}

// Compose together
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// Usage
function App() {
  return (
    <Tabs defaultValue="home">
      <Tabs.List>
        <Tabs.Tab value="home">Home</Tabs.Tab>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel value="home">
          <h2>Home Content</h2>
        </Tabs.Panel>
        <Tabs.Panel value="profile">
          <h2>Profile Content</h2>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <h2>Settings Content</h2>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

### Accordion Example

```javascript
const AccordionContext = createContext();

function Accordion({ children, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState([]);
  
  const toggle = (value) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(value) ? [] : [value]
      );
    }
  };
  
  const isOpen = (value) => openItems.includes(value);
  
  return (
    <AccordionContext.Provider value={{ toggle, isOpen }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, children }) {
  const { isOpen } = useContext(AccordionContext);
  
  return (
    <div className={`accordion-item ${isOpen(value) ? 'open' : ''}`}>
      {children}
    </div>
  );
}

function AccordionTrigger({ value, children }) {
  const { toggle, isOpen } = useContext(AccordionContext);
  
  return (
    <button
      className="accordion-trigger"
      onClick={() => toggle(value)}
      aria-expanded={isOpen(value)}
    >
      {children}
      <span className="icon">{isOpen(value) ? '−' : '+'}</span>
    </button>
  );
}

function AccordionContent({ value, children }) {
  const { isOpen } = useContext(AccordionContext);
  
  if (!isOpen(value)) return null;
  
  return <div className="accordion-content">{children}</div>;
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

// Usage
function FAQ() {
  return (
    <Accordion allowMultiple>
      <Accordion.Item value="q1">
        <Accordion.Trigger value="q1">
          What is React?
        </Accordion.Trigger>
        <Accordion.Content value="q1">
          React is a JavaScript library for building user interfaces.
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="q2">
        <Accordion.Trigger value="q2">
          What are hooks?
        </Accordion.Trigger>
        <Accordion.Content value="q2">
          Hooks are functions that let you use state and lifecycle features.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### Benefits of Compound Components

- **Flexible API**: Components can be rearranged
- **Implicit state**: No prop drilling needed
- **Better composition**: Natural nesting structure
- **Type safety**: Easier to type with TypeScript

```javascript
// Easy to customize layout
<Tabs>
  <div className="custom-layout">
    <Tabs.List />
    <Tabs.Panels />
  </div>
</Tabs>

// Or
<Tabs>
  <Tabs.Panels />
  <Tabs.List />
</Tabs>
```

## Render Props Pattern

Pass a function as a prop to share code between components.

### Basic Implementation

```javascript
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return render(position);
}

// Usage
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          Mouse position: {x}, {y}
        </div>
      )}
    />
  );
}

// Or with children as function
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return children(position);
}

// Usage
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <div>Mouse: {x}, {y}</div>
      )}
    </MouseTracker>
  );
}
```

### Data Fetching with Render Props

```javascript
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);
  
  return render({ data, loading, error });
}

// Usage
function UserProfile({ userId }) {
  return (
    <DataFetcher
      url={`/api/users/${userId}`}
      render={({ data, loading, error }) => {
        if (loading) return <Spinner />;
        if (error) return <Error message={error.message} />;
        return <Profile user={data} />;
      }}
    />
  );
}
```

### List Virtualization Example

```javascript
function VirtualList({ items, height, itemHeight, children }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + height) / itemHeight);
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  const offsetY = visibleStart * itemHeight;
  
  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            children(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
}

// Usage
function LargeList() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i}`
  }));
  
  return (
    <VirtualList items={items} height={600} itemHeight={50}>
      {(item, index) => (
        <div key={item.id} style={{ height: 50 }}>
          {index}: {item.text}
        </div>
      )}
    </VirtualList>
  );
}
```

## Higher-Order Components (HOC)

Function that takes a component and returns a new component with enhanced functionality.

### Basic HOC

```javascript
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    
    if (loading) return <Spinner />;
    if (!user) return <Redirect to="/login" />;
    
    return <Component {...props} user={user} />;
  };
}

// Usage
function Dashboard({ user }) {
  return <h1>Welcome, {user.name}</h1>;
}

const AuthenticatedDashboard = withAuth(Dashboard);
```

### HOC with Configuration

```javascript
function withLogger(Component, { events = [] } = {}) {
  return function LoggedComponent(props) {
    useEffect(() => {
      console.log('Component mounted:', Component.name);
      return () => console.log('Component unmounted:', Component.name);
    }, []);
    
    const wrappedProps = { ...props };
    
    events.forEach(eventName => {
      const originalHandler = props[eventName];
      wrappedProps[eventName] = (...args) => {
        console.log(`Event ${eventName}:`, args);
        originalHandler?.(...args);
      };
    });
    
    return <Component {...wrappedProps} />;
  };
}

// Usage
const LoggedButton = withLogger(Button, { events: ['onClick', 'onHover'] });
```

### Composing HOCs

```javascript
function withAuth(Component) {
  return props => {
    const { user } = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />;
  };
}

function withTheme(Component) {
  return props => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

function withAnalytics(Component) {
  return props => {
    useEffect(() => {
      analytics.track('component_view', { component: Component.name });
    }, []);
    return <Component {...props} />;
  };
}

// Compose manually
const EnhancedDashboard = withAuth(withTheme(withAnalytics(Dashboard)));

// Or use compose utility
function compose(...fns) {
  return fns.reduce((f, g) => (...args) => f(g(...args)));
}

const EnhancedDashboard = compose(
  withAuth,
  withTheme,
  withAnalytics
)(Dashboard);
```

### HOC Best Practices

```javascript
// ✅ Pass through props
function withExtraProps(Component) {
  return function Enhanced(props) {
    return <Component {...props} extra="value" />;
  };
}

// ✅ Hoist static methods
import hoistNonReactStatics from 'hoist-non-react-statics';

function withLogging(Component) {
  function Enhanced(props) {
    console.log('Rendering');
    return <Component {...props} />;
  }
  
  hoistNonReactStatics(Enhanced, Component);
  return Enhanced;
}

// ✅ Set display name for debugging
function withData(Component) {
  function Enhanced(props) {
    const data = useFetchData();
    return <Component {...props} data={data} />;
  }
  
  Enhanced.displayName = `withData(${Component.displayName || Component.name})`;
  return Enhanced;
}

// ❌ Don't use HOCs in render
function Parent() {
  // WRONG - Creates new component every render
  const EnhancedChild = withAuth(Child);
  return <EnhancedChild />;
}

// ✅ Apply HOC outside render
const EnhancedChild = withAuth(Child);

function Parent() {
  return <EnhancedChild />;
}
```

## Headless UI Pattern

Components that provide logic without rendering, giving full control over presentation.

### Headless Toggle

```javascript
function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);
  
  const toggle = () => setIsOn(prev => !prev);
  const setOn = () => setIsOn(true);
  const setOff = () => setIsOn(false);
  
  return { isOn, toggle, setOn, setOff };
}

// Usage
function CustomSwitch() {
  const { isOn, toggle } = useToggle(false);
  
  return (
    <button
      onClick={toggle}
      className={`switch ${isOn ? 'on' : 'off'}`}
      aria-pressed={isOn}
    >
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

### Headless Dropdown

```javascript
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setSelectedIndex(-1);
  };
  const toggle = () => setIsOpen(prev => !prev);
  
  // Keyboard navigation
  const handleKeyDown = (e, itemCount) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < itemCount - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          // Trigger selection
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
    }
  };
  
  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClick(e) {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        close();
      }
    }
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    selectedIndex,
    triggerRef,
    menuRef,
    handleKeyDown
  };
}

// Usage
function CustomDropdown({ items }) {
  const {
    isOpen,
    toggle,
    selectedIndex,
    triggerRef,
    menuRef,
    handleKeyDown
  } = useDropdown();
  
  return (
    <div className="dropdown">
      <button
        ref={triggerRef}
        onClick={toggle}
        onKeyDown={e => handleKeyDown(e, items.length)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Select Option
      </button>
      
      {isOpen && (
        <ul ref={menuRef} role="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              className={selectedIndex === index ? 'selected' : ''}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Headless Pagination

```javascript
function usePagination({ total, pageSize, initialPage = 1 }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(total / pageSize);
  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;
  
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };
  
  const nextPage = () => {
    if (canGoNext) setCurrentPage(prev => prev + 1);
  };
  
  const prevPage = () => {
    if (canGoPrev) setCurrentPage(prev => prev - 1);
  };
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  
  // Generate page numbers
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };
  
  return {
    currentPage,
    totalPages,
    canGoNext,
    canGoPrev,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    pageNumbers: getPageNumbers()
  };
}

// Usage
function DataTable({ data }) {
  const pagination = usePagination({
    total: data.length,
    pageSize: 10
  });
  
  const visibleData = data.slice(
    pagination.startIndex,
    pagination.endIndex
  );
  
  return (
    <>
      <table>
        {visibleData.map(row => (
          <tr key={row.id}>
            <td>{row.name}</td>
          </tr>
        ))}
      </table>
      
      <div className="pagination">
        <button
          onClick={pagination.prevPage}
          disabled={!pagination.canGoPrev}
        >
          Previous
        </button>
        
        {pagination.pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`dots-${index}`}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => pagination.goToPage(page)}
              className={page === pagination.currentPage ? 'active' : ''}
            >
              {page}
            </button>
          )
        )}
        
        <button
          onClick={pagination.nextPage}
          disabled={!pagination.canGoNext}
        >
          Next
        </button>
      </div>
    </>
  );
}
```

## Controlled vs Uncontrolled Pattern

### Fully Controlled

```javascript
function ControlledInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

// Usage - parent controls state
function Form() {
  const [name, setName] = useState('');
  return <ControlledInput value={name} onChange={setName} />;
}
```

### Fully Uncontrolled

```javascript
function UncontrolledInput({ defaultValue }) {
  const inputRef = useRef();
  
  const getValue = () => inputRef.current.value;
  
  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
    />
  );
}

// Usage - component owns state
function Form() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log(inputRef.current.getValue());
  };
  
  return (
    <>
      <UncontrolledInput ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

### Hybrid (Controlled if prop provided)

```javascript
function FlexibleInput({ value: controlledValue, onChange, defaultValue = '' }) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const handleChange = (newValue) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };
  
  return (
    <input
      value={value}
      onChange={e => handleChange(e.target.value)}
    />
  );
}

// Can be used both ways
function Examples() {
  const [controlled, setControlled] = useState('');
  
  return (
    <>
      {/* Controlled */}
      <FlexibleInput value={controlled} onChange={setControlled} />
      
      {/* Uncontrolled */}
      <FlexibleInput defaultValue="initial" />
    </>
  );
}
```

## Provider Pattern

Share data deeply without prop drilling.

```javascript
// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={theme}>
      <button onClick={toggleTheme}>Toggle</button>
    </header>
  );
}
```

## Interview Questions

### Q: When would you use compound components?

**A**: Use compound components when you want to:
- Create flexible APIs where components can be rearranged
- Share state implicitly between related components
- Build complex UI like tabs, accordions, or menus
- Provide better composition and developer experience
Example: Radix UI, Reach UI libraries use this pattern extensively.

### Q: What are the drawbacks of HOCs?

**A**: HOCs have several limitations:
- Wrapper hell: Multiple HOCs create deep nesting
- Prop collisions: Multiple HOCs might use same prop names
- Static composition: Can't be applied conditionally
- Debugging difficulty: Stack traces show wrapper components
Hooks largely replace HOCs in modern React.

### Q: Render props vs Hooks - which to use?

**A**: Hooks are generally preferred now because they:
- Avoid nesting hell
- Are more composable
- Have simpler syntax
- Are easier to test

Use render props when you need render-time flexibility or building library components that consumers style themselves.

### Q: What is the headless UI pattern?

**A**: Headless UI separates logic from presentation. Components handle state, accessibility, and keyboard navigation but render nothing (or accept render props). This gives consumers complete styling control. Examples: Headless UI, Downshift, React Table.

### Q: Controlled vs Uncontrolled - when to use each?

**A**: 
- **Controlled**: Use when you need to validate, format, or coordinate with other state. Gives full control but requires more code.
- **Uncontrolled**: Use for simple forms where you only need values on submit. Less code but less control.
- **Hybrid**: Best of both - controlled when prop provided, uncontrolled otherwise.

## Pattern Comparison

```javascript
// Compound Components - Best for related components
<Menu>
  <Menu.Button>Options</Menu.Button>
  <Menu.Items>
    <Menu.Item>Edit</Menu.Item>
  </Menu.Items>
</Menu>

// Render Props - Best for flexibility
<DataFetcher url="/api">
  {({ data }) => <Display data={data} />}
</DataFetcher>

// HOC - Best for cross-cutting concerns
const Enhanced = withAuth(withTheme(Component));

// Headless - Best for maximum customization
const { isOpen, toggle } = useDropdown();

// Provider - Best for deep data sharing
<ThemeProvider>
  <App />
</ThemeProvider>
```

## Key Takeaways

- **Compound Components**: Flexible, implicit state sharing
- **Render Props**: Flexible rendering, now mostly replaced by hooks
- **HOC**: Cross-cutting concerns, now mostly replaced by hooks
- **Headless UI**: Complete presentation control
- **Controlled/Uncontrolled**: Balance between control and simplicity
- **Provider**: Deep data sharing without prop drilling
- Choose patterns based on use case and flexibility needs
