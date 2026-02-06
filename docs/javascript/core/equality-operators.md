# Equality Operators

## ⚡ Quick Revision

- `===` strict equality: checks type and value, no coercion
- `==` loose equality: performs type coercion before comparison
- `Object.is()`: like `===` but handles `NaN` and `-0` correctly
- Prefer `===` in production code for predictability
- `==` only acceptable for `null`/`undefined` checks: `x == null`

```javascript
// === examples
5 === 5        // true
5 === "5"      // false
null === undefined  // false

// == examples
5 == "5"       // true (string coerced to number)
null == undefined  // true (special case)
false == 0     // true
"" == 0        // true

// Object.is() differences
Object.is(NaN, NaN)    // true (vs === false)
Object.is(-0, +0)      // false (vs === true)
```

**Safe null check pattern:**
```javascript
if (x == null) {  // matches both null and undefined
  // handle missing value
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JavaScript inherited loose equality from early web scripting needs where type flexibility was valued. Strict equality was added in ES3 to provide predictable comparison without coercion.

`Object.is()` was introduced in ES6 to fix the two edge cases where `===` behaves unexpectedly (`NaN` and signed zeros).
</details>

<details>
<summary>How it works</summary>
**`==` Abstract Equality Algorithm:**
1. If types match, compare like `===`
2. `null == undefined` is always true
3. String and number: convert string to number
4. Boolean: convert to number
5. Object and primitive: convert object to primitive (ToPrimitive)
6. Otherwise, false

**`===` Strict Equality:**
1. If types differ, return false
2. If both numbers, check values (but `NaN !== NaN`)
3. If `-0` and `+0`, return true
4. Otherwise, compare values

**`Object.is()` SameValue:**
- Handles `NaN === NaN` as true
- Handles `+0 === -0` as false
- Otherwise identical to `===`

```javascript
// == coercion chain
"0" == false
"0" == 0       // false → 0
0 == 0         // true

// Unexpected coercion
[] == ![]      // true
// [] == false → "" == 0 → 0 == 0
```
</details>

<details>
<summary>Common misconceptions</summary>
- `==` is not "slower" than `===` in modern engines (both are highly optimized)
- `===` does not "check type first" (they're equally fast)
- `[] == []` and `{} == {}` are both false (different object references)
- `NaN === NaN` being false is IEEE 754 spec behavior, not a JavaScript quirk
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- When `==` coercion is safe vs dangerous
- Understanding of `[] == ![]` or similar puzzles
- `NaN` comparison handling
- Why strict equality is preferred
- Use cases for `Object.is()`
- Ability to predict coercion outcomes
</details>
