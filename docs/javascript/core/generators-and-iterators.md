# Generators and Iterators

## ⚡ Quick Revision

- **Iterator**: Object with `next()` method that returns `{value, done}`
- **Iterable**: Object with `Symbol.iterator` method that returns iterator
- **Generator**: Function that can pause/resume execution with `yield`
- **Generator syntax**: `function*` creates generator function
- **yield**: Pauses generator and returns value
- **Iteration protocols**: Define standard interface for iteration

### Key Points

- Generators are both iterators and iterables
- `yield` pauses execution, `next()` resumes it
- Generators maintain state between calls
- Useful for lazy evaluation, infinite sequences, async operations
- for...of loops work with any iterable
- Can pass values into generators via `next(value)`

### Basic Iterator

```javascript
// Manual iterator
const iterator = {
  current: 0,
  last: 3,
  
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { done: true };
  }
};

console.log(iterator.next()); // { value: 0, done: false }
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { done: true }
```

### Basic Generator

```javascript
// Generator function
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Using with for...of
for (const num of numberGenerator()) {
  console.log(num); // 1, 2, 3
}
```

### Making Objects Iterable

```javascript
// Custom iterable object
const range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      
      next() {
        if (this.current <= this.last) {
          return { value: this.current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Spread operator works with iterables
console.log([...range]); // [1, 2, 3, 4, 5]
```

### Generator with Parameters

```javascript
// Passing values to generator
function* dialogue() {
  const name = yield 'What is your name?';
  const age = yield `Hello ${name}! What is your age?`;
  return `${name} is ${age} years old`;
}

const conv = dialogue();

console.log(conv.next().value); // 'What is your name?'
console.log(conv.next('Alice').value); // 'Hello Alice! What is your age?'
console.log(conv.next(25).value); // 'Alice is 25 years old'
```

### Common Pitfalls

```javascript
// Pitfall 1: Forgetting * in function declaration
function notAGenerator() { // Missing *
  yield 1; // SyntaxError
}

function* isAGenerator() { // Correct
  yield 1;
}

// Pitfall 2: Generator is not reusable
function* gen() {
  yield 1;
  yield 2;
}

const g = gen();
console.log([...g]); // [1, 2]
console.log([...g]); // [] - exhausted!

// Need to create new generator
const g2 = gen();
console.log([...g2]); // [1, 2]

// Pitfall 3: return in generator
function* genWithReturn() {
  yield 1;
  return 2; // Not included in for...of
  yield 3; // Never reached
}

console.log([...genWithReturn()]); // [1] - return value ignored!
const g = genWithReturn();
console.log(g.next()); // { value: 1, done: false }
console.log(g.next()); // { value: 2, done: true } - return value here

// Pitfall 4: Arrow functions can't be generators
const notAllowed = *() => { // SyntaxError
  yield 1;
};
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Problems Generators Solve

**1. Lazy Evaluation**
```javascript
// Without generator - all computed upfront
function allNumbers(max) {
  const result = [];
  for (let i = 0; i < max; i++) {
    result.push(i); // Memory grows with max
  }
  return result;
}

// With generator - computed on demand
function* lazyNumbers(max) {
  for (let i = 0; i < max; i++) {
    yield i; // No memory buildup
  }
}

// Only generates what you need
const gen = lazyNumbers(1000000);
console.log(gen.next().value); // 0 - only this computed
```

**2. Infinite Sequences**
```javascript
// Impossible without generators
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Can work with infinite sequence safely
const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
```

**3. State Machines**
```javascript
function* trafficLight() {
  while (true) {
    yield 'red';
    yield 'yellow';
    yield 'green';
  }
}

const light = trafficLight();
console.log(light.next().value); // 'red'
console.log(light.next().value); // 'yellow'
console.log(light.next().value); // 'green'
console.log(light.next().value); // 'red' - cycles
```

**4. Async Control Flow (before async/await)**
```javascript
// Co library pattern (pre-async/await)
function* fetchUser() {
  const user = yield fetch('/api/user');
  const posts = yield fetch(`/api/posts/${user.id}`);
  return posts;
}

// Library would handle the yields
// This pattern inspired async/await syntax!
```

### Historical Context

**ES6 (2015)**: Generators introduced
- Inspired by Python generators
- Needed for async control flow
- Foundation for async/await (ES2017)

**Why Iterators?**
- Standard protocol for iteration
- Enable for...of loops
- Work with spread operator, destructuring
- Consistent interface across data structures
</details>

<details>
<summary>How it works</summary>
### Generator Execution Model

```javascript
function* example() {
  console.log('Start');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
  return 3;
}

const gen = example();

// Nothing executed yet!
console.log('Generator created');

// First next() - runs until first yield
console.log(gen.next()); // Logs: "Start", returns { value: 1, done: false }

// Second next() - runs until second yield
console.log(gen.next()); // Logs: "After first yield", returns { value: 2, done: false }

