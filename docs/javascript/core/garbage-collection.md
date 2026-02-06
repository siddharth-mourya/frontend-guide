# Garbage Collection

## ⚡ Quick Revision

- **GC**: Automatic memory management that reclaims unused memory
- **Reachability**: Object is kept if accessible from root references
- **Mark-and-Sweep**: Primary GC algorithm in JavaScript engines
- **Reference Counting**: Older algorithm with circular reference problem
- **Memory Leaks**: Unintentional retention of memory
- **WeakMap/WeakSet**: Don't prevent garbage collection

### Key Points

- JavaScript uses automatic garbage collection (no manual memory management)
- Objects are collected when no longer reachable from root
- Roots include global variables, call stack, closures
- Circular references handled by mark-and-sweep
- Memory leaks happen when references are unintentionally retained
- Modern engines use generational GC for optimization

### Reachability Concept

```javascript
// Reachable - won't be collected
let user = { name: 'John' };
let admin = user; // Two references

user = null; // Still reachable via 'admin'
console.log(admin.name); // 'John'

admin = null; // Now unreachable, will be collected

// Unreachable - will be collected
function createObject() {
  let obj = { data: 'temp' };
  // obj is local, becomes unreachable when function returns
}

createObject(); // obj is collected after execution
```

### Common Memory Leaks

```javascript
// Leak 1: Accidental global variables
function leak() {
  accidentalGlobal = 'Oops'; // No var/let/const - creates global!
}

// Leak 2: Forgotten timers
const data = loadHugeData();
setInterval(() => {
  console.log(data); // data retained forever!
}, 1000);

// Fix: Clear timer when done
const timerId = setInterval(() => {
  console.log(data);
}, 1000);
clearInterval(timerId);

// Leak 3: Event listeners not removed
element.addEventListener('click', handler);
// Later, even if element is removed from DOM:
// handler still references element!

// Fix: Remove listener
element.removeEventListener('click', handler);

// Leak 4: Closures retaining large data
function outer() {
  const largeData = new Array(1000000);
  
  return function inner() {
    console.log('hello'); // Doesn't use largeData
    // But largeData still retained by closure!
  };
}

// Fix: Set to null when done
function outer() {
  let largeData = new Array(1000000);
  
  return function inner() {
    const data = largeData;
    largeData = null; // Allow GC
    return data;
  };
}
```

### WeakMap and WeakSet

```javascript
// Regular Map prevents GC
const map = new Map();
let obj = { data: 'important' };
map.set(obj, 'metadata');

obj = null; // Object NOT collected (Map still references it)

// WeakMap allows GC
const weakMap = new WeakMap();
let obj2 = { data: 'important' };
weakMap.set(obj2, 'metadata');

obj2 = null; // Object CAN be collected (WeakMap doesn't prevent it)

// Use case: Private data
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  getName() {
    return privateData.get(this).name;
  }
}

let user = new User('Alice');
console.log(user.getName()); // 'Alice'
user = null; // Both User instance and private data collected
```

### Common Pitfalls

```javascript
// Pitfall 1: Detached DOM nodes
let element = document.getElementById('myDiv');
document.body.removeChild(element);
// element still referenced, DOM node not collected!

// Fix: Set to null
element = null;

// Pitfall 2: Console.log in production
const hugeArray = new Array(1000000).fill('data');
console.log(hugeArray); // DevTools keeps reference!

// Pitfall 3: Circular references in old browsers
// (Modern engines handle this fine with mark-and-sweep)
function createCircular() {
  const obj1 = {};
  const obj2 = {};
  obj1.ref = obj2;
  obj2.ref = obj1;
  // In old IE, this leaked memory
  // Modern engines: no problem
}

// Pitfall 4: Large closures
function createHandlers() {
  const largeData = new Array(1000000);
  
  return {
    handler1: () => console.log(largeData[0]),
    handler2: () => console.log('hi') // Still retains largeData!
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Manual Memory Management Problems

**C/C++ Style**
```c
// Manual allocation and deallocation
int* ptr = (int*)malloc(sizeof(int));
*ptr = 42;
free(ptr); // Must remember to free!

// Problems:
// 1. Memory leaks (forgot to free)
// 2. Double free bugs
// 3. Use after free
// 4. Dangling pointers
```

**JavaScript's Solution: Automatic GC**
```javascript
// Automatic memory management
let obj = { data: 'value' }; // Allocated
obj = null; // Marked for collection

