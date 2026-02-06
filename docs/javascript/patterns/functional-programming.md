# Functional Programming

## ⚡ Quick Revision

- **Functional Programming (FP):** Programming paradigm treating computation as evaluation of mathematical functions
- **Core principles:** Pure functions, immutability, no side effects, declarative code
- **Key concepts:** First-class functions, higher-order functions, composition, map/filter/reduce
- Emphasizes what to do, not how to do it

**Pure functions:**
- Same input → same output (deterministic)
- No side effects (don't modify external state)
- Easier to test, reason about, and parallelize

```javascript
// Pure function
const add = (a, b) => a + b;
const double = x => x * 2;
const getFullName = (user) => `${user.firstName} ${user.lastName}`;

// Impure function
let count = 0;
const incrementCounter = () => count++; // Modifies external state
const random = () => Math.random(); // Non-deterministic
const logMessage = (msg) => console.log(msg); // Side effect (I/O)

// Array methods (functional style)
const numbers = [1, 2, 3, 4, 5];

// map - transform each element
numbers.map(x => x * 2); // [2, 4, 6, 8, 10]

// filter - select elements
numbers.filter(x => x % 2 === 0); // [2, 4]

// reduce - aggregate to single value
numbers.reduce((sum, x) => sum + x, 0); // 15

// Chaining
numbers
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((sum, x) => sum + x, 0); // 12
```

**Higher-order functions:**
- Take functions as arguments
- Return functions as results

```javascript
// Higher-order function examples
const withLogging = (fn) => {
  return (...args) => {
    console.log(`Calling with:`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3); // Logs: Calling with: [2, 3], Result: 5

// Array.map is a higher-order function
[1, 2, 3].map(x => x * 2); // map takes a function

// Function returning function
const multiplyBy = (factor) => (number) => number * factor;
const double = multiplyBy(2);
const triple = multiplyBy(3);
double(5); // 10
triple(5); // 15
```

**Avoiding side effects:**

```javascript
// Bad - side effects
let total = 0;
function addToTotal(value) {
  total += value; // Modifies external state
  return total;
}

// Good - pure function
function addToTotal(total, value) {
  return total + value; // Returns new value
}

// Bad - mutates input
function addItem(cart, item) {
  cart.items.push(item); // Mutates cart
  return cart;
}

// Good - returns new object
function addItem(cart, item) {
  return {
    ...cart,
    items: [...cart.items, item]
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Functional programming emerged from lambda calculus (1930s) and provides benefits for modern software development:

1. **Predictability**: Pure functions with no side effects are easier to reason about
2. **Testability**: No dependencies on external state; just input → output
3. **Composability**: Small functions combine to build complex behavior
4. **Concurrency**: Pure functions are inherently thread-safe
5. **Debugging**: Deterministic behavior makes bugs reproducible
6. **Maintainability**: Declarative code expresses intent clearly

JavaScript is multi-paradigm (OOP, FP, imperative), but modern JS heavily favors FP:
- React embraces FP principles (pure components, immutable state)
- Redux requires pure reducers
- Array methods (`map`, `filter`, `reduce`) are functional
- ES6+ features (arrow functions, destructuring, spread) enable FP
</details>

<details>
<summary>How it works</summary>
**Pure functions in depth:**
```javascript
// Pure - same input always gives same output
const add = (a, b) => a + b;
add(2, 3); // Always 5

// Impure - output depends on external state
let discount = 0.1;
const applyDiscount = (price) => price * (1 - discount);
applyDiscount(100); // Result changes if discount changes

// Impure - modifies external state
let count = 0;
const increment = () => ++count;

// Pure version
const increment = (count) => count + 1;

// Impure - I/O is a side effect
const getUser = (id) => {
  fetch(`/api/users/${id}`); // Network call
};

// Pure version - return a description of the effect
const getUserRequest = (id) => ({
  type: 'FETCH_USER',
  url: `/api/users/${id}`
});
```

**First-class and higher-order functions:**
```javascript
// First-class: functions are values
const greet = (name) => `Hello, ${name}`;
const functions = [greet]; // Store in array
const obj = { greet }; // Store in object
const passAround = (fn) => fn('World'); // Pass as argument

// Higher-order: take or return functions
const withErrorHandling = (fn) => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };
};

