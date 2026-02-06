# Execution Context and Call Stack

## ⚡ Quick Revision

- **Execution Context**: Environment where JavaScript code is evaluated and executed (contains variable environment, scope chain, and `this` binding)
- **Three Types**: Global EC, Function EC, and Eval EC
- **Call Stack**: LIFO data structure that tracks function execution
- **Stack Overflow**: Occurs when call stack exceeds its limit (typically from infinite recursion)

### Key Points

- Every function call creates a new execution context pushed onto the call stack
- When function returns, its context is popped off the stack
- Global context is created first and remains at bottom of stack until program ends
- Single-threaded: JavaScript can execute one thing at a time

### Code Example

```javascript
// Execution context creation
function outer() {
  let outerVar = 'outer';
  console.log('Outer function');
  
  function inner() {
    let innerVar = 'inner';
    console.log('Inner function');
  }
  
  inner();
}

outer();

// Call Stack Trace:
// 1. Global EC created
// 2. outer() EC pushed
// 3. inner() EC pushed
// 4. inner() EC popped (returns)
// 5. outer() EC popped (returns)
// 6. Global EC remains
```

### Stack Overflow Example

```javascript
// Infinite recursion - causes stack overflow
function recursiveFunction() {
  recursiveFunction(); // No base case!
}

recursiveFunction(); // RangeError: Maximum call stack size exceeded

// Proper recursion with base case
function properRecursion(n) {
  if (n <= 0) return; // Base case
  console.log(n);
  properRecursion(n - 1);
}
```

### Execution Context Phases

```javascript
// 1. Creation Phase
// - Creates variable object (VO)
// - Creates scope chain
// - Determines 'this' value

// 2. Execution Phase
// - Variable assignments
// - Function references
// - Code execution

console.log(x); // undefined (hoisted but not initialized)
var x = 10;

console.log(y); // ReferenceError (TDZ)
let y = 20;
```

### Common Pitfalls

- **Misunderstanding hoisting**: Variables declared with `var` are hoisted but initialized as `undefined`
- **Stack overflow ignorance**: Not implementing base cases in recursive functions
- **Context confusion**: Mixing up execution context with lexical scope
- **`this` binding**: Execution context determines `this`, not where function is defined

```javascript
// Pitfall: Recursive function without proper base case
function fibonacci(n) {
  return fibonacci(n - 1) + fibonacci(n - 2); // Stack overflow!
}

// Fixed version
function fibonacci(n) {
  if (n <= 1) return n; // Base case
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### The Need for Execution Context

JavaScript needs a structured way to:
- **Manage scope and variables**: Track what variables are accessible at any given point
- **Handle function calls**: Keep track of where to return after a function completes
- **Maintain execution order**: Ensure code runs in the correct sequence
- **Isolate environments**: Each function gets its own variable environment

### Historical Context

Early JavaScript interpreters needed a mechanism to:
- Parse and execute code efficiently
- Manage memory allocation for variables and functions
- Handle the single-threaded nature of JavaScript
- Provide predictable scoping rules

The execution context model provides:
- **Deterministic behavior**: Same code always executes the same way
- **Memory management**: Automatic cleanup when contexts are destroyed
- **Error tracking**: Call stack provides meaningful error traces
</details>

<details>
<summary>How it works</summary>
### Execution Context Creation Process

**1. Creation Phase**
```javascript
// Variable Object (VO) created
// Contains:
// - Function arguments
// - Function declarations (fully defined)
// - Variable declarations (set to undefined)

function example(a, b) {
  var x = 10;
  function inner() {}
  let y = 20;
}

// VO during creation:
// {
//   arguments: {0: a, 1: b, length: 2},
//   inner: <function reference>,
//   x: undefined,
//   y: <uninitialized> (TDZ)
// }
```

**2. Scope Chain Creation**
```javascript
let global = 'global';

function outer() {
  let outerVar = 'outer';
  
  function inner() {
    let innerVar = 'inner';
    console.log(global, outerVar, innerVar);
  }
  
  inner();
}

// inner's scope chain:
// [inner VO] -> [outer VO] -> [global VO]
```

**3. `this` Binding Determination**
```javascript
// Global context: window/global
// Function context: depends on how called
// Arrow function: lexical this

const obj = {
  method: function() {
    console.log(this); // obj
  },
  arrow: () => {
    console.log(this); // lexical (outer context)
  }
};
```

### Call Stack Mechanics

```javascript
function first() {
  console.log('First');
  second();
  console.log('First again');
}

function second() {
  console.log('Second');
  third();
  console.log('Second again');
}

