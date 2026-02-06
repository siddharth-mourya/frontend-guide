# ES6+ Features

## ⚡ Quick Revision

- **Spread (`...`)**: Expands iterables into individual elements
- **Rest (`...`)**: Collects multiple elements into array
- **Destructuring**: Extract values from objects/arrays
- **Template Literals**: String interpolation with backticks
- **Optional Chaining (`?.`)**: Safely access nested properties
- **Nullish Coalescing (`??`)**: Default value for null/undefined only

### Key Points

- Spread and rest use same syntax (`...`) but opposite purposes
- Destructuring reduces boilerplate code
- Template literals support multiline strings and expressions
- Optional chaining short-circuits on null/undefined
- Nullish coalescing different from `||` (only null/undefined, not falsy)
- Symbols create unique identifiers

### Spread Operator

```javascript
// Array spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Combine arrays
const combined = [...arr1, ...arr2];

// Clone array (shallow)
const clone = [...arr1];

// Object spread
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Override properties
const updated = { ...obj1, b: 99 }; // { a: 1, b: 99 }

// Clone object (shallow)
const objClone = { ...obj1 };

// Function arguments
Math.max(...[1, 2, 3]); // 3
// Same as: Math.max(1, 2, 3)

// Copy arrays
const original = [1, 2, 3];
const copy = [...original]; // Shallow copy
copy.push(4);
console.log(original); // [1, 2, 3] (unchanged)
```

### Rest Parameters

```javascript
// Collect remaining arguments
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3, 4); // 10

// Must be last parameter
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(' and ')}!`;
}

greet('Hello', 'Alice', 'Bob'); // "Hello, Alice and Bob!"

// Array destructuring
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest); // [2, 3, 4]

// Object destructuring
const { a, ...others } = { a: 1, b: 2, c: 3 };
console.log(a); // 1
console.log(others); // { b: 2, c: 3 }
```

### Destructuring

```javascript
// Array destructuring
const [a, b] = [1, 2];
const [first, , third] = [1, 2, 3]; // Skip elements
const [x, y, z = 0] = [1, 2]; // Default values

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a]; // a = 2, b = 1

// Object destructuring
const { name, age } = { name: 'Alice', age: 30 };

// Rename variables
const { name: userName } = { name: 'Alice' };
console.log(userName); // 'Alice'

// Default values
const { x = 0, y = 0 } = { x: 10 };
console.log(x, y); // 10, 0

// Nested destructuring
const { user: { name } } = { user: { name: 'Bob' } };

// Function parameters
function greet({ name, age }) {
  return `${name} is ${age}`;
}

greet({ name: 'Alice', age: 30 });

// Rest in destructuring
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
console.log(rest); // { c: 3, d: 4 }
```

### Template Literals

```javascript
// String interpolation
const name = 'Alice';
const greeting = `Hello, ${name}!`; // "Hello, Alice!"

// Expressions
const price = 10;
const tax = 0.1;
const total = `Total: $${(price * (1 + tax)).toFixed(2)}`;

// Multiline strings
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// Tagged templates
function tag(strings, ...values) {
  console.log(strings); // Array of string parts
  console.log(values); // Array of interpolated values
}

const name = 'World';
tag`Hello ${name}!`;
// strings: ['Hello ', '!']
// values: ['World']

// Practical: HTML escaping
function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const escaped = String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return result + escaped + str;
  });
}

const userInput = '<script>alert("XSS")</script>';
const safe = html`<div>${userInput}</div>`;
// <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
```

### Optional Chaining

```javascript
// Safely access nested properties
const user = {
  address: {
    street: '123 Main St'
  }
};

// Without optional chaining
const zip = user.address && user.address.zip;

// With optional chaining
const zip = user.address?.zip; // undefined (no error)

// Method calls
user.getAddress?.(); // Calls if exists, undefined otherwise

// Array access
const firstItem = array?.[0]; // Safe array access

// Real-world example
const response = await fetch('/api/user');
const data = await response.json();
const userName = data?.user?.profile?.name ?? 'Anonymous';

// Short-circuits on null/undefined
const obj = { a: { b: null } };
const value = obj.a.b?.c; // undefined (stops at null)

// Combining with nullish coalescing
const name = user?.profile?.name ?? 'Guest';
```

### Nullish Coalescing

```javascript
// Returns right side if left is null or undefined
const value = null ?? 'default'; // 'default'
const value = undefined ?? 'default'; // 'default'

// Difference from || (logical OR)
const value1 = 0 || 'default'; // 'default' (0 is falsy)
const value2 = 0 ?? 'default'; // 0 (only null/undefined)

const value3 = '' || 'default'; // 'default' (empty string is falsy)
const value4 = '' ?? 'default'; // '' (only null/undefined)

