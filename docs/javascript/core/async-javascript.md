# Async JavaScript

## ⚡ Quick Revision

- Three patterns: callbacks, promises, async/await
- Promise states: pending, fulfilled, rejected
- Promises are immutable once settled
- `async` functions always return a promise
- `await` pauses async function execution, waits for promise
- `Promise.all()`: parallel execution, fails if any fails
- `Promise.allSettled()`: waits for all, never rejects
- `Promise.race()`: resolves/rejects with first settled promise
- Error handling: `.catch()` for promises, `try/catch` for async/await

```javascript
// Callbacks (pyramid of doom)
getData((err, data) => {
  if (err) return handleError(err);
  processData(data, (err, result) => {
    if (err) return handleError(err);
    saveResult(result, (err) => {
      // ...
    });
  });
});

// Promises
getData()
  .then(data => processData(data))
  .then(result => saveResult(result))
  .catch(handleError);

// Async/await
async function workflow() {
  try {
    const data = await getData();
    const result = await processData(data);
    await saveResult(result);
  } catch (error) {
    handleError(error);
  }
}

// Parallel execution
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
]);
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JavaScript is single-threaded and would block on I/O operations (network, file system) without asynchronous patterns. Async primitives enable non-blocking operations while maintaining readable, sequential-looking code.

Each evolution (callbacks → promises → async/await) improved readability and error handling while maintaining backward compatibility.
</details>

<details>
<summary>How it works</summary>
**Promise internals:**
```javascript
const promise = new Promise((resolve, reject) => {
  // Executor runs immediately
  if (success) resolve(value);
  else reject(error);
});

promise
  .then(value => {
    // Runs in microtask queue when promise fulfills
    return newValue;  // Returns new promise
  })
  .catch(error => {
    // Catches rejection
    return fallbackValue;  // Can recover
  });
```

**Async/await transpilation:**
```javascript
// Modern code
async function fetchData() {
  const response = await fetch('/api');
  return response.json();
}

// Roughly equivalent to:
function fetchData() {
  return fetch('/api')
    .then(response => response.json());
}
```

**Promise combinators:**
```javascript
// All must succeed
Promise.all([p1, p2, p3])  // Rejects if any rejects

// Wait for all (success/failure)
Promise.allSettled([p1, p2, p3])  // Never rejects
// [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]

// First to settle
Promise.race([p1, p2, p3])  // Resolves/rejects with first

// First to fulfill (ignores rejections until all reject)
Promise.any([p1, p2, p3])  // Rejects only if all reject
```

**Error propagation:**
```javascript
promise
  .then(val => {
    throw new Error('fail');  // Rejection
  })
  .catch(err => {
    // Catches above error
    return 'recovered';  // Fulfilled promise
  })
  .then(val => {
    // Receives 'recovered'
  });
```
</details>

<details>
<summary>Common misconceptions</summary>
- `async` functions don't run asynchronously (they start synchronously until first `await`)
- Forgetting `await` doesn't cause error (just get unresolved promise)
- `Promise.all` fails fast (doesn't wait for other promises after first rejection)
- Can't use `await` in `.then()` callback without making it async
- `try/catch` only catches errors in async function body, not in `.then()`
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Converting callbacks to promises
- Parallel vs sequential async operations
- Error handling strategies
- When to use which Promise combinator
- Performance implications of await chaining
- Race conditions and timing issues
- Implementing promise-based utilities
</details>
