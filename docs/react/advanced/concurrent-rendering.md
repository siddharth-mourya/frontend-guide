# Concurrent Rendering in React

## Overview

Concurrent rendering enables React to work on multiple versions of the UI simultaneously, interrupt low-priority work for urgent updates, and provide a more responsive user experience.

## What is Concurrent Rendering?

Concurrent rendering allows React to:
- **Interrupt rendering**: Pause work on low-priority updates
- **Prioritize updates**: Handle urgent updates first
- **Prepare multiple versions**: Work on UI off-screen
- **Coordinate updates**: Batch and schedule work efficiently

## Enabling Concurrent Features

```javascript
// React 18+ - Concurrent features enabled by default
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Legacy mode (no concurrent features)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
```

## useTransition Hook

Marks updates as non-urgent, allowing React to keep the UI responsive.

### Basic Usage

```javascript
import { useState, useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  function handleChange(e) {
    const value = e.target.value;
    
    // Urgent: Update input immediately
    setQuery(value);
    
    // Non-urgent: Update results (can be interrupted)
    startTransition(() => {
      const filtered = filterResults(value);
      setResults(filtered);
    });
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  );
}
```

### With API Calls

```javascript
function AsyncSearch() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  async function handleSearch(value) {
    setQuery(value);
    
    startTransition(async () => {
      const response = await fetch(`/api/search?q=${value}`);
      const results = await response.json();
      setData(results);
    });
  }
  
  return (
    <>
      <SearchInput onSearch={handleSearch} value={query} />
      {isPending ? (
        <LoadingState />
      ) : (
        <Results data={data} />
      )}
    </>
  );
}
```

### List Filtering Example

```javascript
function FilterableList({ items }) {
  const [filter, setFilter] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isPending, startTransition] = useTransition();
  
  function handleFilterChange(value) {
    // Update input immediately
    setFilter(value);
    
    // Update list in transition (interruptible)
    startTransition(() => {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    });
  }
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={e => handleFilterChange(e.target.value)}
        // Input stays responsive even during heavy filtering
      />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {filteredItems.map(item => (
          <ListItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
```

### Tab Switching Pattern

```javascript
function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isPending, startTransition] = useTransition();
  
  function selectTab(tab) {
    startTransition(() => {
      // Heavy component rendering doesn't block UI
      setActiveTab(tab);
    });
  }
  
  return (
    <>
      <TabButtons
        tabs={tabs}
        activeTab={activeTab}
        onSelect={selectTab}
        // Buttons remain clickable even if transition is slow
      />
      <div style={{ opacity: isPending ? 0.8 : 1 }}>
        <TabContent tab={activeTab} />
      </div>
    </>
  );
}
```

## useDeferredValue Hook

Creates a "lagged" version of a value that updates with lower priority.

### Basic Usage

```javascript
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // query updates immediately
  // deferredQuery updates with lower priority
  
  return (
    <>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        // Input stays responsive
      />
      <SearchResults query={deferredQuery} />
      {/* Results update when React has time */}
    </>
  );
}
```

### With Heavy Rendering

```javascript
function HeavyList({ items }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);
  
  // Filter with deferred value
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [items, deferredFilter]);
  
  // Show loading state when deferred value is lagging
  const isStale = filter !== deferredFilter;
  
  return (
    <>
      <input 
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {filteredItems.map(item => (
          <ExpensiveItem key={item.id} {...item} />
        ))}
      </div>
    </>
  );
}
```

### Debouncing vs useDeferredValue

```javascript
// Traditional debouncing
function DebouncedSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);
  
  // Fixed delay, always waits
  return <Results query={debouncedQuery} />;
}

// useDeferredValue - adaptive
function DeferredSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // No fixed delay, updates when React has time
  // On fast devices, updates quickly
  // On slow devices, prioritizes input responsiveness
  return <Results query={deferredQuery} />;
}
```

### Optimistic UI with Deferred Value

