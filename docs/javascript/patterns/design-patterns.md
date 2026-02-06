# Design Patterns

## ⚡ Quick Revision

**Singleton:** Ensures single instance of a class
**Observer:** Pub-sub pattern for event-driven architecture
**Factory:** Creates objects without specifying exact class
**Module:** Encapsulates private state and exposes public API
**Strategy:** Encapsulates algorithms, makes them interchangeable
**Decorator:** Adds behavior to objects dynamically

```javascript
// Singleton
class Database {
  static #instance = null;
  
  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
    this.connection = null;
  }
  
  static getInstance() {
    return new Database();
  }
}

// Observer
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
  
  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}

// Factory
class ShapeFactory {
  createShape(type) {
    switch (type) {
      case 'circle': return new Circle();
      case 'square': return new Square();
      default: throw new Error('Unknown shape');
    }
  }
}

// Module (IIFE)
const Calculator = (function() {
  let result = 0;  // Private
  
  return {  // Public API
    add(x) { result += x; return this; },
    subtract(x) { result -= x; return this; },
    getResult() { return result; }
  };
})();

// Strategy
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  processPayment(amount) {
    return this.strategy.process(amount);
  }
}

class CreditCardStrategy {
  process(amount) { /* Credit card logic */ }
}

class PayPalStrategy {
  process(amount) { /* PayPal logic */ }
}

// Decorator
function logger(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

class User {
  @logger
  save() { /* Save logic */ }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Design patterns solve recurring problems in software design. They provide tested, proven development paradigms that improve code maintainability, scalability, and communication between developers.

Each pattern addresses specific issues like state management, object creation, or behavioral decoupling.
</details>

<details>
<summary>How it works</summary>
**Singleton use cases:**
- Database connections
- Configuration objects
- Logger instances
- Caches

**Observer use cases:**
- Event systems (DOM events, Redux)
- Real-time updates
- Model-View decoupling

**Factory use cases:**
- Creating similar objects with different configurations
- Abstracting complex object creation
- Plugin systems

**Module use cases:**
- Data privacy
- Namespacing
- Exposing public APIs

**Strategy use cases:**
- Payment processing
- Sorting algorithms
- Validation rules
- Authentication methods

**Decorator use cases:**
- Adding functionality to classes/methods
- Logging, caching, validation
- React Higher-Order Components (HOCs)

**React-specific patterns:**
```javascript
// Higher-Order Component (Decorator pattern)
function withAuth(Component) {
  return function AuthComponent(props) {
    const user = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />;
  };
}

// Render Props (Strategy pattern)
<DataProvider render={data => <View data={data} />} />

// Custom Hooks (Module pattern)
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}
```
</details>

<details>
<summary>Common misconceptions</summary>
- Patterns aren't always necessary (can add complexity)
- Singleton is considered anti-pattern in many contexts (testing difficulties)
- Not all patterns translate well to functional programming
- Overuse leads to over-engineering
- Patterns should solve problems, not be forced into code
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Implementing specific patterns from scratch
- Identifying patterns in existing code
- Choosing appropriate pattern for given problem
- Understanding trade-offs
- Real-world examples from experience
- React-specific pattern implementations (HOC, Render Props, Hooks)
</details>
