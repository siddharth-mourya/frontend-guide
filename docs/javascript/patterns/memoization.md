# Memoization

## ⚡ Quick Revision

- **Memoization:** Caching function results based on inputs to avoid redundant calculations
- Trade memory for speed - stores computed values in cache
- Best for expensive, pure functions with repeated calls
- JavaScript objects/Maps work as caches; WeakMap for objects to prevent memory leaks

**Use cases:**
- Recursive algorithms (Fibonacci, factorial)
- Expensive computations (data transformations)
- API responses
- React component rendering (React.memo)

```javascript
// Basic memoization
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// Usage - Fibonacci
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(50); // Fast on subsequent calls

// React.memo for component optimization
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  return <div>{/* expensive render */}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison - return true to skip re-render
  return prevProps.data.id === nextProps.data.id;
});
```

**Advanced patterns:**

```javascript
// Map-based memoization (handles complex types better)
function memoizeWithMap(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// LRU Cache with size limit
function memoizeWithLRU(fn, maxSize = 100) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value); // Move to end
      return value;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

// WeakMap for object keys (automatic GC)
function memoizeObjects(fn) {
  const cache = new WeakMap();
  
  return function(obj) {
    if (cache.has(obj)) {
      return cache.get(obj);
    }
    const result = fn.call(this, obj);
    cache.set(obj, result);
    return result;
  };
}

// Time-based cache expiration
function memoizeWithTTL(fn, ttl = 5000) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Memoization is a fundamental optimization technique that trades space for time complexity. It's essential in functional programming and performance optimization because:

1. **Eliminates redundant computation**: Repeated function calls with same inputs return cached results instantly
2. **Enables practical recursion**: Makes otherwise impractical recursive algorithms viable (e.g., Fibonacci)
3. **React performance**: `React.memo`, `useMemo`, and `useCallback` prevent unnecessary re-renders
4. **API efficiency**: Cache network responses to reduce server load and improve UX

The technique follows the principle of referential transparency - pure functions with same input always produce same output, making caching safe.
</details>

<details>
<summary>How it works</summary>
**Core mechanism:**
1. Function wrapper intercepts calls
2. Arguments serialized into cache key (typically JSON.stringify)
3. Check if key exists in cache
4. If hit: return cached value
5. If miss: execute function, store result, return result

**Cache key strategies:**
```javascript
// Simple: JSON.stringify (works for primitives, arrays, objects)
const key = JSON.stringify(args);

// Better: Handle circular references, functions
function serializeKey(args) {
  return args.map(arg => {
    if (typeof arg === 'function') return arg.toString();
    if (typeof arg === 'object') return JSON.stringify(arg);
    return String(arg);
  }).join('|');
}

// Object references: Use WeakMap (auto garbage collection)
const cache = new WeakMap();
cache.set(objectKey, value); // GC'd when object unreachable
```

**Memory management considerations:**
- Unbounded cache can cause memory leaks
- Use LRU (Least Recently Used) eviction for size limits
- WeakMap allows automatic garbage collection for object keys
- TTL (Time To Live) for time-sensitive data

**Performance trade-offs:**
```javascript
// Without memoization: O(2^n)
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// With memoization: O(n)
const memoizedFib = memoize(fibonacci);
// Each unique n computed once, subsequent calls O(1)
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. React optimization patterns:**
```javascript
// React.memo - memoize entire component
const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});

// useMemo - memoize expensive calculations
function Component({ items }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.value - b.value);
  }, [items]); // Only recompute when items change
  
  return <List items={sortedItems} />;
}

// useCallback - memoize function references
function Parent() {
  const handleClick = useCallback(() => {
    // Handler logic
  }, []); // Stable reference across renders
  
  return <Child onClick={handleClick} />;
}
```

**2. Cache invalidation:**
```javascript
// Clear cache when needed
function memoizeWithClear(fn) {
  const cache = new Map();
  
  const memoized = function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
  
  memoized.clear = () => cache.clear();
  memoized.delete = (...args) => cache.delete(JSON.stringify(args));
  
  return memoized;
}
```

