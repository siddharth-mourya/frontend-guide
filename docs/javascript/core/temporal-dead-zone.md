# Temporal Dead Zone (TDZ)

## ⚡ Quick Revision

- **TDZ**: Time between entering scope and variable initialization where variable cannot be accessed
- **Applies to**: `let`, `const`, and `class` declarations
- **Does NOT apply to**: `var` declarations (they're initialized with `undefined`)
- **Purpose**: Catch programming errors and enforce better coding practices

### Key Points

- Variables exist in TDZ from start of scope until declaration line is executed
- Accessing variable in TDZ throws `ReferenceError`
- TDZ is temporal (time-based), not spatial (location-based)
- Helps catch bugs where variables are used before proper initialization

### Code Example

```javascript
// TDZ for let/const
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 10;

console.log(y); // ReferenceError: Cannot access 'y' before initialization
const y = 20;

// No TDZ for var
console.log(z); // undefined
var z = 30;
```

### Temporal Nature

```javascript
// TDZ is time-based, not position-based
function example() {
  // TDZ for value starts here
  
  console.log(typeof value); // ReferenceError (TDZ)
  
  let value = 42; // TDZ ends here
  
  console.log(value); // 42
}

// Function not called = no TDZ triggered
example(); // Only now does TDZ exist
```

### TDZ with Functions

```javascript
// Functions can access variables after TDZ
function useVariable() {
  return variable * 2;
}

let variable = 10;

console.log(useVariable()); // 20 (works because called after initialization)

// But calling before initialization fails
function earlyCall() {
  console.log(value); // ReferenceError
}

earlyCall();
let value = 5;
```

### Common Pitfalls

- **typeof operator not safe**: In TDZ, `typeof` throws ReferenceError instead of returning 'undefined'
- **Default parameters**: Can reference other parameters but must respect TDZ
- **Class expressions**: Also have TDZ like let/const

```javascript
// Pitfall 1: typeof is not safe in TDZ
console.log(typeof undeclaredVar); // 'undefined' (safe)
console.log(typeof declaredButInTDZ); // ReferenceError!
let declaredButInTDZ = 10;

// Pitfall 2: Default parameter TDZ
function example(a = b, b = 2) { // ReferenceError
  return a + b;
}

// Fixed
function example(b = 2, a = b) { // Works
  return a + b;
}

// Pitfall 3: Class TDZ
const instance = new MyClass(); // ReferenceError
class MyClass {}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Design Goals of TDZ

**1. Catch Programming Errors**
```javascript
// Without TDZ (var behavior):
console.log(userName); // undefined - no error!
var userName = 'John';

// With TDZ (let/const):
console.log(userName); // ReferenceError - catches bug!
let userName = 'John';
```

**2. Make const Sensible**
```javascript
// const must be initialized at declaration
// TDZ ensures you can't access it before that

const PI; // SyntaxError: Missing initializer
PI = 3.14;

// TDZ prevents this logical inconsistency:
console.log(PI); // What value should this be?
const PI = 3.14;
```

**3. Prepare for Future Language Features**
- Guards in pattern matching
- More sophisticated binding patterns
- Cleaner semantics for module imports

**4. Consistency with Block Scoping**
```javascript
// TDZ makes block scoping more intuitive
{
  // Can't use x here (TDZ)
  let x = 10;
  // Can use x here
}
// Can't use x here (out of scope)
```

### Historical Context

**Pre-ES6 (var only)**
- Hoisting caused confusion
- Variables accessible before declaration (as `undefined`)
- Led to bugs and maintenance issues

**ES6 Decision**
- Introduce better scoping with `let`/`const`
- TDZ prevents hoisting-related bugs
- More predictable behavior
- Encourages initialization at declaration
</details>

<details>
<summary>How it works</summary>
### TDZ Lifecycle

```javascript
function tdZLifecycle() {
  // 1. Scope Entry: Variable 'registered' in scope (hoisting)
  // 2. TDZ Begins: Variable exists but uninitialized
  
  console.log(x); // ReferenceError - in TDZ
  
  // 3. Declaration Reached: TDZ ends, variable initialized
  let x = 10;
  
  // 4. TDZ Ended: Normal access allowed
  console.log(x); // 10
}
```

### Hoisting vs TDZ

```javascript
// BOTH var and let/const are hoisted!
// Difference is in initialization

// var: hoisted and initialized to undefined
console.log(varVariable); // undefined (no error)
var varVariable = 10;

// let/const: hoisted but NOT initialized (TDZ)
console.log(letVariable); // ReferenceError
let letVariable = 20;
```

### Block Scope and TDZ

```javascript
let x = 'outer';

{
  // TDZ for inner 'x' starts here
  console.log(x); // ReferenceError (not 'outer'!)
  
  let x = 'inner'; // TDZ ends here
  console.log(x); // 'inner'
}

console.log(x); // 'outer'
```

### TDZ with Destructuring

```javascript
// TDZ applies to destructured variables
const { a, b } = { a: 1, b: 2 };

// Each variable has its own TDZ
console.log(x); // ReferenceError
let { x, y } = { x: 1, y: 2 };
console.log(y); // Can access after declaration
```

### Class TDZ

```javascript
// Classes have TDZ like let/const
const instance = new MyClass(); // ReferenceError

class MyClass {
  constructor() {
    this.value = 42;
  }
}

// Function declarations don't have TDZ
const obj = new MyFunction(); // Works!
function MyFunction() {
  this.value = 42;
}
```

### TDZ in Loops

```javascript
// for loop: TDZ exists within loop body
for (let i = 0; i < 3; i++) {
  // Each iteration creates new 'i' binding
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

// TDZ in loop initialization
for (let i = 0, j = i; i < 3; i++) { // OK: i initialized before j
  console.log(j);
}

for (let i = j, j = 0; i < 3; i++) { // ReferenceError: j in TDZ
  console.log(i);
}
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "let/const are not hoisted"

**Reality**: They ARE hoisted, but remain uninitialized (TDZ)

```javascript
// Proof of hoisting:
let x = 'outer';

function test() {
  // If not hoisted, would access outer 'x'
  console.log(x); // ReferenceError - proves inner x is hoisted!
  let x = 'inner';
}

test();
```

### Misconception 2: "TDZ is about physical position in code"

**Reality**: TDZ is temporal (time-based), not spatial

```javascript
// Function defined before declaration
function readVar() {
  return x; // No error yet!
}

let x = 10;

readVar(); // 10 - works because CALLED after initialization

// Versus:
function readVar2() {
  return y;
}

readVar2(); // ReferenceError - called before initialization
let y = 20;
```

### Misconception 3: "typeof is always safe"

**Reality**: typeof throws ReferenceError in TDZ

```javascript
// Before ES6: typeof was always safe
console.log(typeof neverDeclared); // 'undefined'

// With TDZ: typeof can throw
console.log(typeof declaredLater); // ReferenceError!
let declaredLater = 42;

// Safe typeof check:
if (typeof window !== 'undefined' && window.someVar) {
  // Only safe if someVar is not in TDZ
}
```

### Misconception 4: "TDZ only applies to let/const"

**Reality**: Also applies to parameters, classes, and imports

```javascript
// Default parameters and TDZ
function func(a = b, b = 2) { // ReferenceError
  return [a, b];
}

// Classes
const obj = new MyClass(); // ReferenceError
class MyClass {}

// Import bindings (in TDZ until module initialization)
import { myFunction } from './module.js';
// Can't access exports until module fully loads
```

### Misconception 5: "Function declarations have TDZ"

**Reality**: Function declarations are fully hoisted

```javascript
hoistedFunc(); // Works!
function hoistedFunc() {
  console.log('I work!');
}

// But function expressions do have TDZ
notHoisted(); // ReferenceError
const notHoisted = function() {
  console.log('Error');
};
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What is the Temporal Dead Zone?"**

```javascript
// Answer with clear example:

// TDZ is the period between:
// 1. Entering scope (variable hoisted but uninitialized)
// 2. Declaration line executed (variable initialized)

function demonstrateTDZ() {
  // TDZ starts here for 'value'
  
  console.log(value); // ReferenceError - accessing in TDZ
  
  let value = 42; // TDZ ends here
  
  console.log(value); // 42 - TDZ over, normal access
}
```

**Q2: "Why does this throw an error?"**

```javascript
let x = 'outer';

function test() {
  console.log(x); // ReferenceError - why?
  let x = 'inner';
}

// Answer: Inner x is hoisted but in TDZ
// Shadows outer x, but not accessible until declaration
```

**Q3: "Difference between var and let hoisting?"**

```javascript
// Both are hoisted, but initialization differs

// var: hoisted and initialized to undefined
console.log(a); // undefined
var a = 1;

// let: hoisted but uninitialized (TDZ)
console.log(b); // ReferenceError
let b = 2;

// Technical explanation:
// - var: Creation and initialization happen at scope entry
// - let/const: Creation at scope entry, initialization at declaration
```

**Q4: "Fix this code:"**

```javascript
// Broken:
function broken(a = b, b = 2) {
  return a + b;
}

// Fixed:
function fixed(b = 2, a = b) {
  return a + b;
}

// Or:
function fixed2(a, b = 2) {
  a = a !== undefined ? a : b;
  return a + b;
}
```

**Q5: "What happens here?"**

```javascript
const myClass = new MyClass(); // ReferenceError

class MyClass {
  constructor() {
    this.value = 42;
  }
}

// Answer: Classes have TDZ like let/const
// Must declare before use

// Contrast with function declaration:
const myFunc = new MyFunc(); // Works!
function MyFunc() {
  this.value = 42;
}
```

### Advanced Interview Questions

**Q6: "Explain this behavior"**

```javascript
function outer() {
  let x = 1;
  
  function inner() {
    console.log(x); // What happens?
    let x = 2;
  }
  
  inner();
}

// Answer: ReferenceError
// inner's x is hoisted, creating TDZ
// Shadows outer x
```

**Q7: "How to check if variable exists safely?"**

```javascript
// Problem: typeof not safe in TDZ
if (typeof potentialVar !== 'undefined') { // May throw!
  // ...
}

// Solutions:

// 1. Try-catch
try {
  potentialVar;
  // exists
} catch (e) {
  // doesn't exist or in TDZ
}

// 2. Window object (browser, global scope only)
if ('potentialVar' in window) {
  // exists
}

// 3. Avoid checking - declare early
let potentialVar; // Now safely accessible
```

### Pro Tips for Interviews

1. **Always mention**: Both var and let/const are hoisted
2. **Explain temporal**: TDZ is about time, not location
3. **Give practical example**: Show real-world bug TDZ prevents
4. **Connect to const**: Explain why TDZ makes const sensible
5. **Know the edge cases**: typeof, parameters, classes, loops
6. **Debugging tip**: Reference errors in TDZ are common source of bugs

### Common Interview Trap

```javascript
// Interviewer asks: "What does this output?"
function trap() {
  typeof x; // What happens?
  let x = 1;
}

trap();

// Correct answer: ReferenceError (not 'undefined')
// Many candidates get this wrong!
```
</details>