const riskyOperation = (x) => {
  if (x < 0) throw new Error('Negative value');
  return x * 2;
};

const safeOperation = withErrorHandling(riskyOperation);
safeOperation(-5); // Logs error, returns null
```

**Map, Filter, Reduce mechanics:**
```javascript
// Manual implementation to understand internals

// map: transform each element
Array.prototype.myMap = function(fn) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(fn(this[i], i, this));
  }
  return result;
};

// filter: select elements
Array.prototype.myFilter = function(predicate) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// reduce: aggregate to single value
Array.prototype.myReduce = function(reducer, initialValue) {
  let accumulator = initialValue;
  for (let i = 0; i < this.length; i++) {
    accumulator = reducer(accumulator, this[i], i, this);
  }
  return accumulator;
};

// Usage
[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
[1, 2, 3].myFilter(x => x > 1); // [2, 3]
[1, 2, 3].myReduce((sum, x) => sum + x, 0); // 6
```

**Side effects and referential transparency:**
```javascript
// Referential transparency: can replace function call with its result
const add = (a, b) => a + b;
const x = add(2, 3) + add(2, 3);
const y = 5 + 5; // Equivalent because add is pure

// Not referentially transparent
let counter = 0;
const increment = () => ++counter;
const x = increment() + increment(); // 1 + 2 = 3
const y = 1 + 1; // Not equivalent!

// Side effects types:
// 1. Modifying variables outside function scope
// 2. I/O operations (console, network, file system)
// 3. DOM manipulation
// 4. Throwing exceptions
// 5. Calling other impure functions
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Declarative vs Imperative:**
```javascript
// Imperative (how to do it)
const numbers = [1, 2, 3, 4, 5];
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}

// Declarative (what to do)
const doubled = numbers.map(x => x * 2);

// Imperative
function getAdults(users) {
  const adults = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].age >= 18) {
      adults.push(users[i]);
    }
  }
  return adults;
}

// Declarative
const getAdults = (users) => users.filter(u => u.age >= 18);
```

**2. Function composition patterns:**
```javascript
// Build complex operations from simple ones
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 17, active: false },
  { name: 'Charlie', age: 35, active: true }
];

// Separate concerns into small functions
const isAdult = user => user.age >= 18;
const isActive = user => user.active;
const getName = user => user.name;
const uppercase = str => str.toUpperCase();

// Compose them
const getActiveAdultNames = (users) => 
  users
    .filter(isAdult)
    .filter(isActive)
    .map(getName)
    .map(uppercase);

getActiveAdultNames(users); // ['ALICE', 'CHARLIE']
```

**3. Reduce patterns:**
```javascript
// Sum
[1, 2, 3].reduce((sum, x) => sum + x, 0); // 6

// Max
[1, 5, 3].reduce((max, x) => Math.max(max, x), -Infinity); // 5

// Group by
const users = [
  { name: 'Alice', dept: 'Eng' },
  { name: 'Bob', dept: 'Sales' },
  { name: 'Charlie', dept: 'Eng' }
];

users.reduce((groups, user) => {
  const dept = user.dept;
  if (!groups[dept]) groups[dept] = [];
  groups[dept].push(user);
  return groups;
}, {});
// { Eng: [{Alice}, {Charlie}], Sales: [{Bob}] }

// Count occurrences
['a', 'b', 'a', 'c', 'b', 'a'].reduce((counts, letter) => {
  counts[letter] = (counts[letter] || 0) + 1;
  return counts;
}, {});
// { a: 3, b: 2, c: 1 }

// Build object
const props = ['name', 'age', 'city'];
const values = ['Alice', 25, 'NYC'];
props.reduce((obj, prop, i) => {
  obj[prop] = values[i];
  return obj;
}, {});
// { name: 'Alice', age: 25, city: 'NYC' }

// Flatten array
[[1, 2], [3, 4], [5]].reduce((flat, arr) => flat.concat(arr), []);
// [1, 2, 3, 4, 5]
```

**4. Common gotchas:**

**Mutating in map/filter/reduce:**
```javascript
// Bad - mutates objects
const users = [{ name: 'Alice', age: 25 }];
const updated = users.map(user => {
  user.age += 1; // Mutates original!
  return user;
});

// Good - return new objects
const updated = users.map(user => ({
  ...user,
  age: user.age + 1
}));
```

**Forgetting to return in reduce:**
```javascript
// Bad - returns undefined after first iteration
[1, 2, 3].reduce((sum, x) => {
  sum + x; // No return!
}, 0); // undefined

// Good
[1, 2, 3].reduce((sum, x) => sum + x, 0); // 6
```

**Side effects in functional methods:**
```javascript
// Bad - side effect in map
users.map(user => {
  console.log(user); // Side effect
  return user.name;
});

// Good - separate concerns
users.forEach(user => console.log(user)); // Explicit side effect
const names = users.map(user => user.name); // Pure transformation
```

**Using forEach when map/filter is better:**
```javascript
// Bad
const doubled = [];
numbers.forEach(x => doubled.push(x * 2));

// Good
const doubled = numbers.map(x => x * 2);

// forEach is for side effects only
numbers.forEach(x => console.log(x)); // OK - explicit side effect
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about functional programming:**

1. **Definition**: "Functional programming is a paradigm that treats computation as evaluation of mathematical functions, emphasizing pure functions, immutability, and avoiding side effects."

2. **Core principles**:
   - **Pure functions**: Same input → same output, no side effects
   - **Immutability**: Data doesn't change after creation
   - **First-class functions**: Functions as values
   - **Composition**: Build complex from simple
   - **Declarative**: Express what, not how

3. **Benefits**:
   - More predictable and testable code
   - Easier debugging (deterministic)
   - Better composability and reusability
   - Inherently thread-safe
   - Clearer intent (declarative)

4. **JavaScript FP features**:
   - Array methods: `map`, `filter`, `reduce`, `some`, `every`
   - Arrow functions and closures
   - Spread operator and destructuring
   - Higher-order functions
   - Immutable operations

5. **Trade-offs**:
   - **Pro**: More maintainable, testable code
   - **Pro**: Easier to reason about
   - **Con**: Learning curve for imperative programmers
   - **Con**: Can be less performant (more copying)
   - **Con**: Not all problems fit FP naturally (UI, I/O)

6. **Practical use**:
   - Data transformations (API responses)
   - Array/collection operations
   - Redux reducers (must be pure)
   - React components (should be pure)
   - Utility libraries (Lodash, Ramda)

**Example answer**: "I use functional programming principles daily in React development. I write pure components that return the same JSX for the same props, use `map` and `filter` for rendering lists, and keep reducers pure in Redux. The key benefits are predictability and testability - pure functions are easy to test because there's no external state to mock. I avoid side effects like API calls in render logic, instead handling them in effects or middleware. The trade-off is sometimes it's more verbose, but the clarity and maintainability are worth it. For complex data transformations, I compose small functions rather than writing large imperative loops."
</details>

<details>
<summary>Real-world examples</summary>
**1. Data transformation pipeline:**
```javascript
// API response processing
const processUserData = (apiResponse) => 
  apiResponse
    .filter(user => user.active)
    .map(user => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email.toLowerCase(),
      age: calculateAge(user.birthDate)
    }))
    .filter(user => user.age >= 18)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

