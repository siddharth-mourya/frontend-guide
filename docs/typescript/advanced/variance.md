# Variance

## ⚡ Quick Revision
- **Covariance**: `T<Child>` is assignable to `T<Parent>` (reads only, arrays)
- **Contravariance**: `T<Parent>` is assignable to `T<Child>` (writes only, function parameters)
- **Bivariance**: Both covariant and contravariant (methods in classes, unsound)
- **Invariance**: Neither covariant nor contravariant (read-write properties)
- **TypeScript default**: Function parameters are contravariant, return types covariant
- **Interview focus**: Explain array variance issues and function parameter safety

```typescript
// Covariance - arrays (unsound but practical)
let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs; // ✅ Allowed (covariant)

// Contravariance - function parameters
type Handler<T> = (arg: T) => void;
let animalHandler: Handler<Animal> = (animal) => {};
let dogHandler: Handler<Dog> = animalHandler; // ✅ Allowed (contravariant)

// Bivariance - method parameters (unsound)
class EventEmitter<T> {
  emit(event: T): void {} // Method parameters are bivariant
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Variance rules determine **type safety in generic relationships**. They answer: "If `A` is assignable to `B`, when is `Container<A>` assignable to `Container<B>`?"

**Core problem**: Generic types need different variance rules based on how they use their type parameters:
- **Read-only containers**: Should be covariant (more specific is OK)
- **Write-only containers**: Should be contravariant (more general is OK)
- **Read-write containers**: Should be invariant (exact match only)

**Real-world scenarios**:
```typescript
// Array variance issue
class Animal { name: string = ""; }
class Dog extends Animal { breed: string = ""; }
class Cat extends Animal { meows: boolean = true; }

let animals: Animal[] = [];
let dogs: Dog[] = [new Dog()];

animals = dogs; // ✅ Covariant assignment allowed
animals.push(new Cat()); // 💥 Runtime error! Cat in Dog array

// Function parameter contravariance
type Validator<T> = (value: T) => boolean;

let animalValidator: Validator<Animal> = (animal) => animal.name.length > 0;
let dogValidator: Validator<Dog> = animalValidator; // ✅ Safe contravariance

// dogValidator expects Dog but gets more general Animal handler
// This is safe because Animal handler can handle any animal, including dogs
```

</details>

<details>
<summary>How it works</summary>
**TypeScript's variance rules**:

1. **Function return types**: Covariant
```typescript
type Getter<T> = () => T;
let animalGetter: Getter<Animal>;
let dogGetter: Getter<Dog>;
animalGetter = dogGetter; // ✅ Dog is more specific than Animal
```

2. **Function parameters**: Contravariant (with `--strictFunctionTypes`)
```typescript
type Setter<T> = (value: T) => void;
let animalSetter: Setter<Animal>;
let dogSetter: Setter<Dog>;
dogSetter = animalSetter; // ✅ Animal setter can handle Dogs
```

3. **Class method parameters**: Bivariant (legacy, unsound)
```typescript
class Container<T> {
  set(value: T): void {} // Bivariant - both directions allowed
}

let animalContainer: Container<Animal>;
let dogContainer: Container<Dog>;
animalContainer = dogContainer; // ✅ Covariant direction
dogContainer = animalContainer; // ✅ Contravariant direction (unsound!)
```

**Variance annotations** (explicit control):
```typescript
interface ReadonlyContainer<out T> {
  get(): T; // T only appears in output positions - covariant
}

interface WriteOnlyContainer<in T> {
  set(value: T): void; // T only appears in input positions - contravariant
}

interface ReadWriteContainer<T> {
  get(): T;
  set(value: T): void; // T in both positions - invariant
}
```

**Structural variance checking**:
```typescript
// TypeScript analyzes usage patterns
type CovariantExample<T> = {
  readonly items: T[]; // Only reads T - covariant
  get(): T; // Returns T - covariant
};

type ContravariantExample<T> = {
  accept(item: T): void; // Accepts T - contravariant
  filter: (predicate: (item: T) => boolean) => void; // Nested contravariance
};
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Arrays should be contravariant because you can write to them"**
- TypeScript makes arrays covariant for practical reasons
- This is technically unsound but rarely causes issues in practice
- Other languages (like Java) have different approaches (array invariance)

**❌ "All function parameters are contravariant"**
- Only with `--strictFunctionTypes` flag enabled
- Method parameters in classes/interfaces are bivariant for compatibility
- Object literal function properties follow function rules (contravariant)

**❌ "Variance is just academic - doesn't matter in real code"**
```typescript
// Real bug from variance issues
interface EventCallback<T> {
  (data: T): void;
}

class EventBus<T> {
  private handlers: EventCallback<T>[] = [];
  
  on(handler: EventCallback<T>) {
    this.handlers.push(handler);
  }
  
  emit(data: T) {
    this.handlers.forEach(h => h(data));
  }
}

let stringBus: EventBus<string>;
let anyBus: EventBus<any>;

// Without proper variance, this could be allowed but unsafe
stringBus = anyBus; // Should this be allowed?
```

**❌ "Higher-kinded types don't have variance"**
```typescript
// Even complex generic types follow variance rules
type Functor<F, A> = {
  map<B>(f: (a: A) => B): Functor<F, B>;
};

// F is covariant, A is covariant in this usage
```

**❌ "You can't control variance in TypeScript"**
- Use `in`/`out` variance annotations
- Structure types to enforce desired variance
- Use conditional types to create variance-aware utilities

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Explain the soundness trade-offs TypeScript makes
- Discuss real-world scenarios where variance matters
- Show how to design APIs with proper variance
- Understand the historical context (`--strictFunctionTypes`)

**Common interview questions**:
1. "Why are arrays covariant in TypeScript despite being mutable?"
2. "Explain the difference between function and method parameter variance"
3. "How would you design a type-safe event system considering variance?"
4. "What problems does bivariance solve and create?"

**Code challenges**:
```typescript
// Challenge 1: Fix this variance issue
interface Producer<T> {
  produce(): T;
}

interface Consumer<T> {
  consume(item: T): void;
}

// Make this type-safe
interface ProducerConsumer<T> extends Producer<T>, Consumer<T> {}

// Challenge 2: Create a covariant-only container
interface ReadOnlyContainer<T> {
  readonly value: T;
  map<U>(fn: (value: T) => U): ReadOnlyContainer<U>;
  // Ensure no contravariant usages
}

// Challenge 3: Event system with proper variance
interface Event<T> {
  readonly type: string;
  readonly data: T;
}

interface EventHandler<T> {
  (event: Event<T>): void;
}

class TypeSafeEventBus<TEvents extends Record<string, any>> {
  on<K extends keyof TEvents>(
    type: K,
    handler: EventHandler<TEvents[K]>
  ): void;
  
  emit<K extends keyof TEvents>(
    type: K,
    data: TEvents[K]
  ): void;
}
```

**Advanced interview topics**:
- Variance in higher-kinded types
- Phantom types and variance
- Variance and type erasure
- How different languages handle variance (Java's wildcards, C#'s in/out)

**Red flags in answers**:
- Not understanding why array covariance is unsound
- Confusing covariance/contravariance definitions
- Not knowing about `--strictFunctionTypes` flag
- Unable to explain practical implications

</details>