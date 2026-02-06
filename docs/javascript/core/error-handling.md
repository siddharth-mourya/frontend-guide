# Error Handling

## ⚡ Quick Revision

- **try/catch**: Synchronous error handling mechanism
- **throw**: Create and throw custom errors
- **finally**: Always executes, regardless of try/catch outcome
- **Promise rejection**: Handle async errors with `.catch()` or `try/await`
- **unhandledRejection**: Global handler for unhandled promise rejections
- **Error propagation**: Errors bubble up the call stack until caught

### Key Points

- `try/catch` only works for synchronous code and async/await
- Promises require `.catch()` or try/catch with await
- `finally` block executes even if there's a return statement
- Custom errors should extend Error class
- Always provide meaningful error messages
- Error objects contain stack trace for debugging

### Basic try/catch/finally

```javascript
try {
  // Code that might throw
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  // Handle error
  console.error('Error occurred:', error.message);
} finally {
  // Always executes
  cleanup();
}
```

### Throwing Errors

```javascript
// Built-in errors
throw new Error('Something went wrong');
throw new TypeError('Expected a number');
throw new ReferenceError('Variable not defined');
throw new RangeError('Index out of bounds');

// Custom errors
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid email format');
```

### Promise Error Handling

```javascript
// .catch() method
fetchData()
  .then(data => processData(data))
  .catch(error => console.error('Error:', error))
  .finally(() => console.log('Cleanup'));

// async/await with try/catch
async function getData() {
  try {
    const data = await fetchData();
    return processData(data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Cleanup');
  }
}

// Multiple catches for different errors
fetchData()
  .then(data => processData(data))
  .catch(ValidationError, error => {
    // Handle validation error
  })
  .catch(error => {
    // Handle other errors
  });
```

### Global Error Handlers

```javascript
// Unhandled promise rejections (Node.js)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Unhandled promise rejections (Browser)
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault(); // Prevent default error logging
});

// Uncaught exceptions (Node.js)
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1); // Exit after logging
});

// Global error handler (Browser)
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', message, error);
  return true; // Prevent default error handling
};
```

### Common Pitfalls

```javascript
// Pitfall 1: try/catch doesn't work with setTimeout
try {
  setTimeout(() => {
    throw new Error('Async error'); // Not caught!
  }, 1000);
} catch (error) {
  console.error(error); // Never executes
}

// Fix: Handle error inside callback
setTimeout(() => {
  try {
    throw new Error('Async error');
  } catch (error) {
    console.error(error); // Caught!
  }
}, 1000);

// Pitfall 2: Forgot to rethrow in catch
function processData(data) {
  try {
    return riskyOperation(data);
  } catch (error) {
    console.error(error);
    // Should rethrow if caller needs to know!
    throw error;
  }
}

// Pitfall 3: Promise rejection not handled
async function getData() {
  const promise = fetch('/api/data'); // No await, no catch!
  return promise; // Unhandled rejection if fetch fails
}

// Fix
async function getData() {
  try {
    return await fetch('/api/data');
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

// Pitfall 4: Swallowing errors silently
try {
  riskyOperation();
} catch (error) {
  // Silent failure - bad practice!
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Purpose of Error Handling

**1. Graceful Degradation**
```javascript
// Without error handling - app crashes
function getUserData(userId) {
  const user = database.findUser(userId); // Throws if not found
  return user.profile;
}

// With error handling - app continues
function getUserData(userId) {
  try {
    const user = database.findUser(userId);
    return user.profile;
  } catch (error) {
    console.error('User not found:', userId);
    return null; // Default value
  }
}
```

**2. User Experience**
```javascript
// Poor UX - technical error message
async function loadData() {
  const data = await fetch('/api/data'); // Shows cryptic error
  return data;
}

// Good UX - friendly message
async function loadData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    return await response.json();
  } catch (error) {
    showUserMessage('Unable to load data. Please try again.');
    logError(error); // Log for developers
  }
}
```

**3. Debugging and Monitoring**
```javascript
// Error objects contain valuable information
try {
  throw new Error('Something failed');
} catch (error) {
  console.log(error.message); // 'Something failed'
  console.log(error.stack); // Stack trace
  console.log(error.name); // 'Error'
  
  // Send to monitoring service
  sendToSentry(error);
}
```

**4. Recovery and Retry Logic**
```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error; // Last attempt
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

### Evolution of Error Handling

**Early JavaScript (1995-2010)**
- Basic try/catch
- Error objects
- No standardized async error handling

**ES6 (2015)**
- Promises with `.catch()`
- Better error propagation in async code

**ES8 (2017)**
- async/await
- try/catch works with async code

**Modern (2020+)**
- Optional chaining reduces errors: `obj?.prop`
- Nullish coalescing: `value ?? default`
- Global error event handlers
</details>

