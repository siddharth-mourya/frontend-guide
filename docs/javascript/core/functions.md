# Functions

## ⚡ Quick Revision

- **Function Declaration**: Hoisted, can be called before definition
- **Function Expression**: Not hoisted, assigned to variable
- **Arrow Function**: Lexical `this`, no `arguments`, implicit return
- **IIFE**: Immediately Invoked Function Expression, creates isolated scope
- **Higher-Order Function**: Takes function as argument or returns function

### Key Points

- Function declarations are fully hoisted (name and implementation)
- Arrow functions don't have their own `this`, `arguments`, or `prototype`
- IIFEs are useful for data privacy and avoiding global pollution
- Higher-order functions enable functional programming patterns
- Arrow functions can't be constructors (no `new`)

### Function Declaration vs Expression

```javascript
// Function Declaration - Hoisted
console.log(declared()); // "Works!" - hoisted
function declared() {
  return "Works!";
}

// Function Expression - Not hoisted
console.log(expressed()); // ReferenceError
const expressed = function() {
  return "Works!";
};

// Named Function Expression
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // Can call 'fact' recursively
};
console.log(factorial.name); // "fact"
```

### Arrow Functions

```javascript
// Traditional function
const traditional = function(a, b) {
  return a + b;
};

// Arrow function - concise
const arrow = (a, b) => a + b; // Implicit return

// With block body - explicit return needed
const arrowBlock = (a, b) => {
  const sum = a + b;
  return sum;
};

// Single parameter - parentheses optional
const double = x => x * 2;

// No parameters - parentheses required
const greet = () => "Hello!";

// Returning object literal - wrap in parentheses
const makeObj = (key, value) => ({ [key]: value });
```

### IIFE (Immediately Invoked Function Expression)

```javascript
// Classic IIFE syntax
(function() {
  const privateVar = 'secret';
  console.log('IIFE executed');
})();

// Arrow IIFE
(() => {
  console.log('Arrow IIFE');
})();

// IIFE with parameters
(function(name) {
  console.log(`Hello, ${name}!`);
})('World');

// Return value from IIFE
const result = (function() {
  const x = 10;
  const y = 20;
  return x + y;
})();

console.log(result); // 30
```

### Higher-Order Functions

```javascript
// Function that takes function as argument
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log); // 0, 1, 2

// Function that returns function
function multiplyBy(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Array methods are higher-order functions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15
```

### Common Pitfalls

```javascript
// Pitfall 1: Arrow function 'this' binding
const obj = {
  value: 42,
  regular: function() {
    console.log(this.value); // 42
  },
  arrow: () => {
    console.log(this.value); // undefined (lexical this)
  }
};

// Pitfall 2: Trying to use arrow as constructor
const MyClass = () => {};
new MyClass(); // TypeError: MyClass is not a constructor

// Pitfall 3: arguments in arrow function
function regular() {
  console.log(arguments); // Works
}

const arrow = () => {
  console.log(arguments); // ReferenceError in strict mode
};

// Use rest parameters instead
const arrowFixed = (...args) => {
  console.log(args); // Works!
};

// Pitfall 4: Forgetting return with arrow function block
const broken = (x) => { x * 2 }; // Returns undefined!
const fixed = (x) => { return x * 2 }; // Returns x * 2
const concise = (x) => x * 2; // Implicit return
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Need for Different Function Types

**Function Declarations**
- **Hoisting**: Allows organizing code logically
- **Named functions**: Better stack traces for debugging
- **Traditional behavior**: Compatible with older JavaScript

**Function Expressions**
- **First-class values**: Can assign to variables, pass around
- **Conditional creation**: Create functions based on conditions
- **Closure creation**: Capture surrounding scope

**Arrow Functions (ES6)**
- **Conciseness**: Less boilerplate for simple functions
- **Lexical this**: Solve the `this` binding problem
- **Callbacks**: Perfect for array methods and event handlers

**IIFE**
- **Module pattern**: Before ES6 modules existed
- **Data privacy**: Create private variables
- **Avoid globals**: Don't pollute global namespace

**Higher-Order Functions**
- **Abstraction**: Separate what to do from how to do it
- **Reusability**: Generic functions that work with different operations
- **Functional programming**: Enable declarative coding style

### Historical Evolution

```javascript
// 1995: Original function syntax
function add(a, b) {
  return a + b;
}

// Late 1990s: IIFE pattern emerges
(function() {
  // Module pattern
})();

// 2009 (ES5): Function expressions common
const add = function(a, b) {
  return a + b;
};

// 2015 (ES6): Arrow functions
const add = (a, b) => a + b;
```
</details>

<details>
<summary>How it works</summary>
### Function Declaration Mechanics

```javascript
// Function declarations are hoisted completely
console.log(hoisted()); // Works!

function hoisted() {
  return 'I am hoisted';
}

