# React 18 Hooks

## ⚡ Quick Revision

### useTransition
```tsx
import { useTransition, startTransition } from 'react';

function SearchComponent() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (value: string) => {
    setQuery(value); // Urgent update
    
    startTransition(() => {
      // Non-urgent update - can be interrupted
      setResults(searchData(value));
    });
  };
  
  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
```

### useDeferredValue
```tsx
import { useDeferredValue } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // UI stays responsive while expensive list renders
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ExpensiveList query={deferredQuery} />
    </>
  );
}
```

### useSyncExternalStore
```tsx
import { useSyncExternalStore } from 'react';

function useWindowWidth() {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    // Get current value
    () => window.innerWidth,
    // Server-side value (optional)
    () => 1024
  );
}
```

### useId
```tsx
import { useId } from 'react';

function FormField({ label, ...props }) {
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </>
  );
}
```

**Critical Facts:**
- useTransition marks updates as non-urgent (interruptible)
- useDeferredValue defers expensive computations
- useSyncExternalStore synchronizes with external state
- useId generates stable unique IDs (SSR-safe)

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Concurrent Features:**
- React 18 introduces time-slicing and prioritization
- Some updates are more urgent than others
- User interactions should never be blocked by expensive renders
- Smooth, responsive UIs even with heavy computations

**External Store Integration:**
- Modern apps use external state (Redux, Zustand, etc.)
- External stores don't follow React's update cycle
- Need synchronization to prevent tearing
- Framework-agnostic state management

**Server-Side Rendering:**
- Hydration mismatches cause errors
- Generated IDs must be consistent between server and client
- Accessibility requires stable element associations
</details>

<details>
<summary>How it works</summary>
**Concurrent rendering priorities:**
```tsx
// React's internal priority levels
const PRIORITIES = {
  IMMEDIATE: 1,     // User input, clicks
  NORMAL: 2,        // Normal updates
  LOW: 3,           // Deferred updates
  IDLE: 4           // Background tasks
};

// useTransition marks updates as LOW priority
function useTransition() {
  const [isPending, setIsPending] = useState(false);
  
  const startTransition = (callback) => {
    setIsPending(true);
    
    // Schedule with low priority
    scheduler.scheduleCallback(PRIORITIES.LOW, () => {
      callback();
      setIsPending(false);
    });
  };
  
  return [isPending, startTransition];
}
```

**Deferred value mechanism:**
```tsx
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    // Schedule update with low priority
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);
  
  return deferredValue;
}
```

**External store synchronization:**
```tsx
function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  const [{ snapshot, getSnapshot: currentGetSnapshot }, setState] = useState({
    snapshot: getSnapshot(),
    getSnapshot
  });
  
  // Update if getSnapshot changes
  if (currentGetSnapshot !== getSnapshot) {
    const newSnapshot = getSnapshot();
    setState({ snapshot: newSnapshot, getSnapshot });
  }
  
  useEffect(() => {
    const handleStoreChange = () => {
      const newSnapshot = getSnapshot();
      setState(prev => ({ ...prev, snapshot: newSnapshot }));
    };
    
    return subscribe(handleStoreChange);
  }, [subscribe, getSnapshot]);
  
  return snapshot;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"useTransition makes everything faster":**
- It makes urgent updates feel faster by deprioritizing others
- Total work remains the same, just better prioritized
- Use for expensive, non-urgent updates only

**"useDeferredValue always improves performance":**
- Only beneficial when the deferred update is expensive
- Adds overhead for simple updates
- Works best with memoization

**"useSyncExternalStore is just for libraries":**
- Useful for any external state (browser APIs, etc.)
- Prevents tearing in concurrent rendering
- Can replace custom subscription patterns

**"useId replaces uuid libraries":**
- Only for component-scoped IDs (forms, accessibility)
- Not for database keys or persistent identifiers
- Optimized for React's rendering process
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "How does useTransition improve user experience?"
2. "When would you use useDeferredValue over useTransition?"
3. "What problem does useSyncExternalStore solve?"
4. "Why is useId better than Math.random() for element IDs?"

**Advanced scenarios:**

**Search with transitions:**
```tsx
function SmartSearch() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);
  
  // Immediate feedback for typing
  const deferredQuery = useDeferredValue(query);
  
  // Heavy computation marked as non-urgent
  useEffect(() => {
    if (deferredQuery) {
      startTransition(() => {
        const searchResults = expensiveSearch(deferredQuery);
        setResults(searchResults);
      });
    }
  }, [deferredQuery]);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <div>Searching...</div>}
      <ResultList results={results} />
    </div>
  );
}
```

**Custom external store hook:**
```tsx
class WindowSizeStore {
  private listeners = new Set<() => void>();
  private size = { width: window.innerWidth, height: window.innerHeight };
  
  constructor() {
    window.addEventListener('resize', this.handleResize);
  }
  
  private handleResize = () => {
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.listeners.forEach(listener => listener());
  };
  
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = () => this.size;
  
  getServerSnapshot = () => ({ width: 1024, height: 768 });
}

const windowSizeStore = new WindowSizeStore();

function useWindowSize() {
  return useSyncExternalStore(
    windowSizeStore.subscribe,
    windowSizeStore.getSnapshot,
    windowSizeStore.getServerSnapshot
  );
}
```

**Form with useId:**
```tsx
function FormSection({ children }) {
  const sectionId = useId();
  
  return (
    <fieldset>
      <legend id={`${sectionId}-legend`}>Section Title</legend>
      <div role="group" aria-labelledby={`${sectionId}-legend`}>
        {children}
      </div>
    </fieldset>
  );
}

function FormField({ label, type = 'text', ...props }) {
  const fieldId = useId();
  const errorId = useId();
  const [error, setError] = useState('');
  
  return (
    <div>
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        type={type}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <div id={errorId} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
```

**Performance comparison:**
```tsx
// Without concurrent features - blocking
function SlowApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (value) => {
    setQuery(value);
    // This blocks the input from updating smoothly
    setResults(expensiveSearch(value));
  };
  
  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <Results data={results} />
    </>
  );
}

// With concurrent features - responsive
function FastApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    setQuery(value); // High priority - immediate feedback
    
    startTransition(() => {
      // Low priority - can be interrupted
      setResults(expensiveSearch(value));
    });
  };
  
  return (
    <>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending ? <Spinner /> : <Results data={results} />}
    </>
  );
}
```
</details>