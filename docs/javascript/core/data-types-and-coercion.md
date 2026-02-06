# Data Types and Coercion

## ⚡ Quick Revision

- JavaScript has 7 primitive types: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`
- One complex type: `object` (includes arrays, functions, dates, etc.)
- Type coercion: automatic conversion between types during operations
- Explicit coercion: `String()`, `Number()`, `Boolean()`
- Implicit coercion: `+`, `-`, `==`, template literals trigger conversions
- Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`
- Everything else is truthy (including `[]`, `{}`, `"0"`, `"false"`)
- `NaN` is the only value not equal to itself
- `typeof null` returns `"object"` (language bug, cannot be fixed for backward compatibility)
- `typeof` for functions returns `"function"` (even though functions are objects)

```javascript
// Common coercion traps
[] + []   // "" (both convert to empty strings)
[] + {}   // "[object Object]"
{} + []   // 0 (first {} treated as block, +[] coerces to 0)
true + true  // 2
"5" - 3   // 2 (string coerced to number)
"5" + 3   // "53" (number coerced to string)
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JavaScript was designed to be flexible and forgiving, allowing operations between different types without explicit conversion. This design makes it easier for beginners but creates subtle bugs in production code.

The type system distinguishes between primitives (immutable, passed by value) and objects (mutable, passed by reference).
</details>

<details>
<summary>How it works</summary>
**Type Coercion Algorithm:**
- ToPrimitive: Converts objects to primitives using `valueOf()` then `toString()`
- ToNumber: Converts values to numbers (`""` → `0`, `true` → `1`, `false` → `0`)
- ToString: Converts values to strings (objects become `"[object Object]"`)
- ToBoolean: Any value can be converted to boolean based on falsy list

**Coercion in operators:**
- `+` with strings: all operands coerced to strings
- `-`, `*`, `/`: all operands coerced to numbers
- `==`: performs type coercion before comparison
- `===`: no coercion, strict equality

**Object to primitive:**
```javascript
const obj = {
  valueOf() { return 42; },
  toString() { return "hello"; }
};
obj + 1;  // 43 (valueOf called)
String(obj);  // "hello" (toString called)
```
</details>

<details>
<summary>Common misconceptions</summary>
- `typeof` is not always reliable (`null`, arrays return unexpected values)
- `[]` and `{}` are not falsy (they're objects, thus truthy)
- String concatenation with `+` can cause unexpected coercion
- `parseInt()` without radix can misinterpret numbers
- NaN is a number type, but `NaN === NaN` is false
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Understanding of `typeof` edge cases
- Knowledge of falsy values
- Ability to predict coercion outcomes
- When to use `==` vs `===`
- How to safely check types (Array.isArray, Number.isNaN)
- Object-to-primitive conversion mechanics
</details>