// Third next() - runs until return
console.log(gen.next()); // Logs: "After second yield", returns { value: 3, done: true }
```

### Iterator Protocol

```javascript
// Iterator protocol requires:
// - next() method
// - returns { value, done } object

const myIterator = {
  data: [1, 2, 3],
  index: 0,
  
  next() {
    if (this.index < this.data.length) {
      return {
        value: this.data[this.index++],
        done: false
      };
    }
    return { done: true };
  }
};

// Manual iteration
let result = myIterator.next();
while (!result.done) {
  console.log(result.value);
  result = myIterator.next();
}
```

### Iterable Protocol

```javascript
// Iterable protocol requires:
// - [Symbol.iterator]() method
// - returns an iterator

const myIterable = {
  data: [1, 2, 3],
  
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

// for...of works with iterables
for (const value of myIterable) {
  console.log(value); // 1, 2, 3
}

// Spread works with iterables
console.log([...myIterable]); // [1, 2, 3]
```

### Generator as Iterator and Iterable

```javascript
function* generator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generator();

// Generator IS an iterator (has next method)
console.log(typeof gen.next); // 'function'
console.log(gen.next()); // { value: 1, done: false }

// Generator IS iterable (has Symbol.iterator)
console.log(typeof gen[Symbol.iterator]); // 'function'
console.log(gen[Symbol.iterator]() === gen); // true - returns itself!

// Can use with for...of
for (const value of generator()) {
  console.log(value); // 1, 2, 3
}
```

### yield* Delegation

```javascript
// yield* delegates to another iterable
function* inner() {
  yield 2;
  yield 3;
}

function* outer() {
  yield 1;
  yield* inner(); // Delegates to inner generator
  yield 4;
}

console.log([...outer()]); // [1, 2, 3, 4]

// Works with any iterable
function* gen() {
  yield* [1, 2, 3]; // Delegates to array
  yield* 'hi'; // Delegates to string
}

console.log([...gen()]); // [1, 2, 3, 'h', 'i']
```

### Bidirectional Communication

```javascript
function* conversation() {
  const name = yield 'What is your name?';
  console.log(`Got name: ${name}`);
  
  const color = yield 'What is your favorite color?';
  console.log(`Got color: ${color}`);
  
  return `${name} likes ${color}`;
}

const conv = conversation();

// First next() starts generator
console.log(conv.next().value); // 'What is your name?'

// Subsequent next(value) passes value to yield expression
console.log(conv.next('Alice').value); // Logs: "Got name: Alice"
                                       // Returns: 'What is your favorite color?'

console.log(conv.next('blue').value); // Logs: "Got color: blue"
                                      // Returns: 'Alice likes blue'
```

### Generator Methods

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (error) {
    console.log('Caught:', error.message);
  }
}

const g = gen();

// .next() - resume execution
console.log(g.next()); // { value: 1, done: false }

// .return(value) - terminate generator
const g2 = gen();
g2.next(); // { value: 1, done: false }
console.log(g2.return('early exit')); // { value: 'early exit', done: true }
console.log(g2.next()); // { value: undefined, done: true }

// .throw(error) - throw error inside generator
const g3 = gen();
g3.next(); // { value: 1, done: false }
g3.throw(new Error('Oops')); // Logs: "Caught: Oops"
console.log(g3.next()); // { value: 3, done: false }
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Generators run immediately"

**Reality**: Generator function returns a generator object, doesn't execute until `next()` is called

```javascript
function* gen() {
  console.log('This runs when next() is called');
  yield 1;
}

const g = gen(); // No output yet!
console.log('Generator created');
g.next(); // NOW it logs "This runs when next() is called"
```

### Misconception 2: "yield is like return"

**Reality**: yield pauses, return terminates

```javascript
function* withReturn() {
  yield 1;
  return 2; // Terminates generator
  yield 3; // Never reached
}

const gen = withReturn();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: true } - return value
console.log(gen.next()); // { value: undefined, done: true }

// for...of ignores return value
for (const val of withReturn()) {
  console.log(val); // Only logs 1
}
```

### Misconception 3: "Generators are only for iteration"

**Reality**: Also used for state machines, async flow, cooperative multitasking

```javascript
// State machine example
function* taskRunner() {
  while (true) {
    const task = yield; // Wait for task
    if (!task) break;
    
    console.log(`Processing: ${task}`);
    // Do work...
  }
}

const runner = taskRunner();
runner.next(); // Start generator
runner.next('Task 1'); // Logs: "Processing: Task 1"
runner.next('Task 2'); // Logs: "Processing: Task 2"
runner.next(); // Stops
```

### Misconception 4: "Iterators and iterables are the same"

**Reality**: Iterator has `next()`, iterable has `[Symbol.iterator]()`

```javascript
// Iterator (has next)
const iterator = {
  next() {
    return { value: 1, done: true };
  }
};

// Not iterable!
for (const val of iterator) {} // TypeError

