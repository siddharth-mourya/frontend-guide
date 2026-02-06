# Hoisting

## ⚡ Quick Revision

- JavaScript moves declarations to top of scope before execution
- `var` declarations hoisted, initialized to `undefined`
- `let`/`const`/`class` declarations hoisted but not initialized (TDZ)
- Function declarations fully hoisted (name and body)
- Function expressions not hoisted (only variable hoisted)
- Hoisting happens per-scope, not globally

```javascript
// var hoisting
console.log(x);  // undefined (not ReferenceError)
var x = 5;

// Interpreted as:
var x;
console.log(x);  // undefined
x = 5;

// let/const TDZ
console.log(y);  // ReferenceError: Cannot access before initialization
let y = 10;

// Function declaration hoisting
greet();  // works
function greet() { console.log("Hi"); }

// Function expression not hoisted
sayHi();  // TypeError: sayHi is not a function
var sayHi = function() { console.log("Hi"); };
```

**Common trap:**
```javascript
var name = "Global";
function outer() {
  console.log(name);  // undefined (not "Global")
  var name = "Local";
}
// var name hoisted to top of function scope
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Hoisting is not a deliberate feature but a consequence of JavaScript's two-phase execution: compilation (scope analysis) and execution. The engine must know all declarations before executing code.

This allows forward references (using functions before they're declared in code), which many developers find convenient.
</details>

<details>
<summary>How it works</summary>
**Execution phases:**

1. **Compilation phase:**
   - Scan code for declarations
   - Create bindings in appropriate scope
   - `var`: create binding, initialize to `undefined`
   - `let`/`const`: create binding, leave uninitialized
   - Function declarations: create binding, assign function

2. **Execution phase:**
   - Execute code line by line
   - Initialize `let`/`const` when declaration reached

```javascript
// What you write:
console.log(a, b, c);
var a = 1;
let b = 2;
function c() {}

// How engine interprets:
// Compilation phase:
var a = undefined;
// b declared but uninitialized (TDZ)
function c() {}

// Execution phase:
console.log(a, b, c);  // undefined, ReferenceError, function
a = 1;
b = 2;  // b initialized here
```

**Function vs variable precedence:**
```javascript
var foo = 1;
function foo() {}
console.log(typeof foo);  // "number"

// Interpreted as:
function foo() {}  // hoisted first
var foo;  // declaration ignored (already declared)
foo = 1;  // assignment happens
```
</details>

<details>
<summary>Common misconceptions</summary>
- Code doesn't "physically move" (it's a mental model of compilation)
- `let`/`const` are hoisted (just not initialized)
- Function expressions behave like `var` assignments
- Class declarations are hoisted but remain in TDZ
- Hoisting happens in every scope, not just global
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Predicting output with hoisted variables
- Understanding TDZ for `let`/`const`
- Function declaration vs expression hoisting
- Why `var` in loops causes issues
- Scope interaction with hoisting
- Real-world problems caused by hoisting
</details>
