# typeof and instanceof

## ⚡ Quick Revision

- `typeof`: Returns string representing primitive type or `"object"`/`"function"`
- `instanceof`: Tests if object is instance of a constructor (checks prototype chain)
- `typeof null` returns `"object"` (historical bug)
- `typeof []` returns `"object"` (use `Array.isArray()`)
- `typeof function` returns `"function"` (even though functions are objects)
- `instanceof` doesn't work across realms (iframes, different execution contexts)
- Safe type checks: `Array.isArray()`, `Number.isNaN()`, `Number.isFinite()`

```javascript
// typeof results
typeof 42              // "number"
typeof "hello"         // "string"
typeof true            // "boolean"
typeof undefined       // "undefined"
typeof Symbol()        // "symbol"
typeof 10n             // "bigint"
typeof null            // "object" ⚠️
typeof {}              // "object"
typeof []              // "object" ⚠️
typeof function(){}    // "function"

// instanceof usage
[] instanceof Array           // true
({}) instanceof Object        // true
function(){} instanceof Function  // true
/regex/ instanceof RegExp     // true
```

**Safe checks:**
```javascript
Array.isArray([])              // true
Number.isNaN(NaN)              // true
Number.isFinite(42)            // true
Object.prototype.toString.call([])  // "[object Array]"
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
`typeof` provides quick runtime type checking for primitives and distinguishes functions from other objects. It's a unary operator that works even on undeclared variables (returns `"undefined"` without ReferenceError).

`instanceof` enables object-oriented programming by checking inheritance chains. It's essential for polymorphism and type-based logic.
</details>

<details>
<summary>How it works</summary>
**`typeof` implementation:**
- Returns internal type tag as string
- Special case for `null` due to original JavaScript implementation (type tag 0, which objects also use)
- Special case for callable objects (functions)
- Cannot distinguish between different object types

**`instanceof` mechanism:**
```javascript
// obj instanceof Constructor
// Checks: Constructor.prototype in obj's prototype chain

function Person() {}
const p = new Person();
p instanceof Person  // true

// Equivalent to:
Person.prototype.isPrototypeOf(p)
```

**Cross-realm issue:**
```javascript
// From iframe
const iframeArray = iframe.contentWindow.Array;
const arr = new iframeArray();
arr instanceof Array  // false (different Array constructor)
Array.isArray(arr)    // true (works across realms)
```
</details>

<details>
<summary>Common misconceptions</summary>
- `typeof` cannot distinguish between array, object, null
- `instanceof` fails with primitives: `"hello" instanceof String` is `false`
- `typeof` on undeclared variable doesn't throw error
- `instanceof` checks prototype chain, not constructor that created the object
- You cannot reliably check types across different JavaScript contexts without specialized methods
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Knowledge of `typeof null` quirk
- How to properly check for arrays
- Understanding `instanceof` prototype chain checking
- Cross-realm/context issues
- When to use specialized checks (`Array.isArray`, `Number.isNaN`)
- Implementation of custom `instanceof`-like behavior
</details>
