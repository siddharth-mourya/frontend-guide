# this Keyword

## ⚡ Quick Revision

- `this` is dynamically bound at call time (except arrows)
- Four binding rules: default, implicit, explicit, `new`
- Arrow functions inherit `this` from enclosing scope (lexical)
- Global context: `window` (browser) or `global` (Node), `undefined` in strict mode
- Object method: `this` is the object
- Explicit: `call`, `apply`, `bind` set `this` manually
- Constructor: `this` is new object
- Event handlers: `this` is element (without arrow functions)

```javascript
// Implicit binding
const obj = {
  name: 'Alice',
  greet() { console.log(this.name); }
};
obj.greet();  // 'Alice'

// Lost context
const greet = obj.greet;
greet();  // undefined (or error in strict)

// Arrow function (lexical this)
const obj2 = {
  name: 'Bob',
  greet: () => console.log(this.name)
};
obj2.greet();  // undefined (this from outer scope)

// Explicit binding
greet.call(obj);  // 'Alice'

// Constructor
function Person(name) {
  this.name = name;
}
const p = new Person('Charlie');  // this = new object
```

**Binding precedence:**
1. `new` binding (highest)
2. Explicit binding (`call`, `apply`, `bind`)
3. Implicit binding (object method)
4. Default binding (global or undefined)

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
`this` enables object-oriented programming and method reuse. The same function can operate on different objects depending on how it's called, enabling polymorphism without classes.

Arrow functions solve common callback problems where `this` gets lost, providing lexical scoping like other variables.
</details>

<details>
<summary>How it works</summary>
**Binding rules:**

1. **Default binding:**
```javascript
function show() { console.log(this); }
show();  // window (sloppy) / undefined (strict)
```

2. **Implicit binding:**
```javascript
const obj = { fn: show };
obj.fn();  // obj (left of dot)
```

3. **Explicit binding:**
```javascript
show.call({x: 1});     // {x: 1}
show.apply({x: 2});    // {x: 2}
const bound = show.bind({x: 3});
bound();               // {x: 3}
```

4. **new binding:**
```javascript
function Construct() { this.x = 1; }
const instance = new Construct();  // this = {}
```

**Arrow functions:**
- No own `this` binding
- Capture `this` from enclosing function at creation time
- Cannot be used as constructors
- Cannot change `this` with `call`/`apply`/`bind`

```javascript
function Timer() {
  this.seconds = 0;
  
  // Regular function: 'this' would be global/undefined
  setInterval(function() {
    this.seconds++;  // Wrong this!
  }, 1000);
  
  // Arrow function: 'this' is Timer instance
  setInterval(() => {
    this.seconds++;  // Correct this!
  }, 1000);
}
```

**Class methods:**
```javascript
class Component {
  constructor() {
    this.name = 'React';
  }
  
  // Method loses this when passed as callback
  handleClick() {
    console.log(this.name);
  }
  
  // Arrow property preserves this
  handleClick = () => {
    console.log(this.name);
  }
}
```
</details>

<details>
<summary>Common misconceptions</summary>
- `this` is not where function is defined (except arrows)
- Arrow functions don't "bind" `this` (they don't have their own)
- `this` in arrow function can't be changed (permanently lexical)
- Class methods are not auto-bound (need arrow properties or bind)
- `this` in nested functions refers to different contexts
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Predicting `this` in various contexts
- Fixing lost `this` in callbacks
- Arrow vs regular function behavior
- When to use `bind` in React components
- Explaining binding precedence
- Impact of strict mode on `this`
</details>
