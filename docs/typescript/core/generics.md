# Generics

## ⚡ Quick Revision
- **Purpose**: Write reusable code that works with multiple types while maintaining type safety
- **Syntax**: `<T>` where T is a type parameter, conventionally `T`, `U`, `V`, `K`, `R`
- **Generic functions**: `function identity<T>(arg: T): T`
- **Generic interfaces**: `interface Container<T> { value: T }`
- **Generic classes**: `class Box<T> { content: T }`
- **Constraints**: `<T extends SomeType>` limits what T can be
- **Default types**: `<T = string>` provides fallback when not specified
- **Multiple type parameters**: `<T, U, V>` for complex scenarios

```typescript
// Basic generic function
function identity<T>(arg: T): T {
  return arg;
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Generic class with constraint
class Repository<T extends { id: string }> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  findById(id: string): T | undefined {
    return this.items.find(item => item.id === id);
  }
}

// Advanced: conditional types with generics
type ApiResult<T> = T extends string ? { message: T } : { data: T };
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Generics solve the fundamental tension between reusability and type safety:

**Without generics**:
```typescript
// Either lose type safety
function identityAny(arg: any): any { return arg; }

// Or write duplicate code for each type
function identityString(arg: string): string { return arg; }
function identityNumber(arg: number): number { return arg; }
```

**With generics**:
```typescript
function identity<T>(arg: T): T { return arg; }
// One function, type-safe for all types
```

Generics enable:
- **Code reuse** without sacrificing type safety
- **Library development** with flexible, type-safe APIs
- **Data structures** that work with any type
- **Utility types** for type manipulation

</details>

<details>
<summary>How it works</summary>
**Type parameter inference**:
```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// TypeScript infers types
const result = pair("hello", 42); // [string, number]
const explicit = pair<string, number>("hello", 42); // Explicit
```

**Constraint mechanics**:
```typescript
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // OK, T has length property
  return arg;
}

// logLength(3); // Error: number doesn't have length
logLength("hello"); // OK: string has length
logLength([1, 2, 3]); // OK: array has length
```

**Generic constraint with keyof**:
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// getProperty(person, "invalid"); // Error
```

**Conditional types**:
```typescript
type Flatten<T> = T extends Array<infer U> ? U : T;
type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Generics are runtime constructs"**
- Generics are compile-time only, erased at runtime
- They provide no runtime type checking

**❌ "T can be any name"**
- While true, conventions matter: `T` (Type), `U` (second type), `K` (Key), `V` (Value), `R` (Return)

**❌ "Generic constraints are optional"**
```typescript
// Bad: no constraints, limited functionality
function process<T>(items: T[]): void {
  // items.forEach(item => item.process()); // Error: no process method
}

// Good: with constraints
interface Processable {
  process(): void;
}

function process<T extends Processable>(items: T[]): void {
  items.forEach(item => item.process()); // OK
}
```

**❌ "Generic functions must use all type parameters"**
```typescript
// This is valid - T is inferred from return type context
function createEmpty<T>(): T[] {
  return [];
}

const strings: string[] = createEmpty(); // T inferred as string
```

**❌ "You need to specify all generics explicitly"**
```typescript
// TypeScript is smart about inference
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// Type inference works perfectly
const numbers = [1, 2, 3];
const strings = map(numbers, n => n.toString()); // U inferred as string
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Implement a generic Cache class"**
```typescript
class Cache<K, V> {
  private store = new Map<K, V>();
  
  set(key: K, value: V): void {
    this.store.set(key, value);
  }
  
  get(key: K): V | undefined {
    return this.store.get(key);
  }
  
  has(key: K): boolean {
    return this.store.has(key);
  }
  
  clear(): void {
    this.store.clear();
  }
}

const stringCache = new Cache<string, User>();
const numCache = new Cache<number, string>();
```

2. **"How would you type a pick function?"**
```typescript
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

const user = { id: 1, name: "John", email: "john@ex.com" };
const userSummary = pick(user, ["id", "name"]); // { id: number, name: string }
```

3. **"Explain generic constraints vs conditional types"**
```typescript
// Constraint: limits what can be passed in
function sortBy<T extends { priority: number }>(items: T[]): T[] {
  return items.sort((a, b) => a.priority - b.priority);
}

// Conditional: transforms types based on conditions
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type Result = Unwrap<Promise<string>>; // string
```

4. **"Implement a type-safe event emitter"**
```typescript
class EventEmitter<T extends Record<string, any[]>> {
  private listeners: { [K in keyof T]?: Array<(...args: T[K]) => void> } = {};
  
  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }
  
  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.listeners[event]?.forEach(listener => listener(...args));
  }
}

// Usage
type Events = {
  user:login: [User];
  message:sent: [string, Date];
};

const emitter = new EventEmitter<Events>();
emitter.on('user:login', (user) => { /* user is typed as User */ });
```

**Red flags to avoid**:
- Using `any` instead of proper generic constraints
- Over-constraining generics unnecessarily
- Not understanding type inference
- Ignoring the relationship between generic parameters
</details>