// Pure helper functions
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
```

**2. Redux reducer (must be pure):**
```javascript
const initialState = {
  users: [],
  loading: false,
  error: null
};

function usersReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USERS_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_USERS_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    
    case 'FETCH_USERS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        )
      };
    
    default:
      return state;
  }
}
```

**3. React component (pure):**
```javascript
// Pure component - same props = same output
function UserList({ users, onUserClick }) {
  return (
    <div>
      {users
        .filter(user => user.active)
        .map(user => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => onUserClick(user.id)}
          />
        ))}
    </div>
  );
}

// Memoized for performance
const UserCard = React.memo(({ user, onClick }) => (
  <div onClick={onClick}>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>
));
```

**4. Complex reduce operations:**
```javascript
// Calculate shopping cart total with discounts
const cart = [
  { id: 1, name: 'Book', price: 20, quantity: 2, category: 'books' },
  { id: 2, name: 'Pen', price: 5, quantity: 5, category: 'office' },
  { id: 3, name: 'Novel', price: 15, quantity: 1, category: 'books' }
];

const discounts = {
  books: 0.1, // 10% off
  office: 0.05 // 5% off
};

const calculateTotal = (cart, discounts) => 
  cart.reduce((total, item) => {
    const subtotal = item.price * item.quantity;
    const discount = discounts[item.category] || 0;
    const discounted = subtotal * (1 - discount);
    return total + discounted;
  }, 0);