const value5 = false || 'default'; // 'default' (false is falsy)
const value6 = false ?? 'default'; // false (only null/undefined)

// Use cases where ?? is better
function setConfig(options) {
  const config = {
    timeout: options.timeout ?? 5000, // 0 is valid timeout
    retries: options.retries ?? 3,    // 0 is valid retries
    verbose: options.verbose ?? false // false is valid option
  };
}

// Combining with optional chaining
const name = user?.profile?.name ?? 'Anonymous';
```

### Common Pitfalls

```javascript
// Pitfall 1: Shallow copy with spread
const original = { a: { b: 1 } };
const copy = { ...original };
copy.a.b = 2;
console.log(original.a.b); // 2 (nested object shared!)

// Fix: Deep clone
const deepCopy = JSON.parse(JSON.stringify(original));
// Or use structuredClone
const deepCopy = structuredClone(original);

// Pitfall 2: Rest must be last
function wrong(...rest, last) {} // SyntaxError!
function correct(first, ...rest) {} // OK

// Pitfall 3: Destructuring null/undefined
const { name } = null; // TypeError!

// Fix: Default to empty object
const { name } = nullableObject ?? {};

// Pitfall 4: Optional chaining doesn't stop at falsy values
const obj = { value: 0 };
const result = obj?.value ?? 10; // 0 (not 10!)
// ?. stops at null/undefined, not falsy

// Pitfall 5: Mixing || and ??
const value = null || undefined ?? 'default'; // SyntaxError!
// Fix: Use parentheses
const value = (null || undefined) ?? 'default';
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Problems Before ES6

**Array Operations**
```javascript
// Pre-ES6: Verbose array copying
var arr1 = [1, 2, 3];
var arr2 = arr1.concat([4, 5]);

// Pre-ES6: Apply method for spreading
var max = Math.max.apply(null, [1, 2, 3]);

// ES6+: Spread operator
const arr2 = [...arr1, 4, 5];
const max = Math.max(...[1, 2, 3]);
```

**Object Operations**
```javascript
// Pre-ES6: Object.assign
var obj1 = { a: 1 };
var obj2 = Object.assign({}, obj1, { b: 2 });

// ES6+: Object spread
const obj2 = { ...obj1, b: 2 };
```

**Variable Extraction**
```javascript
// Pre-ES6: Manual extraction
var user = { name: 'Alice', age: 30 };
var name = user.name;
var age = user.age;

// ES6+: Destructuring
const { name, age } = user;
```

**String Building**
```javascript
// Pre-ES6: Concatenation
var message = 'Hello, ' + name + '!';
var html = '<div>' +
  '<h1>' + title + '</h1>' +
  '</div>';

// ES6+: Template literals
const message = `Hello, ${name}!`;
const html = `
  <div>
    <h1>${title}</h1>
  </div>
`;
```

**Nested Access**
```javascript
// Pre-ES6: Manual checking
var street = user && user.address && user.address.street;

// ES6+: Optional chaining
const street = user?.address?.street;
```

### Why These Features Matter

1. **Readability**: More expressive, less boilerplate
2. **Safety**: Optional chaining prevents runtime errors
3. **Convenience**: Destructuring, spread reduce code
4. **Flexibility**: Rest parameters, template literals
5. **Modern patterns**: Enable functional programming styles
</details>

<details>
<summary>How it works</summary>
### Spread Operator Mechanics

```javascript
// Spread calls iterator protocol
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

const arr = [...iterable]; // [0, 1, 2]

// Object spread uses Object.assign internally
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };

// Equivalent to:
const obj2 = Object.assign({}, obj1, { b: 2 });

// Shallow copy behavior
const original = { a: { b: 1 } };
const copy = { ...original };

// Both reference same nested object
console.log(copy.a === original.a); // true
```

### Destructuring Mechanics

```javascript
// Array destructuring uses iterator
const [a, b] = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 2) {
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};
console.log(a, b); // 0, 1

// Object destructuring uses property access
const obj = { x: 1, y: 2 };
const { x, y } = obj;

// Transpiled to:
var x = obj.x;
var y = obj.y;

// Default values evaluated only if undefined
const { a = expensiveFunction() } = { a: 1 };
// expensiveFunction() NOT called (a is defined)

const { b = expensiveFunction() } = {};
// expensiveFunction() IS called (b is undefined)
```

### Template Literals Mechanics

```javascript
// Template literals are function calls
const name = 'World';
const str = `Hello ${name}!`;

// Transpiled to something like:
const str = 'Hello ' + name + '!';

// Tagged templates
function tag(strings, ...values) {
  // strings: array of string parts
  // values: array of interpolated values
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
}

const result = tag`Hello ${name}!`;

// Engine calls:
// tag(['Hello ', '!'], 'World')
```

