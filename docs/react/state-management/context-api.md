# Context API

## ⚡ Quick Revision
- **Provider pattern**: Creates a context provider that wraps components to share state
- **useContext hook**: Consumes context values without prop drilling
- **Performance consideration**: Context changes trigger re-renders of all consuming components
- **Common pitfall**: Putting too much state in one context causes unnecessary re-renders
- **Optimization**: Split contexts by update frequency and usage patterns

```jsx
// Creating context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consuming context
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
React's Context API was created to solve the **prop drilling problem** - the need to pass data through multiple component layers even when intermediate components don't need the data.

**Before Context:**
```jsx
function App() {
  const [user, setUser] = useState(null);
  return <Header user={user} setUser={setUser} />;
}

function Header({ user, setUser }) {
  return <Navigation user={user} setUser={setUser} />;
}

function Navigation({ user, setUser }) {
  return <UserProfile user={user} setUser={setUser} />;
}

function UserProfile({ user, setUser }) {
  // Finally use the props
}
```

**With Context:**
```jsx
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  // Direct access without prop drilling
}
```
</details>

<details>
<summary>How it works</summary>
Context uses React's **tree traversal mechanism** to provide data:

1. **Context Creation**: `createContext()` creates a context object with a Provider and Consumer
2. **Provider Registration**: Provider component registers value in React's internal fiber tree
3. **Context Lookup**: `useContext()` traverses up the component tree to find the nearest Provider
4. **Subscription**: Components using context subscribe to value changes
5. **Re-render Propagation**: When context value changes, all consumers re-render

**Advanced Provider Pattern:**
```jsx
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const user = await authAPI.login(credentials);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout: () => setUser(null)
  }), [user, loading, login]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

**Custom Hook Pattern:**
```jsx
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Context is state management"**
- Context is a **delivery mechanism**, not state management
- State management requires useState, useReducer, or external libraries
- Context just provides a way to access state without props

**❌ "Context replaces all prop passing"**
- Props are still the primary way to pass data
- Context should be used sparingly for truly global state
- Local state should stay local

**❌ "Multiple contexts hurt performance"**
- Multiple focused contexts are better than one large context
- Only consumers of changed context re-render
- Separate contexts by concern and update frequency

**❌ "Context value object doesn't matter"**
```jsx
// ❌ Creates new object on every render
<UserContext.Provider value={{ user, setUser }}>

// ✅ Memoized value object
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"When would you use Context vs props?"**
   - Context: Authentication state, theme, user preferences
   - Props: Component-specific data, callbacks, configuration

2. **"How do you optimize Context performance?"**
   - Split contexts by concern
   - Memoize provider values
   - Use multiple contexts instead of one large context
   - Consider state colocation

3. **"What's the difference between Context and Redux?"**
   - Context: Built-in, simple provider pattern, no dev tools
   - Redux: External library, time travel debugging, middleware, predictable updates

**Performance Optimization Example:**
```jsx
// ❌ Single context causes unnecessary re-renders
const AppContext = createContext();
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  return (
    <AppContext.Provider value={{
      user, setUser,
      theme, setTheme,
      notifications, setNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ Split contexts by concern
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();
```

**Advanced Pattern - Context with Reducer:**
```jsx
const initialState = { user: null, loading: false, error: null };

function userReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authAPI.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
    }
  }, []);
  
  const value = useMemo(() => ({
    ...state,
    login
  }), [state, login]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```
</details>