# bind, call, and apply

## ⚡ Quick Revision

- All three methods control function `this` binding explicitly
- `call(thisArg, arg1, arg2, ...)` - calls function immediately with arguments listed
- `apply(thisArg, [args])` - calls function immediately with arguments as array
- `bind(thisArg, arg1, ...)` - returns new function with bound `this` (doesn't call immediately)

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// call - immediate execution, individual arguments
greet.call(person, 'Hello', '!');  // "Hello, Alice!"

// apply - immediate execution, array of arguments
greet.apply(person, ['Hi', '?']);  // "Hi, Alice?"

// bind - returns new function, can be called later
const boundGreet = greet.bind(person, 'Hey');
boundGreet('.');  // "Hey, Alice."
```

**Common use cases:**

```javascript
// Borrowing methods
const numbers = { data: [1, 2, 3, 4, 5] };
const max = Math.max.apply(null, numbers.data);  // 5

// Event handlers in React (pre-hooks)
class Button extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    console.log(this);  // Component instance
  }
}

// Function currying with bind
function multiply(a, b) {
  return a * b;
}
const double = multiply.bind(null, 2);
double(5);  // 10

// Array-like objects
function sum() {
  const args = Array.prototype.slice.call(arguments);
  return args.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);  // 10
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JavaScript's dynamic `this` binding is powerful but can cause confusion when functions are passed as callbacks or methods are detached from objects. These methods provide explicit control over `this` context.

They enable functional patterns like method borrowing, partial application, and controlled execution context.
</details>

<details>
<summary>How it works</summary>
**Internal mechanism:**
All three change the `this` binding inside the function. The function's code remains unchanged; only the execution context differs.

```javascript
// Implementation concepts (simplified)
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const fnSymbol = Symbol();
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

Function.prototype.myApply = function(context, args = []) {
  return this.myCall(context, ...args);
};

Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;
  return function(...args) {
    return fn.call(context, ...boundArgs, ...args);
  };
};
```

**Practical patterns:**

```javascript
// Method borrowing
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const arr = Array.prototype.slice.call(arrayLike);  // ['a', 'b', 'c']

// Modern alternative: Array.from()
const arr2 = Array.from(arrayLike);

// Partial application
function log(level, message) {
  console.log(`[${level}] ${message}`);
}
const error = log.bind(null, 'ERROR');
const warn = log.bind(null, 'WARN');
error('Something failed');  // [ERROR] Something failed

// Preserving context in callbacks
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    // Without bind, 'this' would be global/undefined
    setInterval(function() {
      this.seconds++;
    }.bind(this), 1000);
    
    // Modern alternative: arrow function
    setInterval(() => {
      this.seconds++;
    }, 1000);
  }
}
```

**Performance considerations:**
- `call` and `apply` have similar performance (modern engines optimize both)
- `bind` creates new function (memory overhead)
- Arrow functions capture `this` lexically (no runtime binding needed)

**Modern alternatives:**
```javascript
// Instead of apply with array
Math.max.apply(null, numbers);
Math.max(...numbers);  // Spread operator

// Instead of bind for React
class Button extends Component {
  handleClick = () => {  // Arrow property
    console.log(this);
  }
}

// Instead of call/apply for array-like
Array.prototype.slice.call(arguments);
Array.from(arguments);  // or [...arguments]
```
</details>

<details>
<summary>Common misconceptions</summary>
- `bind` doesn't modify original function (returns new one)
- Can't re-bind already bound function (first bind wins)
- Arrow functions ignore `call`/`apply`/`bind` for `this`
- `apply` isn't always needed (spread operator often better)
- Binding in constructor isn't automatic (React class components)
- `call` and `apply` performance difference is negligible in modern engines
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Implementing custom `call`, `apply`, or `bind`
- Explaining `this` binding differences
- When to use each method
- Solving context loss in callbacks
- Modern alternatives (arrow functions, spread)
- Partial application and currying
- Performance implications
- Relationship with arrow functions
</details>