**3. Multi-argument handling:**
```javascript
// Wrong: Separate args create different cache entries
const add = memoize((a, b) => a + b);
add(1, 2); // Cached as [1, 2]
add(2, 1); // Different key, not cached

// Solution: Normalize arguments if commutative
function memoizeCommutative(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args.sort());
    if (cache.has(key)) return cache.get(key);
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

**4. Gotchas:**
- **Non-pure functions**: Memoizing impure functions (with side effects, I/O, random values) produces incorrect results
- **Reference arguments**: Objects with same content but different references create cache misses
- **Memory leaks**: Unbounded caches grow indefinitely
- **Serialization cost**: JSON.stringify can be expensive for large objects
- **Context binding**: Must preserve `this` context with `apply(this, args)`

```javascript
// Bad: Impure function
const getRandomUser = memoize(() => {
  return users[Math.floor(Math.random() * users.length)];
}); // Always returns same "random" user after first call

// Bad: Reference comparison
const obj1 = { id: 1 };
const obj2 = { id: 1 };
process(obj1); // Cache miss
process(obj2); // Cache miss (different reference)
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about memoization:**

1. **Definition**: "Memoization is an optimization technique that caches function results based on arguments to avoid redundant computation."

2. **When to use**:
   - Pure functions (deterministic, no side effects)
   - Expensive computations called repeatedly with same inputs
   - Recursive algorithms (Fibonacci, factorial)
   - React component optimization

3. **Trade-offs**:
   - **Pro**: Significant speed improvements for repeated calls
   - **Pro**: Enables practical use of recursive algorithms
   - **Con**: Memory overhead for cache storage
   - **Con**: Serialization cost for complex arguments
   - **Con**: Can mask algorithmic inefficiencies

4. **React-specific**:
   - `React.memo`: Component-level memoization
   - `useMemo`: Memoize computed values
   - `useCallback`: Memoize function references
   - Critical for performance in large component trees

5. **Cache strategies**:
   - Simple object/Map for primitives
   - WeakMap for object keys (auto GC)
   - LRU cache with size limits
   - TTL for time-sensitive data

6. **Common mistakes**:
   - Memoizing impure functions
   - Not handling memory growth
   - Over-memoizing (premature optimization)
   - Ignoring serialization costs

**Example answer**: "I'd use memoization when we have expensive pure functions called repeatedly. For example, in a data dashboard, if we're computing aggregations on the same dataset, memoization prevents recalculation. In React, I use `useMemo` for expensive renders and `useCallback` to stabilize function references for child components wrapped in `React.memo`. The key consideration is memory vs. speed - we need to ensure cache doesn't grow unbounded, possibly using LRU eviction or WeakMap for garbage collection."
</details>

<details>
<summary>Real-world examples</summary>
**1. API response caching:**
```javascript
const fetchUserData = memoizeWithTTL(async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}, 60000); // Cache for 1 minute

// Multiple calls within 1 minute use cached data
await fetchUserData(123);
await fetchUserData(123); // Cached
```

**2. Complex data transformations:**
```javascript
const transformData = memoize((rawData) => {
  return rawData
    .filter(item => item.active)
    .map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }))
    .sort((a, b) => b.priority - a.priority);
});

// In React component
function Dashboard({ data }) {
  const processedData = useMemo(
    () => transformData(data),
    [data]
  );
  
  return <DataGrid data={processedData} />;
}
```

**3. Lodash memoization:**
```javascript
import memoize from 'lodash/memoize';

// Custom resolver for cache key
const getUser = memoize(
  (user) => fetchUserDetails(user.id),
  (user) => user.id // Cache key resolver
);
```

**4. Dynamic programming (Fibonacci):**
```javascript
// Without memoization: O(2^n)
// With memoization: O(n)
const fibonacci = memoize(function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fibonacci(100)); // Instant
```

**5. React component optimization:**
```javascript
// Expensive list rendering
const ListItem = React.memo(({ item, onUpdate }) => {
  return (
    <div>
      <span>{item.name}</span>
      <button onClick={() => onUpdate(item.id)}>Update</button>
    </div>
  );
});

function List({ items }) {
  // Memoize callback to prevent ListItem re-renders
  const handleUpdate = useCallback((id) => {
    updateItem(id);
  }, []);
  
  return (
    <>
      {items.map(item => (
        <ListItem key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </>
  );
}
```
</details>