// Internally, it's like this:
// 1. Function object created in creation phase
// 2. Assigned to identifier in variable environment
// 3. Available throughout scope
```

### Function Expression Mechanics

```javascript
// Variable is hoisted, but assignment is not
console.log(typeof notYet); // 'undefined'
console.log(notYet); // undefined (var) or ReferenceError (let/const)

var notYet = function() {
  return 'Now I exist';
};

// With let/const - TDZ applies
const expr = function() {
  return 'Expression';
};
```

### Arrow Function Mechanics

```javascript
// Arrow functions don't have:
// 1. Their own 'this'
// 2. 'arguments' object
// 3. 'super' binding
// 4. 'new.target'
// 5. 'prototype' property

const arrow = () => {
  console.log(this); // Lexical this
  console.log(arguments); // Error!
  console.log(new.target); // Error!
};

// 'this' binding example
function Timer() {
  this.seconds = 0;
  
  // setInterval callback
  setInterval(() => {
    this.seconds++; // 'this' refers to Timer instance
    console.log(this.seconds);
  }, 1000);
}

// Compare with traditional function
function TimerBroken() {
  this.seconds = 0;
  
  setInterval(function() {
    this.seconds++; // 'this' is window/undefined!
    console.log(this.seconds); // NaN
  }, 1000);
}
```

### IIFE Mechanics

```javascript
// IIFE creates and executes immediately
// Creates new function scope

// Why parentheses are needed:
function() {} // SyntaxError: Function statement requires a name

(function() {}) // Expression context - valid

// Variations that work:
(function() {})(); // Parentheses around function
(function() {}()); // Parentheses around invocation
!function() {}(); // Unary operator
+function() {}(); // Unary operator
void function() {}(); // void operator

// Module pattern with IIFE
const module = (function() {
  // Private variables
  let privateVar = 'secret';
  
  // Public API
  return {
    getPrivate() {
      return privateVar;
    },
    setPrivate(val) {
      privateVar = val;
    }
  };
})();

console.log(module.getPrivate()); // 'secret'
module.setPrivate('new value');
console.log(privateVar); // ReferenceError: not accessible
```

### Higher-Order Function Mechanics

```javascript
// HOF: Function that operates on functions

// 1. Takes function as argument
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling with args:`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3); 
// Logs: "Calling with args: [2, 3]"
// Logs: "Result: 5"

// 2. Returns function (closure)
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const triple = createMultiplier(3);
console.log(triple(5)); // 15

// 3. Function composition
const compose = (...fns) => x => 
  fns.reduceRight((acc, fn) => fn(acc), x);

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const pipeline = compose(square, double, addOne);
console.log(pipeline(2)); // ((2 + 1) * 2)² = 36
```

### Function Properties and Methods

```javascript
// Functions are objects!
function myFunc() {}

// Properties
console.log(myFunc.name); // 'myFunc'
console.log(myFunc.length); // Number of parameters

// Methods
myFunc.call(thisArg, arg1, arg2);
myFunc.apply(thisArg, [arg1, arg2]);
const bound = myFunc.bind(thisArg);

// Arrow functions don't have some properties
const arrow = () => {};
console.log(arrow.prototype); // undefined
arrow.call({}); // 'this' still lexical
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Arrow functions are just shorter syntax"

**Reality**: They have different behavior (this, arguments, prototype)

```javascript
// Not just syntax!
const obj = {
  value: 42,
  getValue: () => this.value // Won't work!
};

console.log(obj.getValue()); // undefined

// Fix: Use regular function
const obj2 = {
  value: 42,
  getValue() {
    return this.value; // Works!
  }
};
```

### Misconception 2: "Function expressions are worse than declarations"

**Reality**: Each has its use case

```javascript
// Declarations: Good for top-level, hoisted functions
function publicAPI() {
  // Can call before definition
}

// Expressions: Good for conditional creation, callbacks
const handler = isAdmin ? 
  function() { /* admin */ } : 
  function() { /* user */ };

// Can't do this with declarations
```

### Misconception 3: "IIFE is obsolete with ES6 modules"

**Reality**: Still useful for one-time initialization, avoiding TDZ

```javascript
// Initialize complex value
const config = (() => {
  const env = process.env.NODE_ENV;
  const base = { /* ... */ };
  
  if (env === 'production') {
    return { ...base, prod: true };
  }
  return { ...base, dev: true };
})();

// Can't do this with regular code without intermediate variables
```

### Misconception 4: "Arrow functions are faster"

**Reality**: Performance difference is negligible

```javascript
// Both are optimized by modern engines
const regular = function(x) { return x * 2; };
const arrow = x => x * 2;

// Choose based on behavior needs, not performance
```

### Misconception 5: "Higher-order functions are slow"

**Reality**: Modern engines optimize them well

```javascript
// This is fine:
const result = array.map(x => x * 2).filter(x => x > 10);

