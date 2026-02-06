# Prototypes and Prototype Chain

## ⚡ Quick Revision

- Every object has internal `[[Prototype]]` link (accessed via `__proto__` or `Object.getPrototypeOf()`)
- Functions have `prototype` property (template for instances)
- Prototype chain: series of prototype links, ends at `Object.prototype` (then `null`)
- Property lookup: object → prototype → prototype's prototype → ... → `null`
- Constructor's `prototype` becomes instance's `[[Prototype]]`
- `Object.create(proto)`: creates object with specified prototype
- Classes are syntactic sugar over prototypes

```javascript
// Constructor function
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person('Alice');
alice.greet();  // Looks up prototype chain

// Prototype chain
alice.__proto__ === Person.prototype  // true
Person.prototype.__proto__ === Object.prototype  // true
Object.prototype.__proto__ === null  // true

// Object.create
const parent = { x: 1 };
const child = Object.create(parent);
child.y = 2;
child.x;  // 1 (found in prototype)
```

**Property shadowing:**
```javascript
const obj = Object.create({ x: 1 });
obj.x = 2;  // Creates own property (shadows prototype)
delete obj.x;  // Removes own property
obj.x;  // 1 (from prototype again)
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Prototypes enable object-oriented programming and inheritance in JavaScript without classes (though ES6 added class syntax). They provide memory-efficient method sharing across instances.

Prototype-based inheritance is more flexible than class-based inheritance, allowing runtime modification of behavior.
</details>

<details>
<summary>How it works</summary>
**Object creation with `new`:**
```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes sound`;
};

const dog = new Animal('Rex');

// What new does:
// 1. Create empty object: {}
// 2. Set [[Prototype]]: {}.__proto__ = Animal.prototype
// 3. Execute constructor: Animal.call({}, 'Rex')
// 4. Return object (or constructor return value if object)
```

**Prototype chain lookup:**
```javascript
dog.speak();
// 1. Check dog own properties: not found
// 2. Check dog.[[Prototype]] (Animal.prototype): found!
// 3. Execute with 'this' = dog

dog.toString();
// 1. Check dog: not found
// 2. Check Animal.prototype: not found
// 3. Check Object.prototype: found!
```

**Inheritance:**
```javascript
function Dog(name, breed) {
  Animal.call(this, name);  // Call parent constructor
  this.breed = breed;
}
// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  return 'Woof!';
};

const rex = new Dog('Rex', 'Labrador');
rex.speak();  // From Animal.prototype
rex.bark();   // From Dog.prototype
```

**ES6 Class equivalent:**
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  bark() {
    return 'Woof!';
  }
}
// Under the hood: same prototype chain
```
</details>

<details>
<summary>Common misconceptions</summary>
- Modifying `prototype` doesn't affect existing instances' `[[Prototype]]`
- `__proto__` is not standard (use `Object.getPrototypeOf()`)
- `prototype` property only exists on functions
- `[[Prototype]]` (internal) vs `prototype` (property) are different
- Class syntax doesn't change prototype system (just cleaner syntax)
- Prototype lookup is runtime cost (small, optimized by engines)
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Implementing inheritance without class syntax
- Understanding prototype chain traversal
- Difference between `__proto__` and `prototype`
- How `new` operator works
- Creating objects without constructor
- Performance implications of deep prototype chains
- Modifying built-in prototypes (why it's bad)
</details>