// No explicit free() needed
// No dangling pointers
// No double-free bugs
```

### Benefits of Garbage Collection

1. **Safety**: No manual deallocation errors
2. **Productivity**: Focus on logic, not memory management
3. **Correctness**: Prevents memory corruption
4. **Abstraction**: Don't need to track object lifetimes

### Trade-offs

1. **Performance overhead**: GC pauses execution
2. **Less control**: Can't control when collection happens
3. **Memory pressure**: May hold memory longer than needed
4. **Unpredictable pauses**: Can affect real-time apps

### Evolution

**Early JavaScript (1995-2000)**
- Simple reference counting
- Circular reference leaks

**Modern Engines (2008+)**
- Mark-and-sweep algorithm
- Generational collection
- Incremental marking
- Concurrent/parallel collection
</details>

<details>
<summary>How it works</summary>
### Mark-and-Sweep Algorithm

```javascript
// Conceptual explanation

// 1. MARK PHASE
// Start from roots and mark all reachable objects

// Roots:
// - Global variables
// - Current call stack
// - Active closures

let global = { name: 'global' };

function outer() {
  let local = { name: 'local' };
  
  function inner() {
    console.log(local); // local is reachable via closure
  }
  
  return inner;
}

const fn = outer();

// Reachability graph:
// Root -> global (marked)
// Root -> fn -> local (marked)

// 2. SWEEP PHASE
// Collect all unmarked objects

let temp = { name: 'temp' };
temp = null; // Not reachable, unmarked, collected
```

### Generational Hypothesis

```javascript
// Observation: Most objects die young
// Solution: Separate young and old objects

// YOUNG GENERATION (frequent, fast collection)
function createTemporary() {
  const temp = { data: 'short-lived' };
  return temp.data;
}
createTemporary(); // temp collected quickly

// OLD GENERATION (infrequent, thorough collection)
const longLived = { data: 'persistent' };
// Survives multiple GC cycles
// Promoted to old generation
// Collected less frequently
```

### Reference Counting (Legacy)

```javascript
// Old algorithm (not used in modern engines)

// Each object has reference count
let obj = { data: 'value' }; // count = 1
let ref = obj; // count = 2
ref = null; // count = 1
obj = null; // count = 0, collected

// Problem: Circular references
function createCircular() {
  const a = {};
  const b = {};
  a.ref = b; // a.refCount = 1
  b.ref = a; // b.refCount = 1
  
  // Even if function returns, both have refCount > 0
  // Never collected in reference counting!
}

// Mark-and-sweep solves this:
// - When function returns, neither a nor b is reachable from root
// - Both are unmarked in mark phase
// - Both are collected in sweep phase
```

### V8 Garbage Collection

```javascript
// V8 (Chrome, Node.js) uses:

// 1. Scavenger (Young Generation)
// - Fast, frequent (1-2ms)
// - Collects short-lived objects
// - Uses Cheney's algorithm

// 2. Mark-Sweep-Compact (Old Generation)
// - Slower, infrequent (10-100ms)
// - Collects long-lived objects
// - Compacts memory to avoid fragmentation

// 3. Incremental Marking
// - Breaks marking into small steps
// - Reduces pause times
// - Interleaves with application code

// 4. Concurrent Marking
// - Marks in background thread
// - Doesn't pause main thread
// - Improved in modern V8

// 5. Idle-time GC
// - Runs during idle periods
// - Minimizes impact on user experience
```

### Weak References

```javascript
// WeakMap: Keys don't prevent GC
const cache = new WeakMap();

function processUser(user) {
  if (cache.has(user)) {
    return cache.get(user);
  }
  
  const result = expensiveComputation(user);
  cache.set(user, result);
  return result;
}

let user = { id: 1 };
processUser(user); // Cached

user = null; // User object can be collected
             // Cache entry automatically removed

// WeakSet: Values don't prevent GC
const processedItems = new WeakSet();

function processItem(item) {
  if (processedItems.has(item)) {
    return; // Already processed
  }
  
  // Process item
  processedItems.add(item);
}

let item = { data: 'value' };
processItem(item);

item = null; // Item can be collected
            // WeakSet entry automatically removed
```

### Memory Snapshots

```javascript
// Chrome DevTools can take heap snapshots