```javascript
function OptimisticList({ items }) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  const deferredItems = useDeferredValue(optimisticItems);
  
  function addItem(newItem) {
    // Immediately show in UI (optimistic)
    setOptimisticItems(prev => [...prev, newItem]);
    
    // Send to server
    saveItem(newItem).catch(() => {
      // Rollback on error
      setOptimisticItems(items);
    });
  }
  
  const isUpdating = optimisticItems !== deferredItems;
  
  return (
    <>
      <AddItemButton onAdd={addItem} />
      <div style={{ opacity: isUpdating ? 0.7 : 1 }}>
        {deferredItems.map(item => (
          <Item key={item.id} {...item} />
        ))}
      </div>
    </>
  );
}
```

## useTransition vs useDeferredValue

```javascript
// useTransition - control when state updates
function TransitionExample() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();
  
  function selectTab(newTab) {
    startTransition(() => {
      setTab(newTab); // This update is deferred
    });
  }
  
  return <Tabs activeTab={tab} onSelect={selectTab} />;
}

// useDeferredValue - create deferred version of value
function DeferredExample({ tab }) {
  const deferredTab = useDeferredValue(tab);
  
  return <TabContent tab={deferredTab} />;
}

// When to use which?
// - useTransition: You control the state update
// - useDeferredValue: You receive props/value from parent
```

## Suspense for Data Fetching

Concurrent rendering enables new Suspense patterns:

```javascript
import { Suspense } from 'react';

// Resource-based data fetching
function ProfilePage({ userId }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails userId={userId} />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts userId={userId} />
      </Suspense>
    </Suspense>
  );
}

// Component suspends while loading
function ProfileDetails({ userId }) {
  const user = use(fetchUser(userId)); // Suspends here
  return <div>{user.name}</div>;
}
```

### Transition with Suspense

```javascript
function App() {
  const [userId, setUserId] = useState(1);
  const [isPending, startTransition] = useTransition();
  
  function selectUser(id) {
    startTransition(() => {
      // Keep showing old content while loading
      setUserId(id);
    });
  }
  
  return (
    <>
      <UserList onSelect={selectUser} />
      <Suspense fallback={<ProfileSkeleton />}>
        <div style={{ opacity: isPending ? 0.6 : 1 }}>
          <Profile userId={userId} />
        </div>
      </Suspense>
    </>
  );
}
```

## Automatic Batching

React 18 automatically batches updates in concurrent features:

```javascript
// React 17 - Only events batched
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched - single render
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // NOT batched - two renders
}, 1000);

// React 18 - Everything batched
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched!
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched!
});
```

### Opting Out of Batching

```javascript
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  }); // Force immediate render
  
  flushSync(() => {
    setFlag(f => !f);
  }); // Force immediate render
  
  // Two separate renders
}
```

## Priority Levels

Concurrent React has multiple priority levels:

```javascript
// Discrete events (clicks, keypresses) - Immediate
onClick={() => setCount(count + 1)}

// Continuous events (scroll, mousemove) - High priority
onScroll={() => setScrollPos(window.scrollY)}

// Default updates - Normal priority
useEffect(() => setData(fetchedData), [fetchedData])

// Transitions - Low priority
startTransition(() => setTab('new-tab'))

// Deferred values - Lowest priority
const deferred = useDeferredValue(value)
```

## Practical Patterns

### Responsive Input with Heavy Rendering

```javascript
function DataGrid({ data }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const deferredQuery = useDeferredValue(query);
  const deferredSort = useDeferredValue(sortKey);
  
  const processedData = useMemo(() => {
    // Heavy computation
    let result = data.filter(item =>
      item.name.includes(deferredQuery)
    );
    result = sortBy(result, deferredSort);
    return result;
  }, [data, deferredQuery, deferredSort]);
  
  const isProcessing = 
    query !== deferredQuery || 
    sortKey !== deferredSort;
  
  return (
    <>
      <SearchInput 
        value={query}
        onChange={setQuery}
        // Always responsive
      />
      <SortButtons
        active={sortKey}
        onSort={setSortKey}
        // Always responsive
      />
      <div style={{ opacity: isProcessing ? 0.5 : 1 }}>
        <Grid data={processedData} />
      </div>
    </>
  );
}
```

### Progressive Enhancement

```javascript
function ProgressiveList({ items }) {
  const [visibleCount, setVisibleCount] = useState(20);
  const [isPending, startTransition] = useTransition();
  
  function loadMore() {
    startTransition(() => {
      setVisibleCount(c => c + 20);
    });
  }
  
  return (
    <>
      {items.slice(0, visibleCount).map(item => (
        <Item key={item.id} {...item} />
      ))}
      <button 
        onClick={loadMore}
        disabled={isPending}
      >
        {isPending ? 'Loading...' : 'Load More'}
      </button>
    </>
  );
}
```