// Iterable (has Symbol.iterator)
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return { value: 1, done: true };
      }
    };
  }
};

// Works!
for (const val of iterable) {
  console.log(val);
}
```

### Misconception 5: "Can use generators everywhere"

**Reality**: Arrow functions can't be generators, can't use yield in callbacks

```javascript
// Can't make arrow generator
const gen = *() => { // SyntaxError
  yield 1;
};

// yield only works directly in generator function
function* outer() {
  [1, 2, 3].forEach(x => {
    yield x; // SyntaxError: yield in non-generator
  });
}

// Fix: use for loop
function* outer() {
  for (const x of [1, 2, 3]) {
    yield x; // Works!
  }
}
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What's the difference between iterator and iterable?"**

```javascript
// Iterator: object with next() method
const iterator = {
  current: 0,
  next() {
    return { 
      value: this.current++, 
      done: this.current > 3 
    };
  }
};

// Iterable: object with [Symbol.iterator] method
const iterable = {
  [Symbol.iterator]() {
    return {
      current: 0,
      next() {
        return { 
          value: this.current++, 
          done: this.current > 3 
        };
      }
    };
  }
};

// Iterator is used, iterable can create iterators
// for...of needs iterable, not iterator
for (const val of iterable) { // Works
  console.log(val);
}

for (const val of iterator) { // TypeError
  console.log(val);
}
```

**Q2: "How do generators work? Explain yield."**

```javascript
function* demo() {
  console.log('Start');
  const x = yield 1; // Pauses here
  console.log('Received:', x);
  yield 2;
  return 3;
}

// Explain execution:
const gen = demo();

// 1. Create generator (doesn't run yet)
console.log('Created');

// 2. First next() runs until first yield
console.log(gen.next()); // Logs: "Start", returns { value: 1, done: false }

// 3. Second next(value) resumes, passes value to yield
console.log(gen.next('hello')); // Logs: "Received: hello", returns { value: 2, done: false }

// 4. Third next() runs to completion
console.log(gen.next()); // Returns { value: 3, done: true }
```

**Q3: "Implement a range function using generator"**

```javascript
// Without generator
function range(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

// With generator - lazy, memory efficient
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

// Usage
for (const num of range(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Advanced: infinite range
function* infiniteRange(start = 0) {
  let current = start;
  while (true) {
    yield current++;
  }
}

// Take first 5
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) return;
    yield value;
  }
}

for (const num of take(5, infiniteRange(10))) {
  console.log(num); // 10, 11, 12, 13, 14
}
```

**Q4: "Make this object iterable"**

```javascript
// Given object
const myObject = {
  data: [1, 2, 3, 4, 5]
};

// Make iterable using Symbol.iterator
myObject[Symbol.iterator] = function*() {
  for (const item of this.data) {
    yield item;
  }
};

// Or with regular function
myObject[Symbol.iterator] = function() {
  let index = 0;
  const data = this.data;
  
  return {
    next() {
      if (index < data.length) {
        return { value: data[index++], done: false };
      }
      return { done: true };
    }
  };
};

// Now works with for...of
for (const item of myObject) {
  console.log(item); // 1, 2, 3, 4, 5
}

// And spread
console.log([...myObject]); // [1, 2, 3, 4, 5]
```

**Q5: "Implement a fibonacci generator"**

```javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Usage - take first 10
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) return;
    yield value;
  }
}

console.log([...take(10, fibonacci())]);
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Or with limit parameter
function* fibonacci(limit) {
  let [a, b] = [0, 1];
  let count = 0;
  
  while (count++ < limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

console.log([...fibonacci(10)]);
```

### Advanced Interview Questions

**Q6: "Implement async iterator"**

```javascript
// Async iterator protocol
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
    yield await Promise.resolve(3);
  }
};

// Use with for await...of
(async () => {
  for await (const value of asyncIterable) {
    console.log(value); // 1, 2, 3
  }
})();

// Practical example: paginated API
async function* fetchPages(url) {
  let page = 1;
  
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    
    if (data.items.length === 0) break;
    
    yield data.items;
    page++;
  }
}

// Usage
for await (const items of fetchPages('/api/items')) {
  console.log('Page items:', items);
}
```

**Q7: "Implement generator composition"**

```javascript
function* flatten(array) {
  for (const item of array) {
    if (Array.isArray(item)) {
      yield* flatten(item); // Recursive delegation
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, [4]], 5]];
console.log([...flatten(nested)]); // [1, 2, 3, 4, 5]
```

### Pro Tips for Interviews

1. **Explain lazy evaluation**: Generators compute on demand
2. **Mention memory efficiency**: Especially with large sequences
3. **Show bidirectional communication**: next(value) passing values in
4. **Know async iterators**: for await...of
5. **Practical examples**: Infinite sequences, pagination, tree traversal
6. **Connect to async/await**: Generators inspired the syntax
</details>