// Before optimization
class DataManager {
  constructor() {
    this.cache = new Map(); // Prevents GC!
  }
  
  addData(key, value) {
    this.cache.set(key, value);
  }
}

// After optimization
class DataManager {
  constructor() {
    this.cache = new WeakMap(); // Allows GC!
  }
  
  addData(key, value) {
    this.cache.set(key, value);
  }
}

// Take snapshot in DevTools:
// 1. Performance tab -> Memory
// 2. Take heap snapshot
// 3. Compare before/after
// 4. Look for retained objects
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Setting to null triggers immediate collection"

**Reality**: Only makes object eligible for collection, GC runs on its own schedule

```javascript
let obj = { large: new Array(1000000) };
obj = null; // Doesn't immediately free memory!

// GC runs when:
// - Memory pressure is high
// - Idle time available
// - Periodic intervals
// - Manual trigger (not recommended in production)

// Can't force GC in browser JavaScript
// Node.js only: global.gc() if --expose-gc flag
```

### Misconception 2: "Closures always cause memory leaks"

**Reality**: Only leak if unintentionally retained

```javascript
// Not a leak - closure is expected
function createCounter() {
  let count = 0;
  return () => ++count; // Intentionally retains 'count'
}

const counter = createCounter();

// IS a leak - unintentional retention
function setupHandlers() {
  const largeData = new Array(1000000);
  
  // Handler doesn't use largeData, but retains it!
  button.addEventListener('click', () => {
    console.log('clicked');
  });
  
  // Fix: Don't capture large data in closure
}
```

### Misconception 3: "Removing DOM element releases memory"

**Reality**: JavaScript references keep DOM nodes alive

```javascript
// Leak: Keep reference after removal
let element = document.getElementById('myDiv');
element.remove();
// element variable still references DOM node!
// Node not collected until element = null

// Fix: Clear references
element = null;

// Common leak: Event handlers
const handler = () => console.log('clicked');
element.addEventListener('click', handler);
element.remove();
// Handler still references element via closure!
// Element not collected!

// Fix: Remove listener first
element.removeEventListener('click', handler);
element.remove();
element = null;
```

### Misconception 4: "WeakMap/WeakSet are just for memory"

**Reality**: Also provide semantic benefits

```javascript
// Semantic use: Private data
const privateData = new WeakMap();

class BankAccount {
  constructor(balance) {
    privateData.set(this, { balance });
  }
  
  getBalance() {
    return privateData.get(this).balance;
  }
  
  deposit(amount) {
    const data = privateData.get(this);
    data.balance += amount;
  }
}

// Can't access balance directly
const account = new BankAccount(1000);
console.log(account.balance); // undefined
console.log(account.getBalance()); // 1000
```

### Misconception 5: "Circular references always leak"

**Reality**: Modern mark-and-sweep handles them fine

```javascript
// Not a leak in modern engines
const obj1 = {};
const obj2 = {};
obj1.ref = obj2;
obj2.ref = obj1;

// When both become unreachable, both are collected
// Mark-and-sweep starts from roots, not references

// Was a leak in old IE (reference counting)
// Not a problem since IE11 (mark-and-sweep)
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "How does garbage collection work in JavaScript?"**

```javascript
// Answer with mark-and-sweep algorithm:

// 1. Mark Phase
// - Start from roots (global, stack, closures)
// - Traverse and mark all reachable objects

// 2. Sweep Phase
// - Iterate through heap
// - Collect all unmarked objects

// Example:
let global = { name: 'global' }; // Reachable from root

function example() {
  let local = { name: 'local' }; // Reachable while in stack
  return local;
}

let result = example(); // local now reachable via result
result = null; // local becomes unreachable, will be collected

// Key points:
// - Automatic, no manual deallocation
// - Based on reachability, not references
// - Handles circular references
// - Runs periodically, not immediately
```

**Q2: "What causes memory leaks in JavaScript?"**

```javascript
// 1. Unintentional global variables
function leak1() {
  forgotten = 'global'; // No let/const/var
}

// 2. Forgotten timers/intervals
const leak2 = setInterval(() => {
  const data = fetchData();
  // Even if not needed, timer keeps running
}, 1000);

// Fix: clearInterval when done

// 3. Event listeners not removed
const element = document.getElementById('btn');
element.addEventListener('click', handler);
element.remove(); // Element retained by handler!

// Fix: removeEventListener first