calculateTotal(cart, discounts); // 57.75

// Or with composition
const getSubtotal = item => item.price * item.quantity;
const applyDiscount = (discounts) => (item) => {
  const discount = discounts[item.category] || 0;
  return getSubtotal(item) * (1 - discount);
};
const sum = (a, b) => a + b;

const calculateTotal = (cart, discounts) => 
  cart.map(applyDiscount(discounts)).reduce(sum, 0);
```

**5. Functional error handling:**
```javascript
// Result type pattern
const Result = {
  ok: (value) => ({ success: true, value }),
  error: (error) => ({ success: false, error })
};

const divide = (a, b) => 
  b === 0 
    ? Result.error('Division by zero')
    : Result.ok(a / b);

const parseNumber = (str) => {
  const num = parseFloat(str);
  return isNaN(num)
    ? Result.error(`Invalid number: ${str}`)
    : Result.ok(num);
};

// Chain operations
const safeDivision = (numeratorStr, denominatorStr) => {
  const numResult = parseNumber(numeratorStr);
  if (!numResult.success) return numResult;
  
  const denResult = parseNumber(denominatorStr);
  if (!denResult.success) return denResult;
  
  return divide(numResult.value, denResult.value);
};

safeDivision('10', '2'); // { success: true, value: 5 }
safeDivision('10', '0'); // { success: false, error: 'Division by zero' }
safeDivision('abc', '2'); // { success: false, error: 'Invalid number: abc' }
```

**6. Higher-order function patterns:**
```javascript
// Retry with exponential backoff
const retry = (fn, maxAttempts = 3, delay = 1000) => {
  return async (...args) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }
  };
};

const fetchUser = retry(
  async (id) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  3,
  1000
);

// Throttle/Debounce (functional approach)
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization (caching)
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

**7. Lodash/fp functional utilities:**
```javascript
import { flow, filter, map, sortBy, groupBy } from 'lodash/fp';

const users = [
  { name: 'Alice', age: 25, dept: 'Eng', salary: 80000 },
  { name: 'Bob', age: 30, dept: 'Sales', salary: 60000 },
  { name: 'Charlie', age: 35, dept: 'Eng', salary: 90000 }
];

// Compose data pipeline
const processUsers = flow(
  filter({ dept: 'Eng' }),
  sortBy('salary'),
  map(u => ({ name: u.name, salary: u.salary }))
);

processUsers(users);
// [{ name: 'Alice', salary: 80000 }, { name: 'Charlie', salary: 90000 }]

// Group by department
const byDept = groupBy('dept', users);
// { Eng: [Alice, Charlie], Sales: [Bob] }
```
</details>