<details>
<summary>How it works</summary>
### Error Object Structure

```javascript
try {
  throw new Error('Custom error');
} catch (error) {
  // Error object properties:
  console.log(error.message); // 'Custom error'
  console.log(error.name); // 'Error'
  console.log(error.stack); // Stack trace string
  
  // Stack trace example:
  // Error: Custom error
  //     at <anonymous>:2:9
  //     at ...
}
```

### try/catch/finally Execution Flow

```javascript
function demonstrateFlow() {
  console.log('1. Before try');
  
  try {
    console.log('2. In try');
    throw new Error('Oops');
    console.log('3. After throw'); // Never executes
  } catch (error) {
    console.log('4. In catch');
    return 'returning from catch';
  } finally {
    console.log('5. In finally'); // Executes even with return!
  }
  
  console.log('6. After finally'); // Never executes due to return
}

// Output:
// 1. Before try
// 2. In try
// 4. In catch
// 5. In finally
// Returns: 'returning from catch'
```

### Error Propagation

```javascript
// Errors bubble up the call stack
function level3() {
  throw new Error('Error at level 3');
}

function level2() {
  level3(); // Error propagates up
}

function level1() {
  try {
    level2(); // Error propagates up
  } catch (error) {
    console.log('Caught at level 1');
    console.log(error.stack); // Shows full call stack
  }
}

level1();
// Stack trace shows: level3 -> level2 -> level1
```

### Promise Error Handling Mechanics

```javascript
// Promise rejection propagates through chain
Promise.resolve()
  .then(() => {
    throw new Error('Error in then');
  })
  .then(() => {
    console.log('Skipped'); // Skipped due to error
  })
  .catch(error => {
    console.log('Caught:', error.message);
    return 'recovered'; // Recover from error
  })
  .then(value => {
    console.log(value); // 'recovered'
  });

// Async/await is syntactic sugar
async function example() {
  try {
    await Promise.reject(new Error('Rejected'));
  } catch (error) {
    console.log('Caught:', error.message);
  }
}

// Equivalent to:
function example() {
  return Promise.reject(new Error('Rejected'))
    .catch(error => {
      console.log('Caught:', error.message);
    });
}
```

### Custom Error Types

```javascript
// Extend Error class
class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    
    // Maintains proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Use in error handling
try {
  throw new NetworkError('Request failed', 404);
} catch (error) {
  if (error instanceof NetworkError) {
    console.log(`Network error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.log(`Validation error in ${error.field}: ${error.message}`);
  } else {
    console.log('Unknown error:', error);
  }
}
```

### Error Handling Patterns

```javascript
// Pattern 1: Error-first callbacks (Node.js convention)
fs.readFile('file.txt', (error, data) => {
  if (error) {
    console.error('Error reading file:', error);
    return;
  }
  console.log('File content:', data);
});

