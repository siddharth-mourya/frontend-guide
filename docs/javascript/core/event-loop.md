# Event Loop

## ⚡ Quick Revision

- JavaScript is single-threaded with asynchronous capabilities via event loop
- Call stack: LIFO structure tracking function execution
- Task queue (macrotask): `setTimeout`, `setInterval`, I/O, UI rendering
- Microtask queue: Promises, `queueMicrotask`, `MutationObserver`
- Execution order: synchronous code → microtasks → render → macrotasks
- Microtasks always execute before next macrotask
- Each macrotask followed by all microtasks

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
// Sync code first, then microtasks (promise), then macrotasks (setTimeout)
```

**Execution phases:**
1. Execute all synchronous code
2. Execute all microtasks (until queue empty)
3. Render (if needed)
4. Execute one macrotask
5. Repeat from step 2

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JavaScript runs in a single thread to avoid race conditions and simplify programming. The event loop enables non-blocking I/O by delegating operations to browser APIs (setTimeout, fetch) and processing callbacks when operations complete.

This architecture prevents blocking the UI thread while maintaining predictable execution order.
</details>

<details>
<summary>How it works</summary>
**Architecture:**
```
┌─────────────────────────┐
│       Call Stack        │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│     Web APIs / Node     │
│  (setTimeout, fetch)    │
└──────────┬──────────────┘
           │
     ┌─────▼─────┐
     │ Callbacks │
     └─────┬─────┘
           │
    ┌──────▼───────┐
    │ Task Queue   │
    │ (Macrotasks) │
    └──────────────┘
    ┌──────────────┐
    │  Microtask   │
    │    Queue     │
    └──────────────┘
           │
           ▼
      Event Loop checks queues
```

**Detailed execution:**
```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
  Promise.resolve().then(() => console.log('C'));
}, 0);

Promise.resolve()
  .then(() => console.log('D'))
  .then(() => console.log('E'));

console.log('F');

// Output: A, F, D, E, B, C
// 1. Sync: A, F
// 2. Microtasks: D, E (promise chain completes)
// 3. Macrotask: B, then microtask C
```

**Starvation:**
- Microtasks can starve macrotasks and rendering
```javascript
function recurse() {
  Promise.resolve().then(recurse);
}
recurse();  // Infinite microtask loop, blocks rendering
```
</details>

<details>
<summary>Common misconceptions</summary>
- `setTimeout(fn, 0)` doesn't execute immediately (goes to queue)
- Promises are not "faster" than setTimeout (different queue priority)
- `async/await` uses promise microtasks under the hood
- Event loop isn't unique to browsers (Node.js has similar architecture)
- Rendering is blocked while JavaScript executes
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Predicting execution order of mixed async code
- Understanding microtask vs macrotask priority
- Explaining why UI blocks during heavy computation
- How to avoid blocking the main thread
- Difference between `setTimeout` and Promise timing
- Impact on performance and user experience
</details>
