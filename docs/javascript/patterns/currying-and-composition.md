# Currying and Composition

## ⚡ Quick Revision

- **Currying:** Transform function with multiple arguments into sequence of single-argument functions
- **Partial Application:** Pre-fill some arguments, return function expecting remaining args
- **Composition:** Combine multiple functions into single function, data flows right to left
- Enable functional programming, code reusability, and point-free style

**Key concepts:**
- Currying: `f(a, b, c)` → `f(a)(b)(c)`
- Partial: `f(a, b, c)` → `g(b, c)` where `a` is fixed
- Composition: `compose(f, g, h)(x)` → `f(g(h(x)))`
- Pipe: left-to-right composition

```javascript
// Currying
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
};

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6

// Partial application
const partial = (fn, ...fixedArgs) => {
  return (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);
};

const multiply = (a, b, c) => a * b * c;
const multiplyBy2 = partial(multiply, 2);
multiplyBy2(3, 4); // 24

// Function composition
const compose = (...fns) => (x) => 
  fns.reduceRight((acc, fn) => fn(acc), x);

const pipe = (...fns) => (x) => 
  fns.reduce((acc, fn) => fn(acc), x);

// Usage
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const calculate = compose(square, double, addOne);
calculate(3); // ((3 + 1) * 2)² = 64

const calculate2 = pipe(addOne, double, square);
calculate2(3); // ((3 + 1) * 2)² = 64
```

**Practical examples:**