// Pattern 2: Result objects
function divide(a, b) {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// Pattern 3: Either monad (functional)
class Either {
  static right(value) {
    return { isRight: true, value };
  }
  
  static left(error) {
    return { isRight: false, error };
  }
}

function safeDivide(a, b) {
  return b === 0 
    ? Either.left('Division by zero')
    : Either.right(a / b);
}
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "try/catch works with all async code"

**Reality**: Only works with async/await, not callbacks or unwrapped promises

```javascript
// DOESN'T WORK
try {
  setTimeout(() => {
    throw new Error('Async error');
  }, 1000);
} catch (error) {
  console.error(error); // Never catches
}

// DOESN'T WORK
try {
  fetch('/api/data'); // Promise not awaited
} catch (error) {
  console.error(error); // Never catches
}

// WORKS
async function example() {
  try {
    await fetch('/api/data'); // awaited!
  } catch (error) {
    console.error(error); // Catches!
  }
}
```

### Misconception 2: "finally replaces cleanup code"

**Reality**: finally runs even with return/throw, but doesn't prevent them

```javascript
function test() {
  try {
    return 'from try';
  } finally {
    console.log('Finally runs');
    // Can't prevent the return!
  }
}

console.log(test());
// Output:
// "Finally runs"
// "from try"

// Exception: finally with return overrides
function override() {
  try {
    return 'from try';
  } finally {
    return 'from finally'; // Overrides!
  }
}

console.log(override()); // 'from finally'
```

### Misconception 3: "Catching errors makes code slower"

**Reality**: try/catch has minimal performance impact in modern engines

```javascript
// Not significantly slower
function withTryCatch(x) {
  try {
    return x * 2;
  } catch (error) {
    return 0;
  }
}

// Don't avoid error handling for performance
// Use it where needed for correctness
```

### Misconception 4: "All errors should be caught immediately"

**Reality**: Sometimes you want errors to propagate

```javascript
// BAD: Catching too early
function getUser(id) {
  try {
    return database.query(id);
  } catch (error) {
    console.error('Database error'); // Too generic!
    return null; // Loses error information
  }
}

// GOOD: Let caller decide
function getUser(id) {
  return database.query(id); // Let it throw
}

// Caller has context to handle properly
async function displayUser(id) {
  try {
    const user = await getUser(id);
    render(user);
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      showMessage('User not found');
    } else {
      showMessage('Database error. Please try again.');
    }
  }
}
```

### Misconception 5: "Promise.catch() catches all errors"

**Reality**: Only catches errors up to that point in chain

```javascript
Promise.resolve()
  .then(() => {
    throw new Error('Error 1');
  })
  .catch(error => {
    console.log('Caught:', error.message); // Catches Error 1
    throw new Error('Error 2'); // New error!
  })
  .then(() => {
    console.log('This is skipped');
  })
  .catch(error => {
    console.log('Caught:', error.message); // Catches Error 2
  });
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What's the difference between throw and return?"**

```javascript
// throw: Aborts execution, propagates error
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

try {
  const result = divide(10, 0);
  console.log(result); // Never executes
} catch (error) {
  console.error(error.message); // 'Division by zero'
}

// return: Normal flow continues
function divideWithReturn(a, b) {
  if (b === 0) {
    return null; // Caller checks for null
  }
  return a / b;
}

const result = divideWithReturn(10, 0);
if (result === null) {
  console.error('Division by zero');
}
```

**Q2: "How do you handle errors in promises vs async/await?"**

```javascript
// Promise chain with .catch()
fetchUser()
  .then(user => updateProfile(user))
  .then(updated => console.log('Updated:', updated))
  .catch(error => console.error('Error:', error))
  .finally(() => console.log('Done'));

// async/await with try/catch
async function handleUser() {
  try {
    const user = await fetchUser();
    const updated = await updateProfile(user);
    console.log('Updated:', updated);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Done');
  }
}

// Mix both styles
async function mixed() {
  const user = await fetchUser().catch(error => {
    console.error('Fetch failed:', error);
    return null; // Default value
  });
  
  if (!user) return;
  
  // Continue with valid user
  await updateProfile(user);
}
```

**Q3: "What happens with unhandled promise rejections?"**

```javascript
// Unhandled rejection
Promise.reject(new Error('Oops')); // Warning in console

// In Node.js (will crash in future versions)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  // Log to error tracking service
  // Potentially exit process
});

// In browser
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault(); // Prevent default logging
});

// Always handle rejections:
Promise.reject(new Error('Oops'))
  .catch(error => console.error('Handled:', error));

// Or with async/await:
(async () => {
  try {
    await Promise.reject(new Error('Oops'));
  } catch (error) {
    console.error('Handled:', error);
  }
})();
```

**Q4: "Implement retry logic with error handling"**

```javascript
async function fetchWithRetry(url, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2 } = options;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Usage
fetchWithRetry('/api/data', { retries: 3, delay: 1000 })
  .then(data => console.log('Success:', data))
  .catch(error => console.error('All retries failed:', error));
```

**Q5: "Create a custom error class and use it"**

```javascript
class APIError extends Error {
  constructor(message, statusCode, endpoint) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.timestamp = new Date();
    
    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
      timestamp: this.timestamp
    };
  }
}

// Usage
async function fetchData(endpoint) {
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new APIError(
      'API request failed',
      response.status,
      endpoint
    );
  }
  
  return response.json();
}

// Handle specific error types
try {
  await fetchData('/api/users');
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.toJSON());
    
    if (error.statusCode === 404) {
      console.log('Resource not found');
    } else if (error.statusCode === 500) {
      console.log('Server error');
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Advanced Interview Topics

**Q6: "Error boundaries in async code"**

```javascript
// Create error boundary for async operations
class AsyncErrorBoundary {
  constructor(handler) {
    this.handler = handler;
  }
  
  async execute(fn) {
    try {
      return await fn();
    } catch (error) {
      this.handler(error);
    }
  }
}

// Usage
const boundary = new AsyncErrorBoundary(error => {
  console.error('Caught by boundary:', error);
  // Log to error tracking
  // Show user-friendly message
});

await boundary.execute(async () => {
  await riskyOperation();
});
```

### Pro Tips for Interviews

1. **Explain async gotchas**: try/catch doesn't work with raw promises
2. **Mention real-world patterns**: Retry logic, circuit breakers
3. **Custom errors**: Show you can create meaningful error types
4. **Error monitoring**: Mention Sentry, error tracking services
5. **Graceful degradation**: Explain how to keep app running
6. **Stack traces**: Understand how to read and preserve them
</details>