### Smart Loading States

```javascript
function SmartLoadingList({ items }) {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState(items);
  
  function updateFilter(value) {
    setFilter(value);
    
    startTransition(() => {
      // Simulate heavy filtering
      const results = items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    });
  }
  
  return (
    <>
      <input value={filter} onChange={e => updateFilter(e.target.value)} />
      {isPending ? (
        // Show brief spinner only for slow transitions
        <DelayedSpinner delay={300} />
      ) : (
        <Results items={searchResults} />
      )}
    </>
  );
}

function DelayedSpinner({ delay }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return show ? <Spinner /> : null;
}
```

## Concurrent Mode Caveats

### Effects Run Once Per Commit

```javascript
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Runs once after commit, even if render phase
    // was interrupted and restarted multiple times
    console.log('Committed:', count);
  });
  
  // This might run multiple times during render phase
  console.log('Rendering:', count);
  
  return <div>{count}</div>;
}
```

### Avoid Mutations in Render

```javascript
// ❌ WRONG - Race conditions in concurrent mode
let cache = new Map();

function Component({ id }) {
  if (!cache.has(id)) {
    cache.set(id, fetchData(id)); // Mutation during render!
  }
  return <div>{cache.get(id)}</div>;
}

// ✅ CORRECT - Use refs or state
function Component({ id }) {
  const cache = useRef(new Map());
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (!cache.current.has(id)) {
      fetchData(id).then(result => {
        cache.current.set(id, result);
        setData(result);
      });
    } else {
      setData(cache.current.get(id));
    }
  }, [id]);
  
  return <div>{data}</div>;
}
```

## Interview Questions

### Q: What is concurrent rendering?

**A**: Concurrent rendering allows React to work on multiple UI versions simultaneously, interrupt low-priority work for urgent updates, and keep the UI responsive. It uses techniques like time-slicing and priority-based scheduling to coordinate updates.

### Q: When should you use useTransition?

**A**: Use `useTransition` when you want to mark state updates as non-urgent:
- Heavy list filtering that shouldn't block input
- Tab switching with expensive rendering
- Router navigation
- Any update where UI responsiveness matters more than immediate feedback

### Q: What's the difference between useTransition and useDeferredValue?

**A**: 
- `useTransition`: You control the state update and wrap it in startTransition
- `useDeferredValue`: You defer an incoming value (props or state from parent)
Use useTransition when you own the state, useDeferredValue when you receive the value.

### Q: How does concurrent rendering affect useEffect?

**A**: The render phase might run multiple times, but `useEffect` only runs once per commit. This is safe because effects run after the commit phase, when the UI is actually updated. Just ensure render functions are pure and don't have side effects.

### Q: Can you explain automatic batching in React 18?

**A**: React 18 automatically batches all state updates, even in setTimeout, promises, and native event handlers. Previously only updates in React event handlers were batched. This reduces re-renders and improves performance. Use `flushSync` to opt out if needed.

## Performance Patterns

```javascript
// Measure transition duration
function MeasuredTransition() {
  const [isPending, startTransition] = useTransition();
  
  function handleUpdate() {
    const start = performance.now();
    startTransition(() => {
      setHeavyState(newValue);
      setTimeout(() => {
        const duration = performance.now() - start;
        console.log('Transition took:', duration, 'ms');
      }, 0);
    });
  }
}

// Prioritize critical updates
function PrioritizedUpdates() {
  function handleChange(value) {
    // Critical - update immediately
    setInputValue(value);
    
    // Non-critical - can be interrupted
    startTransition(() => {
      setSearchResults(filter(value));
    });
  }
}
```

## Key Takeaways

- Concurrent rendering enables interruptible, prioritized updates
- `useTransition` marks updates as non-urgent with loading state
- `useDeferredValue` creates a lagged version of a value
- Automatic batching reduces re-renders across all async contexts
- Keep render functions pure - they may run multiple times
- Use concurrent features for better UX, not just performance
- Transitions maintain responsiveness during heavy updates
- Suspense integrates with concurrent features for seamless loading
