# Conditional Types

## ⚡ Quick Revision
- **Syntax**: `T extends U ? X : Y` - if T is assignable to U, then X, else Y
- **`infer` keyword**: Extract types from conditional types during type checking
- **Type-level programming**: Build complex type transformations using conditions
- **Common use**: Creating utility types, extracting function parameters/return types
- **Pitfall**: Circular references can cause infinite recursion in type system
- **Interview focus**: Demonstrate understanding of distributive conditional types over union types

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false

// Using infer to extract types
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type FuncReturn = ReturnType<() => string>; // string

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>; // string[] | number[]
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Conditional types solve the problem of **type-level branching** - making type decisions based on type relationships. Before conditional types, TypeScript couldn't express "if this type extends that type, then use this other type."

**Key motivations**:
- **Generic constraints with choices**: Need different return types based on input types
- **Type extraction**: Pull out specific types from complex generic structures
- **Library typing**: Express complex API relationships where return types depend on input types
- **Utility type creation**: Build reusable type transformations

```typescript
// Problem: Function that behaves differently based on input type
function process<T>(value: T): /* What type? */ {
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return value * 2;
  return value;
}

// Solution with conditional types
function process<T>(value: T): T extends string ? string : T extends number ? number : T {
  // Implementation
}
```

</details>

<details>
<summary>How it works</summary>
**Type checking process**:
1. TypeScript evaluates `T extends U`
2. If true, resolves to the first branch
3. If false, resolves to the second branch
4. For union types, distributes over each member

**The `infer` keyword**:
- Only usable in the `extends` clause of conditional types
- Creates a type variable that captures the matched type
- Multiple `infer` declarations create multiple type variables

```typescript
// Step-by-step evaluation
type GetFirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

// When called with: GetFirstArg<(x: string, y: number) => void>
// 1. T = (x: string, y: number) => void
// 2. Check if T extends (first: infer F, ...rest: any[]) => any
// 3. Match: F = string (inferred from first parameter)
// 4. Result: string

// Distributive behavior over unions
type Naked<T> = T extends string ? "string" : "other";
type Wrapped<T> = [T] extends [string] ? "string" : "other";

type Test1 = Naked<string | number>; // "string" | "other"
type Test2 = Wrapped<string | number>; // "other" (not distributive)
```

**Advanced patterns**:
```typescript
// Recursive conditional types
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type Deep = Flatten<string[][][]>; // string

// Multiple infer declarations
type Swap<T> = T extends [infer A, infer B] ? [B, A] : never;
type Swapped = Swap<[1, 2]>; // [2, 1]
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Conditional types work like runtime conditionals"**
- They're evaluated at compile-time, not runtime
- No performance impact on JavaScript execution
- Cannot access runtime values, only type information

**❌ "infer can be used anywhere"**
- Only works in the `extends` clause of conditional types
- Cannot be used in regular type annotations or interfaces

**❌ "Distributive behavior is always wanted"**
- Sometimes you need to prevent distribution using tuple wrapping: `[T] extends [U]`
- Naked type parameters (not wrapped) always distribute over unions

**❌ "Circular references are impossible"**
```typescript
// This creates infinite recursion
type Infinite<T> = Infinite<T>;

// Proper recursive types have base cases
type Join<T extends readonly string[]> = T extends readonly [infer F, ...infer R]
  ? F extends string
    ? R extends readonly string[]
      ? R['length'] extends 0
        ? F
        : `${F}.${Join<R>}`
      : never
    : never
  : '';
```

**❌ "All conditional types are distributive"**
```typescript
// Not distributive - uses tuple wrapping
type NonDistributive<T> = [T] extends [string] ? true : false;
type Test = NonDistributive<string | number>; // false (whole union checked)
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Explain distributive behavior clearly
- Show real-world utility type implementations
- Demonstrate recursive conditional types
- Discuss performance implications (compile-time complexity)

**Common interview questions**:
1. "Implement Pick utility type using conditional types"
2. "Create a type that extracts all string keys from an object"
3. "Build a type that flattens nested arrays"
4. "Explain why union types distribute in conditional types"

**Code challenges**:
```typescript
// Challenge: Extract function parameter types
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Challenge: Create DeepReadonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Challenge: Extract nested property type
type Get<T, K extends string> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Get<T[Key], Rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;

type UserName = Get<{ user: { name: string } }, "user.name">; // string
```

**Advanced interview topics**:
- Template literal types with conditional types
- Higher-order type functions
- Type-level recursion limits and tail-call optimization
- Using conditional types for API design

</details>