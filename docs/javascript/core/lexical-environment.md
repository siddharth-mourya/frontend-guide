# Lexical Environment

## ⚡ Quick Revision

- Data structure holding variable bindings in a scope
- Two components: Environment Record (variables) + reference to outer environment
- Created when code enters a scope (function, block, module)
- Enables closures and scope chain resolution
- Immutable structure (new environment for each scope entry)
- Global environment has `null` as outer reference

```javascript
// Each function call creates new lexical environment
function outer() {
  let x = 1;  // stored in outer's environment record
  
  function inner() {
    let y = 2;  // stored in inner's environment record
    console.log(x + y);  // x resolved via outer reference
  }
  
  return inner;
}
```

**Structure:**
```
Lexical Environment = {
  Environment Record: { /* variables */ },
  Outer Reference: <parent lexical environment>
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Lexical environments are the internal mechanism implementing scope and closures. They formalize how JavaScript resolves variable names and maintains scope chains.

The spec uses lexical environments to precisely define variable lookup, closure behavior, and memory management.
</details>

<details>
<summary>How it works</summary>
**Environment types:**
- **Global Environment:** Top-level, outer is `null`, contains global object bindings
- **Function Environment:** Created on function call, includes `this`, `arguments`, parameters
- **Block Environment:** Created for `let`/`const` blocks
- **Module Environment:** One per module, contains imports/exports

**Variable resolution:**
1. Check current environment record
2. If not found, check outer environment
3. Repeat until found or reach global
4. If not found in global, ReferenceError

**Closure capture:**
```javascript
function createCounter() {
  let count = 0;  // lives in createCounter's environment
  
  return function() {
    count++;  // accesses outer environment
    return count;
  };
}
const counter = createCounter();
// counter function maintains reference to createCounter's environment
// That environment stays alive even after createCounter returned
```

**Temporal Dead Zone (TDZ):**
- Variables exist in environment but uninitialized
- Accessing before declaration throws ReferenceError
- Applies to `let`, `const`, `class`

```javascript
{
  // TDZ starts
  console.log(x);  // ReferenceError
  let x = 5;  // TDZ ends
}
```
</details>

<details>
<summary>Common misconceptions</summary>
- Lexical environment is not the same as scope (it's the mechanism implementing scope)
- Not a JavaScript object you can access (internal spec mechanism)
- Created at code evaluation time, not runtime (closures capture environment reference)
- `var` creates bindings in function environment, not block environment
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- How closures work at implementation level
- Explaining variable resolution mechanism
- Understanding TDZ in terms of environment initialization
- Why `let`/`const` are block-scoped
- Memory implications of environment retention
- Relationship between lexical environment and execution context
</details>