// 4. Closures retaining large data
function leak4() {
  const hugeArray = new Array(1000000);
  
  return function() {
    console.log('hello'); // Doesn't use hugeArray but retains it
  };
}

// Fix: Set to null when not needed

// 5. Detached DOM trees
let detached = document.createElement('div');
document.body.appendChild(detached);
document.body.removeChild(detached);
// Still referenced by 'detached' variable!

// Fix: detached = null;
```

**Q3: "Difference between WeakMap and Map?"**

```javascript
// Map: Keys prevent garbage collection
const map = new Map();
let obj = { data: 'value' };
map.set(obj, 'metadata');
obj = null; // Object NOT collected (Map keeps it alive)

// WeakMap: Keys don't prevent GC
const weakMap = new WeakMap();
let obj2 = { data: 'value' };
weakMap.set(obj2, 'metadata');
obj2 = null; // Object CAN be collected

// WeakMap limitations:
// - Only object keys (not primitives)
// - Not iterable (can't use for...of)
// - No .size property
// - No .clear() method

// Use cases:
// - Private data for objects
// - Caching computed values
// - Metadata that shouldn't prevent GC

// Example: Cache
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const result = expensiveOperation(obj);
  cache.set(obj, result);
  return result;
}
```

**Q4: "How to detect and fix memory leaks?"**

```javascript
// Detection:

// 1. Chrome DevTools Memory Profiler
// - Take heap snapshot
// - Perform action
// - Take another snapshot
// - Compare: look for growing objects

// 2. Performance Monitor
// - Watch memory over time
// - Look for sawtooth pattern (normal)
// - Look for upward trend (leak!)

// 3. Memory Timeline
// - Record timeline
// - Trigger suspected leak
// - Look for retained objects

// Common fixes:

// Fix 1: Clear event listeners
class Component {
  constructor(element) {
    this.element = element;
    this.handler = this.onClick.bind(this);
    this.element.addEventListener('click', this.handler);
  }
  
  onClick() {
    console.log('clicked');
  }
  
  destroy() {
    this.element.removeEventListener('click', this.handler);
    this.element = null;
  }
}

// Fix 2: Clear timers
class Timer {
  start() {
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }
  
  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

// Fix 3: Use WeakMap for metadata
const metadata = new WeakMap();

function addMetadata(obj, meta) {
  metadata.set(obj, meta);
  // When obj is collected, metadata automatically removed
}

// Fix 4: Break circular references
class Node {
  constructor(value) {
    this.value = value;
    this.parent = null;
    this.children = [];
  }
  
  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }
  
  destroy() {
    // Break circular references
    this.parent = null;
    this.children.forEach(child => child.destroy());
    this.children = [];
  }
}
```

**Q5: "Optimize this code for memory"**

```javascript
// Original: Memory leak
class DataCache {
  constructor() {
    this.cache = new Map();
  }
  
  add(key, data) {
    this.cache.set(key, data);
  }
  
  get(key) {
    return this.cache.get(key);
  }
}

// Problem: Cache grows indefinitely

// Solution 1: Use WeakMap (if keys are objects)
class DataCache {
  constructor() {
    this.cache = new WeakMap();
  }
  
  add(key, data) {
    if (typeof key !== 'object') {
      throw new Error('Key must be object');
    }
    this.cache.set(key, data);
  }
  
  get(key) {
    return this.cache.get(key);
  }
}

// Solution 2: LRU Cache with size limit
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  add(key, value) {
    // Remove oldest if at limit
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Add to end (most recent)
    this.cache.delete(key); // Remove if exists
    this.cache.set(key, value);
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
}

// Solution 3: Time-based expiration
class TTLCache {
  constructor(ttl = 60000) { // 1 minute default
    this.ttl = ttl;
    this.cache = new Map();
  }
  
  add(key, value) {
    const expires = Date.now() + this.ttl;
    this.cache.set(key, { value, expires });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Pro Tips for Interviews

1. **Explain mark-and-sweep**: Primary algorithm in modern engines
2. **Know generational GC**: Young vs old generation optimization
3. **Identify leaks**: Common patterns (timers, listeners, closures)
4. **Use WeakMap appropriately**: When keys shouldn't prevent GC
5. **DevTools proficiency**: Mention heap snapshots, memory timeline
6. **Real-world fixes**: LRU cache, cleanup on unmount, clearing listeners
</details>