### Optional Chaining Mechanics

```javascript
// Optional chaining short-circuits
const obj = { a: null };
const value = obj.a?.b?.c;

// Transpiled to:
const value = 
  obj.a !== null && obj.a !== undefined
    ? (obj.a.b !== null && obj.a.b !== undefined
      ? obj.a.b.c
      : undefined)
    : undefined;

// Short-circuits on first null/undefined
let evaluations = 0;
const result = null?.(() => { evaluations++; })();
console.log(evaluations); // 0 (function never called)
```

### Nullish Coalescing Mechanics

```javascript
// ?? checks for null or undefined only
const value = left ?? right;

// Equivalent to:
const value = (left !== null && left !== undefined) ? left : right;

// Not equivalent to:
const value = left || right; // Checks for falsy

// Examples:
0 ?? 'default'; // 0
0 || 'default'; // 'default'

false ?? 'default'; // false
false || 'default'; // 'default'

'' ?? 'default'; // ''
'' || 'default'; // 'default'
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Spread creates deep copy"

**Reality**: Spread creates shallow copy

```javascript
const original = {
  name: 'Alice',
  address: { city: 'NYC' }
};

const copy = { ...original };

copy.address.city = 'LA';
console.log(original.address.city); // 'LA' (modified!)

// Deep copy needed for nested structures
const deepCopy = JSON.parse(JSON.stringify(original));
// Or
const deepCopy = structuredClone(original);
```

### Misconception 2: "Optional chaining returns null"

**Reality**: Returns undefined

```javascript
const obj = { a: null };
const value = obj.a?.b;

console.log(value); // undefined (not null!)
console.log(value === null); // false
console.log(value === undefined); // true
```

### Misconception 3: "?? and || are interchangeable"

**Reality**: Different behavior with falsy values

```javascript
// || treats all falsy values as reason to use default
const port = 0 || 3000; // 3000 (0 is falsy)
const name = '' || 'Anonymous'; // 'Anonymous' ('' is falsy)
const flag = false || true; // true (false is falsy)

// ?? only treats null/undefined as reason to use default
const port = 0 ?? 3000; // 0 (0 is valid value)
const name = '' ?? 'Anonymous'; // '' ('' is valid value)
const flag = false ?? true; // false (false is valid value)

// Use ?? when 0, '', or false are valid values
```

### Misconception 4: "Rest and spread are different operators"

**Reality**: Same syntax, different contexts

```javascript
// Spread: Expands (right side of =)
const arr = [1, 2, 3];
const copy = [...arr]; // Spread

// Rest: Collects (left side of =, or function params)
const [first, ...rest] = arr; // Rest
function sum(...numbers) {} // Rest

// Same syntax (...), different purpose based on context
```

### Misconception 5: "Destructuring works with null"

**Reality**: TypeError with null/undefined

```javascript
const { name } = null; // TypeError!
const [first] = undefined; // TypeError!

// Safe destructuring with defaults
const { name } = nullableObj ?? {};
const [first] = nullableArray ?? [];

// Or optional chaining
const name = obj?.name;
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What's the difference between spread and rest?"**

```javascript
// Same syntax (...), different contexts

// SPREAD: Expands array/object
const arr = [1, 2, 3];
const copy = [...arr]; // Spread: expands arr
const merged = [...arr1, ...arr2]; // Spread: expands both

const obj = { a: 1, b: 2 };
const clone = { ...obj }; // Spread: expands obj

// REST: Collects multiple elements into array
function sum(...numbers) { // Rest: collects arguments
  return numbers.reduce((a, b) => a + b);
}

const [first, ...rest] = [1, 2, 3]; // Rest: collects remaining
// first = 1, rest = [2, 3]

const { a, ...others } = { a: 1, b: 2, c: 3 }; // Rest: collects remaining
// a = 1, others = { b: 2, c: 3 }

// Key difference:
// - Spread: right side (expanding)
// - Rest: left side or params (collecting)
```

**Q2: "Explain optional chaining and nullish coalescing"**

```javascript
// OPTIONAL CHAINING (?.)
// Safely access nested properties
// Returns undefined if null/undefined encountered

const user = { address: { city: 'NYC' } };

// Without optional chaining
const city = user && user.address && user.address.city;

// With optional chaining
const city = user?.address?.city; // 'NYC'

// Returns undefined if any part is null/undefined
const zip = user?.address?.zip; // undefined (not error)

// Method calls
user.getAddress?.(); // Calls if exists, undefined otherwise

// Array access
const first = arr?.[0]; // Safe even if arr is null

// NULLISH COALESCING (??)
// Default value for null/undefined ONLY

const value = null ?? 'default'; // 'default'
const value = undefined ?? 'default'; // 'default'

// Different from ||
const port = 0 || 8080; // 8080 (0 is falsy)
const port = 0 ?? 8080; // 0 (only null/undefined)

// Combining both
const name = user?.profile?.name ?? 'Anonymous';
// Safe access + default value
```