```javascript
// Currying for reusable utilities
const map = curry((fn, arr) => arr.map(fn));
const filter = curry((fn, arr) => arr.filter(fn));

const double = x => x * 2;
const isEven = x => x % 2 === 0;

const doubleAll = map(double);
const filterEven = filter(isEven);

doubleAll([1, 2, 3]); // [2, 4, 6]
filterEven([1, 2, 3, 4]); // [2, 4]

// Composition for data pipelines
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

const getActive = users => users.filter(u => u.active);
const getNames = users => users.map(u => u.name);
const uppercase = names => names.map(n => n.toUpperCase());

const getActiveUserNames = pipe(getActive, getNames, uppercase);
getActiveUserNames(users); // ['ALICE', 'CHARLIE']
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Currying and composition are foundational functional programming patterns that enable:

1. **Code reusability**: Create specialized functions from general ones
2. **Declarative style**: Compose complex operations from simple building blocks
3. **Point-free programming**: Write functions without explicitly mentioning arguments
4. **Testability**: Small, pure functions are easier to test
5. **Modularity**: Break complex logic into composable pieces

These patterns originated from lambda calculus and are central to functional languages (Haskell, Elm). In JavaScript, they enable more elegant data transformations and reduce code duplication.
</details>

<details>
<summary>How it works</summary>
**Currying mechanism:**
```javascript
// Manual currying
function add(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
add(1)(2)(3); // 6

// Generic curry implementation
function curry(fn) {
  return function curried(...args) {
    // If enough args, call original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return function that collects more args
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// fn.length gives parameter count
const add = (a, b, c) => a + b + c;
console.log(add.length); // 3
```

**Partial application vs Currying:**
```javascript
// Currying: Always returns single-arg functions
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // Must call with one arg at a time

// Partial: Can fix any number of args
const partial = (fn, ...fixedArgs) => {
  return (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);
};
const add5 = partial(add, 5);
add5(10, 15); // 30 - accepts multiple remaining args
```

**Composition execution flow:**
```javascript
// Right-to-left (compose)
const compose = (...fns) => x => 
  fns.reduceRight((acc, fn) => fn(acc), x);

const f = x => x + 1;
const g = x => x * 2;
const h = x => x - 3;

compose(f, g, h)(10);
// Step by step:
// 1. h(10) = 7
// 2. g(7) = 14
// 3. f(14) = 15

// Left-to-right (pipe)
const pipe = (...fns) => x => 
  fns.reduce((acc, fn) => fn(acc), x);

pipe(h, g, f)(10);
// Step by step:
// 1. h(10) = 7
// 2. g(7) = 14
// 3. f(14) = 15
```

**Type signatures (helpful for understanding):**
```
curry: (fn: (...args) => b) => curried
      where curried accepts args incrementally

partial: (fn: (...args) => b, ...fixed) => (...remaining) => b

compose: (f, g, h) => (x) => f(g(h(x)))
pipe:    (f, g, h) => (x) => h(g(f(x)))
```
</details>

<details>
<summary>Common patterns and gotchas</summary>
**1. Point-free style:**
```javascript
// With arguments (pointed)
const getNames = users => users.map(u => u.name);

// Point-free (no arguments mentioned)
const getName = u => u.name;
const getNames = map(getName);

// More readable for complex operations
const processUsers = pipe(
  filter(u => u.active),
  map(u => u.name),
  map(name => name.toUpperCase()),
  join(', ')
);
```

**2. Currying for configuration:**
```javascript
// Create specialized functions
const fetch = curry((method, url, data) => {
  return axios({ method, url, data });
});

const get = fetch('GET');
const post = fetch('POST');

// Reusable API calls
const getUser = get('/api/users');
const createUser = post('/api/users');

getUser({ id: 123 });
createUser({ name: 'Alice' });
```

**3. Composition with async functions:**
```javascript
// Async compose
const composeAsync = (...fns) => x => 
  fns.reduceRight(
    (acc, fn) => acc.then(fn),
    Promise.resolve(x)
  );

const fetchUser = id => fetch(`/api/users/${id}`).then(r => r.json());
const getOrders = user => fetch(`/api/orders?userId=${user.id}`).then(r => r.json());
const calculateTotal = orders => orders.reduce((sum, o) => sum + o.total, 0);

const getUserTotal = composeAsync(calculateTotal, getOrders, fetchUser);
await getUserTotal(123);
```

**4. Debugging compositions:**
```javascript
// Add trace helper
const trace = label => value => {
  console.log(`${label}:`, value);
  return value;
};

const result = pipe(
  trace('input'),
  addOne,
  trace('after addOne'),
  double,
  trace('after double'),
  square,
  trace('final')
)(3);
```

**5. Gotchas:**

**Context loss:**
```javascript
// Bad: loses 'this' context
const obj = {
  value: 10,
  add: function(x) { return this.value + x; }
};
const curriedAdd = curry(obj.add);
curriedAdd(5); // Error: this.value is undefined

// Fix: bind context
const curriedAdd = curry(obj.add.bind(obj));
```

**Arity mismatch:**
```javascript
// Functions with variable args don't curry well
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
curry(sum); // Doesn't work - sum.length is 0

// Fix: Define explicit arity
const sum = (a, b, c) => a + b + c;
curry(sum)(1)(2)(3); // Works
```

**Order matters in composition:**
```javascript
// Incorrect order
const processData = compose(
  filter(x => x > 0),
  map(x => x * 2)
);
// Applies filter first (wrong)

// Correct order
const processData = compose(
  map(x => x * 2),
  filter(x => x > 0)
);
// Applies filter then map
```
</details>

<details>
<summary>Interview talking points</summary>
**When asked about currying/composition:**

1. **Currying definition**: "Currying transforms a function that takes multiple arguments into a sequence of functions each taking a single argument. It's named after Haskell Curry."

2. **Benefits**:
   - Create specialized functions from general ones
   - Enable partial application naturally
   - Support point-free programming style
   - Improve code reusability and composition

3. **Composition definition**: "Function composition combines multiple functions into a single function, where output of one becomes input to the next. Data flows right-to-left in compose, left-to-right in pipe."

4. **Practical uses**:
   - Data transformation pipelines
   - Event handler configuration
   - Middleware patterns
   - Redux reducers and selectors
   - API call factories

5. **Trade-offs**:
   - **Pro**: More reusable, testable code
   - **Pro**: Clearer data flow in complex operations
   - **Con**: Can reduce readability for unfamiliar developers
   - **Con**: Debugging stack traces can be harder
   - **Con**: Performance overhead (negligible in most cases)

6. **Common pitfalls**:
   - Losing `this` context
   - Functions with rest parameters don't curry automatically
   - Incorrect composition order
   - Over-engineering simple operations

**Example answer**: "I use currying to create specialized functions from general ones. For example, in a data fetching utility, I'll curry a generic `fetch` function by HTTP method to create `get`, `post`, etc. For composition, I use it in data pipelines - like filtering, mapping, and transforming user data before rendering. Pipe makes the flow intuitive: `pipe(filter, map, sort)` reads left-to-right. The key benefit is testability - each small function can be tested in isolation, and composing them creates complex behavior without complex code."
</details>

<details>
<summary>Real-world examples</summary>
**1. Redux selector composition:**
```javascript
import { createSelector } from 'reselect';

const getUsers = state => state.users;
const getActiveFilter = state => state.filters.active;

// Compose selectors
const getActiveUsers = createSelector(
  [getUsers, getActiveFilter],
  (users, showActive) => showActive 
    ? users.filter(u => u.active)
    : users
);

const getUserNames = createSelector(
  getActiveUsers,
  users => users.map(u => u.name)
);
```

**2. Express middleware pattern:**
```javascript
// Curried middleware factory
const authenticate = role => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

// Create specialized middleware
const requireAdmin = authenticate('admin');
const requireUser = authenticate('user');

app.get('/admin', requireAdmin, (req, res) => {
  res.send('Admin panel');
});
```

**3. Lodash/fp style:**
```javascript
import { curry, flow } from 'lodash/fp';

const users = [
  { name: 'Alice', age: 25, dept: 'Engineering' },
  { name: 'Bob', age: 30, dept: 'Sales' },
  { name: 'Charlie', age: 35, dept: 'Engineering' }
];

const getDeptNames = flow(
  filter({ dept: 'Engineering' }),
  map('name'),
  map(name => name.toUpperCase())
);

getDeptNames(users); // ['ALICE', 'CHARLIE']
```

**4. Validation pipeline:**
```javascript
const isRequired = value => 
  value !== undefined && value !== null;

const minLength = min => value => 
  value.length >= min;

const maxLength = max => value => 
  value.length <= max;

const isEmail = value => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Compose validators
const validate = curry((validators, value) => 
  validators.every(validator => validator(value))
);

const isValidEmail = validate([
  isRequired,
  minLength(5),
  maxLength(100),
  isEmail
]);

isValidEmail('user@example.com'); // true
```

**5. React higher-order components:**
```javascript
const withAuth = Component => props => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Component {...props} /> : <Login />;
};

const withLoading = Component => props => {
  const { isLoading } = props;
  return isLoading ? <Spinner /> : <Component {...props} />;
};

// Compose HOCs
const enhance = compose(
  withAuth,
  withLoading,
  withErrorBoundary
);

const EnhancedComponent = enhance(MyComponent);
```

**6. Data transformation pipeline:**
```javascript
const normalizeData = pipe(
  // Parse dates
  map(item => ({
    ...item,
    createdAt: new Date(item.createdAt)
  })),
  // Filter old items
  filter(item => {
    const daysSince = (Date.now() - item.createdAt) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  }),
  // Sort by date
  sortBy(item => -item.createdAt),
  // Group by category
  groupBy('category')
);

const processedData = normalizeData(rawData);
```

**7. API client factory:**
```javascript
const createApiClient = curry((baseURL, headers, endpoint, options) => {
  return fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  }).then(r => r.json());
});

// Create specialized clients
const apiClient = createApiClient('https://api.example.com');
const authenticatedClient = apiClient({ Authorization: `Bearer ${token}` });
const getUsers = authenticatedClient('/users');
const getPosts = authenticatedClient('/posts');

// Use
await getUsers({ method: 'GET' });
await getPosts({ method: 'GET', query: { page: 1 } });
```
</details>