function third() {
  console.log('Third');
}

first();

// Call Stack Timeline:
// 1. [Global EC]
// 2. [Global EC, first EC]
// 3. [Global EC, first EC, second EC]
// 4. [Global EC, first EC, second EC, third EC]
// 5. [Global EC, first EC, second EC] // third popped
// 6. [Global EC, first EC] // second popped
// 7. [Global EC] // first popped
```

### Stack Overflow in Detail

```javascript
// Stack has limited size (varies by browser/environment)
// Chrome: ~10,000-15,000 frames
// Firefox: ~50,000 frames

let depth = 0;
function measureStackDepth() {
  try {
    depth++;
    measureStackDepth();
  } catch (e) {
    console.log('Max stack depth:', depth);
    // Chrome: ~15,000
  }
}

measureStackDepth();
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Execution context is the same as scope"

**Reality**: Execution context **contains** scope chain, but they're not the same.

```javascript
// Execution context includes:
// 1. Variable Object (VO)
// 2. Scope chain
// 3. this binding

// Scope is just the accessibility of variables
```

### Misconception 2: "Arrow functions have their own execution context"

**Reality**: Arrow functions don't create their own `this` binding, but they still create an execution context.

```javascript
const obj = {
  value: 42,
  regular: function() {
    console.log(this.value); // 42 (new this binding)
  },
  arrow: () => {
    console.log(this.value); // undefined (lexical this)
  }
};

// Both create execution contexts, but handle 'this' differently
```

### Misconception 3: "Call stack only tracks functions"

**Reality**: It tracks all execution contexts, including global.

```javascript
// Even global code runs in an execution context
console.log('Global'); // Runs in Global EC

// Call stack always has at least one item (Global EC)
```

### Misconception 4: "Stack overflow only happens with recursion"

**Reality**: Any deeply nested calls can cause it.

```javascript
// Mutual recursion
function a() { b(); }
function b() { c(); }
function c() { a(); }

a(); // Stack overflow!

// Deeply nested synchronous calls
function deepNesting(n) {
  if (n === 0) return;
  setTimeout(() => deepNesting(n - 1), 0); // Won't overflow (async)
}
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "Explain the execution context creation process"**

```javascript
// Answer framework:
// 1. Creation Phase
//    - Variable object created
//    - Scope chain established
//    - 'this' determined
// 2. Execution Phase
//    - Code executed line by line
//    - Variables assigned
//    - Functions invoked

function demo(param) {
  var localVar = 'local';
  function innerFunc() {}
  let blockScoped = 'block';
}

// Creation Phase VO:
// {
//   arguments: { 0: param, length: 1 },
//   innerFunc: <function>,
//   localVar: undefined,
//   blockScoped: <uninitialized>
// }
```

**Q2: "What happens in the call stack during this code?"**

```javascript
function a() {
  console.log('a start');
  b();
  console.log('a end');
}

function b() {
  console.log('b start');
  c();
  console.log('b end');
}

function c() {
  console.log('c');
}

a();

// Expected answer with stack trace:
// 1. [Global]
// 2. [Global, a] -> logs "a start"
// 3. [Global, a, b] -> logs "b start"
// 4. [Global, a, b, c] -> logs "c"
// 5. [Global, a, b] -> logs "b end"
// 6. [Global, a] -> logs "a end"
// 7. [Global]
```

**Q3: "How would you prevent stack overflow in recursion?"**

```javascript
// Solution 1: Iterative approach
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Solution 2: Tail call optimization (not in all browsers)
function factorialTCO(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTCO(n - 1, n * acc);
}

// Solution 3: Trampolining
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  };
}

const factorialTrampoline = trampoline(function fact(n, acc = 1) {
  if (n <= 1) return acc;
  return () => fact(n - 1, n * acc);
});
```

**Q4: "Difference between call stack and event loop?"**

```javascript
// Call stack: Synchronous execution tracking
// Event loop: Manages asynchronous operations

console.log('1'); // Added to call stack immediately

setTimeout(() => {
  console.log('2'); // Callback queue, waits for stack to clear
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // Microtask queue, priority over callback queue
});

console.log('4'); // Added to call stack immediately

// Output: 1, 4, 3, 2
// Call stack must be empty before event loop processes queues
```

### Pro Tips for Interviews

1. **Draw diagrams**: Visualize the call stack during execution
2. **Use debugger**: Show knowledge of browser DevTools
3. **Mention edge cases**: Stack overflow, async behavior
4. **Connect concepts**: Link to closures, hoisting, scope
5. **Performance awareness**: Discuss tail call optimization, recursion limits
</details>