// Premature optimization:
const result = [];
for (let x of array) {
  const doubled = x * 2;
  if (doubled > 10) result.push(doubled);
}

// Use readable code unless profiling shows actual bottleneck
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What's the difference between function declaration and expression?"**

```javascript
// Declaration - hoisted
canCallEarly(); // Works!
function canCallEarly() {
  return 'Hoisted';
}

// Expression - not hoisted
cannotCallEarly(); // ReferenceError
const cannotCallEarly = function() {
  return 'Not hoisted';
};

// Key differences:
// 1. Hoisting behavior
// 2. Name binding (can be anonymous)
// 3. Conditional creation possible with expressions
```

**Q2: "When should you use arrow functions?"**

```javascript
// Good use cases:
// 1. Array methods
const doubled = [1, 2, 3].map(x => x * 2);

// 2. Callbacks where you need parent 'this'
class Timer {
  start() {
    setInterval(() => {
      this.tick(); // 'this' is Timer instance
    }, 1000);
  }
}

// Bad use cases:
// 1. Object methods
const obj = {
  value: 42,
  getValue: () => this.value // Wrong! 'this' is not obj
};

// 2. Constructors
const MyClass = () => {}; // Can't use 'new'

// 3. When you need 'arguments'
const fn = () => {
  console.log(arguments); // ReferenceError
};
```

**Q3: "Explain IIFE and give a practical example"**

```javascript
// IIFE: Immediately Invoked Function Expression

// Practical example: jQuery pattern
(function($) {
  // $ is guaranteed to be jQuery, even if global $ changes
  $('.element').hide();
})(jQuery);

// Module pattern
const counter = (function() {
  let count = 0; // Private
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
})();

counter.increment(); // 1
counter.count; // undefined - private!

// One-time initialization
const API_KEY = (() => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PROD_API_KEY;
  }
  return 'dev-key-123';
})();
```

**Q4: "What are higher-order functions? Give examples."**

```javascript
// HOF: Function that:
// 1. Takes function(s) as argument(s), OR
// 2. Returns a function

// Example 1: Takes function
function retry(fn, times) {
  return function(...args) {
    for (let i = 0; i < times; i++) {
      try {
        return fn(...args);
      } catch (e) {
        if (i === times - 1) throw e;
      }
    }
  };
}

const unreliable = () => {
  if (Math.random() < 0.5) throw new Error();
  return 'Success';
};

const reliableVersion = retry(unreliable, 3);

// Example 2: Returns function
function createGreeting(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeting('Hello');
const sayHi = createGreeting('Hi');

console.log(sayHello('World')); // "Hello, World!"
console.log(sayHi('There')); // "Hi, There!"

// Built-in HOFs
[1, 2, 3].map(x => x * 2); // map is HOF
[1, 2, 3].filter(x => x > 1); // filter is HOF
[1, 2, 3].reduce((a, b) => a + b); // reduce is HOF
```

**Q5: "Fix this code:"**

```javascript
// Problem: 'this' binding in callback
const obj = {
  value: 42,
  getValue: function() {
    setTimeout(function() {
      console.log(this.value); // undefined!
    }, 1000);
  }
};

// Solution 1: Arrow function
const obj = {
  value: 42,
  getValue: function() {
    setTimeout(() => {
      console.log(this.value); // 42
    }, 1000);
  }
};

// Solution 2: Store 'this'
const obj = {
  value: 42,
  getValue: function() {
    const self = this;
    setTimeout(function() {
      console.log(self.value); // 42
    }, 1000);
  }
};

// Solution 3: bind
const obj = {
  value: 42,
  getValue: function() {
    setTimeout(function() {
      console.log(this.value); // 42
    }.bind(this), 1000);
  }
};
```

### Advanced Interview Questions

**Q6: "What's a named function expression and why use it?"**

```javascript
// Named function expression
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1); // Can reference itself
};

// Benefits:
// 1. Better stack traces
// 2. Recursion without using outer variable name
// 3. Self-documenting

// The name is only available inside the function
console.log(factorial.name); // 'fact'
console.log(fact); // ReferenceError - not in outer scope
```

**Q7: "Implement a function that can be called multiple ways"**

```javascript
// Implement: add(2, 3) => 5, add(2)(3) => 5

function add(a, b) {
  if (b !== undefined) {
    return a + b;
  }
  return function(b) {
    return a + b;
  };
}

console.log(add(2, 3)); // 5
console.log(add(2)(3)); // 5

// Advanced: Unlimited currying
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
```

### Pro Tips for Interviews

1. **Know when to use each type**: Declaration vs expression vs arrow
2. **Explain this binding**: Key difference in arrow functions
3. **Show practical examples**: IIFE for module pattern
4. **Demonstrate HOFs**: map, filter, reduce
5. **Mention closures**: HOFs create closures
6. **Performance note**: Mention engines optimize well
</details>
