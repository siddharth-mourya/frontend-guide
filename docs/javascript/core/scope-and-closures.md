# Scope and Closures

## ⚡ Quick Revision

- Scope: where variables are accessible in code
- Three scope types: global, function, block
- `var`: function-scoped, hoisted, can be re-declared
- `let`/`const`: block-scoped, temporal dead zone, no re-declaration
- Closure: function that remembers variables from its lexical scope
- Closures created every time a function is created
- Common uses: data privacy, function factories, callbacks

```javascript
// Closure example
function outer() {
  let count = 0;
  return function inner() {
    return ++count;
  };
}
const counter = outer();
counter();  // 1
counter();  // 2 (remembers count)

// Block scope
if (true) {
  let x = 1;  // block-scoped
  var y = 2;  // function-scoped
}
// x is not accessible here
// y is accessible here

// Common closure trap
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);  // prints 3, 3, 3
}
// Fix: use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);  // prints 0, 1, 2
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Lexical scoping enables modularity by encapsulating data. Closures enable functional programming patterns, callbacks, and data privacy without classes.

Block scoping (`let`/`const`) was added in ES6 to fix common bugs with `var` and align JavaScript with other languages.
</details>

<details>
<summary>How it works</summary>
**Scope chain:**
1. Variables resolved from innermost to outermost scope
2. If not found, ReferenceError thrown
3. Each function creates a new scope
4. Inner functions can access outer scopes (lexical scoping)

**Closure mechanics:**
- When function defined, it captures reference to outer scope
- Outer scope variables remain in memory as long as closure exists
- Multiple closures from same parent share same outer scope

```javascript
function makeCounter() {
  let count = 0;
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    get() { return count; }
  };
}
const c = makeCounter();
c.increment();  // 1
c.increment();  // 2
c.get();        // 2
// count is private, only accessible via methods
```

**Memory implications:**
- Closures keep outer scope alive (potential memory leaks)
- Only variables referenced by closure are kept in memory
- Large closures can impact performance
</details>

<details>
<summary>Common misconceptions</summary>
- Closures don't "copy" values, they maintain references
- `var` in loops creates single binding (all iterations share same variable)
- `let` in loops creates new binding per iteration
- Closures aren't "slow" in modern engines (highly optimized)
- Nested functions don't always create closures (only if they reference outer variables)
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Explaining closure creation and use cases
- Loop + `setTimeout` problem with `var` vs `let`
- Implementing module pattern with closures
- Memory leak scenarios with closures
- Difference between function scope and block scope
- Creating private variables/methods
- Practical closure patterns (debounce, throttle, memoization)
</details>