**Q3: "How does destructuring work?"**

```javascript
// Array destructuring - uses position
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// Skip elements
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1, 3

// Default values
const [x = 0, y = 0] = [10];
console.log(x, y); // 10, 0

// Rest
const [head, ...tail] = [1, 2, 3, 4];
console.log(head, tail); // 1, [2, 3, 4]

// Object destructuring - uses property names
const { name, age } = { name: 'Alice', age: 30 };

// Rename
const { name: userName } = { name: 'Alice' };
console.log(userName); // 'Alice'

// Default values
const { x = 0 } = {};
console.log(x); // 0

// Nested
const { user: { name } } = { user: { name: 'Bob' } };

// Function parameters
function greet({ name, age = 18 }) {
  return `${name} is ${age}`;
}

greet({ name: 'Alice', age: 30 }); // "Alice is 30"
greet({ name: 'Bob' }); // "Bob is 18" (default age)

// Swapping variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1
```

**Q4: "What are template literals used for?"**

```javascript
// 1. String interpolation
const name = 'Alice';
const age = 30;
const message = `${name} is ${age} years old`;

// 2. Multiline strings
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// 3. Expression evaluation
const price = 10.5;
const tax = 0.1;
const total = `Total: $${(price * (1 + tax)).toFixed(2)}`;

// 4. Tagged templates (advanced)
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const highlighted = value ? `<mark>${value}</mark>` : '';
    return result + highlighted + str;
  });
}

const name = 'Alice';
const html = highlight`Hello ${name}!`;
// "Hello <mark>Alice</mark>!"

// 5. SQL queries (with libraries)
const query = sql`
  SELECT * FROM users
  WHERE id = ${userId}
`;
// Library escapes userId to prevent SQL injection

// 6. Styled components
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  font-size: ${props => props.size}px;
`;
```

**Q5: "Explain shallow vs deep copy with spread"**

```javascript
// SHALLOW COPY - only top level copied
const original = {
  name: 'Alice',
  address: { city: 'NYC' }
};

const shallow = { ...original };

// Top-level properties are independent
shallow.name = 'Bob';
console.log(original.name); // 'Alice' (unchanged)

// Nested objects are shared
shallow.address.city = 'LA';
console.log(original.address.city); // 'LA' (changed!)

// Why? Spread only copies references
console.log(shallow.address === original.address); // true (same object!)

// DEEP COPY solutions:

// 1. JSON (simple but limited)
const deep = JSON.parse(JSON.stringify(original));
// Limitations:
// - No functions
// - No undefined
// - No Dates (become strings)
// - No circular references

// 2. structuredClone (modern)
const deep = structuredClone(original);
// Handles most cases, including:
// - Dates
// - RegExp
// - Map, Set
// - Circular references
// But not functions

// 3. Lodash cloneDeep (full solution)
const deep = _.cloneDeep(original);

// 4. Manual recursive
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  );
}
```

### Advanced Interview Questions

**Q6: "Implement object pick using destructuring"**

```javascript
// Pick specific properties from object
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

// Using destructuring
function pick(obj, ...keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

const user = { name: 'Alice', age: 30, city: 'NYC' };
const picked = pick(user, 'name', 'age');
// { name: 'Alice', age: 30 }

// Implement omit (opposite)
function omit(obj, ...keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

const omitted = omit(user, 'age');
// { name: 'Alice', city: 'NYC' }
```

**Q7: "Create a safe get function"**

```javascript
// Safe nested property access
function get(obj, path, defaultValue) {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result?.[key] === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result ?? defaultValue;
}

// Usage
const user = {
  profile: {
    address: {
      city: 'NYC'
    }
  }
};

get(user, 'profile.address.city'); // 'NYC'
get(user, 'profile.address.zip', 'N/A'); // 'N/A'

// Modern version with optional chaining
function get(obj, path, defaultValue) {
  const result = path
    .split('.')
    .reduce((current, key) => current?.[key], obj);
  
  return result ?? defaultValue;
}
```

### Pro Tips for Interviews

1. **Know the differences**: Spread vs rest, || vs ??
2. **Shallow copy gotcha**: Mention nested object issue
3. **Practical examples**: Show real-world usage
4. **Combine features**: ?. with ??, destructuring with defaults
5. **Performance**: Mention when these features matter
6. **Transpilation**: Know these compile to ES5
7. **Browser support**: Optional chaining, nullish coalescing are newer
</details>
