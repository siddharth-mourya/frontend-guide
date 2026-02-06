# Advanced Utility Types

## ⚡ Quick Revision
- **`ReturnType<T>`**: Extracts return type from function type
- **`InstanceType<T>`**: Gets instance type from constructor function type
- **`Parameters<T>`**: Extracts parameter tuple from function type
- **`NonNullable<T>`**: Removes null and undefined from type union
- **`Awaited<T>`**: Recursively unwraps Promise types (TS 4.5+)
- **Implementation uses conditional types with `infer` keyword**
- **Interview focus**: Show understanding of utility type internals and real-world applications

```typescript
// Core utility type examples
type FuncReturn = ReturnType<() => string>; // string
type ClassInstance = InstanceType<typeof Array>; // any[]
type FuncParams = Parameters<(a: number, b: string) => void>; // [number, string]
type NotNull = NonNullable<string | null | undefined>; // string
type UnwrappedPromise = Awaited<Promise<Promise<string>>>; // string

// Real-world usage
function createHandler<T extends (...args: any[]) => any>(fn: T): {
  params: Parameters<T>;
  returnType: ReturnType<T>;
  instance?: InstanceType<T>;
} { /* implementation */ }
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
These utility types solve **type extraction and transformation problems** that commonly arise in advanced TypeScript applications. They're building blocks for creating type-safe abstractions.

**Core problems they solve**:

`ReturnType<T>` - Function return type extraction:
```typescript
// Problem: Need to type a cache based on function return types
const cache = new Map<string, /* What type? */>(); 

function getUserData(): Promise<{ id: number; name: string }> { /* ... */ }
function getSettings(): { theme: string; lang: string } { /* ... */ }

// Solution: Extract return types automatically
type UserDataType = ReturnType<typeof getUserData>; // Promise<{id: number; name: string}>
type SettingsType = ReturnType<typeof getSettings>; // {theme: string; lang: string}
```

**InstanceType&lt;T&gt;** - Constructor instance typing:
```typescript
// Problem: Generic factory functions need to know instance type
class ApiClient<T> {
  constructor(public config: T) {}
  request(): Promise<any> { return Promise.resolve(); }
}

// Solution: Extract instance type from constructor
function createClient<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args);
}
```

**Parameters&lt;T&gt;** - Function signature analysis:
```typescript
// Problem: Type-safe function decorators and wrappers
function withLogging<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log('Calling with:', args);
    return fn(...args);
  };
}
```

</details>

<details>
<summary>How it works</summary>
**Internal implementations** (how TypeScript defines these):

```typescript
// ReturnType - Uses conditional types with infer
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// InstanceType - Extracts instance from constructor
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

// Parameters - Extracts parameter tuple
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// NonNullable - Conditional type that excludes null/undefined
type NonNullable<T> = T extends null | undefined ? never : T;

// Awaited - Recursive Promise unwrapping (TS 4.5+)
type Awaited<T> = T extends null | undefined
  ? T // Special case for null/undefined
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
  ? F extends ((value: infer V, ...args: infer _) => any)
    ? Awaited<V> // Recursively unwrap
    : never
  : T; // Non-thenable types remain unchanged
```

**Advanced usage patterns**:
```typescript
// Chaining utility types
type AsyncFunctionParams<T> = T extends (...args: any[]) => Promise<any>
  ? Parameters<T>
  : never;

// Function signature transformation
type PromisifyFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R>
  : never;

// Complex extraction patterns
type ExtractAsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
  ? R
  : never;

// Working with method types
type MethodParameters<T, K extends keyof T> = T[K] extends (...args: infer P) => any ? P : never;
type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any) => infer R ? R : never;
```

**Real-world applications**:
```typescript
// API client with type extraction
class TypedApiClient {
  async request<T extends (...args: any[]) => any>(
    endpoint: T,
    ...params: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    // Implementation that ensures type safety
    return endpoint(...params);
  }
}

// Event system with extracted types
type EventMap = {
  userLogin: (user: User) => void;
  dataUpdate: (data: any[]) => void;
  error: (error: Error) => void;
};

class EventEmitter<T extends Record<string, (...args: any[]) => any>> {
  on<K extends keyof T>(
    event: K,
    listener: T[K]
  ): void { /* ... */ }

  emit<K extends keyof T>(
    event: K,
    ...args: Parameters<T[K]>
  ): void { /* ... */ }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "These types only work with specific function shapes"**
```typescript
// They work with any compatible signature
type Method = { someMethod(x: number): string };
type MethodReturn = ReturnType<Method['someMethod']>; // string

// Works with overloaded functions (picks last overload)
function overloaded(x: number): number;
function overloaded(x: string): string;
function overloaded(x: any): any { return x; }

type OverloadedReturn = ReturnType<typeof overloaded>; // any (from last overload)
```

**❌ "InstanceType only works with classes"**
```typescript
// Works with any constructor signature
interface Constructable {
  new(name: string): { name: string };
}

type Instance = InstanceType<Constructable>; // { name: string }

// Works with built-in constructors
type ArrayInstance = InstanceType<typeof Array>; // any[]
type DateInstance = InstanceType<typeof Date>; // Date
```

**❌ "Awaited is the same as Promise`<T>` extraction"**
```typescript
// Awaited is recursive and handles non-Promise types
type Test1 = Awaited<Promise<Promise<string>>>; // string (recursive unwrapping)
type Test2 = Awaited<string>; // string (non-Promise passthrough)
type Test3 = Awaited<Promise<string> | number>; // string | number

// It also handles thenable objects
interface Thenable<T> {
  then(onFulfilled: (value: T) => any): any;
}
type ThenableResult = Awaited<Thenable<number>>; // number
```

**❌ "NonNullable removes all falsy values"**
```typescript
// Only removes null and undefined, not other falsy values
type WithFalsy = string | null | undefined | 0 | false | "";
type Cleaned = NonNullable<WithFalsy>; // string | 0 | false | "" (null and undefined removed)

// For removing all falsy values, you need custom type
type Truthy<T> = T extends null | undefined | false | 0 | "" ? never : T;
```

**❌ "These utilities don't compose well"**
```typescript
// They compose perfectly for complex type operations
type AsyncMethodReturnType<T, K extends keyof T> = 
  T[K] extends (...args: any[]) => any
    ? Awaited<ReturnType<T[K]>>
    : never;

interface ApiMethods {
  getUser(): Promise<User>;
  getSettings(): Promise<Settings>;
  login(credentials: Credentials): Promise<AuthResult>;
}

type UserType = AsyncMethodReturnType<ApiMethods, 'getUser'>; // User
type LoginParams = Parameters<ApiMethods['login']>; // [Credentials]
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Implement custom utility types from scratch
- Understand the internal conditional type patterns
- Show real-world usage in complex type systems
- Demonstrate composition of multiple utility types

**Common interview questions**:
1. "Implement your own version of ReturnType"
2. "Create a utility type that extracts all async method return types from an interface"
3. "Build a type-safe event emitter using these utility types"
4. "How would you type a function decorator that preserves original signatures?"

**Code challenges**:
```typescript
// Challenge 1: Custom utility type implementations
type MyReturnType<T> = /* Your implementation */;
type MyParameters<T> = /* Your implementation */;
type MyAwaited<T> = /* Your implementation */;

// Challenge 2: Function composition typing
type Compose<F1, F2> = F1 extends (...args: any[]) => any
  ? F2 extends (arg: ReturnType<F1>) => any
    ? (...args: Parameters<F1>) => ReturnType<F2>
    : never
  : never;

// Challenge 3: Method extraction and transformation
type AsyncifyMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (...args: P) => Promise<R>
    : T[K];
};

// Challenge 4: Type-safe API client
interface ApiEndpoints {
  '/users': (id: string) => Promise<User>;
  '/posts': (authorId: string, limit?: number) => Promise<Post[]>;
  '/auth': (credentials: Credentials) => Promise<AuthToken>;
}

type ApiClient<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: (
    endpoint: K,
    ...params: Parameters<T[K]>
  ) => Awaited<ReturnType<T[K]>>;
}[keyof T];

// Challenge 5: Constructor parameter extraction
type ConstructorParams<T> = T extends abstract new (...args: infer P) => any ? P : never;
type StaticMethods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
}[keyof T];
```

**Advanced interview topics**:
- Custom utility types for specific domains (React props, database schemas)
- Performance implications of complex utility type chains
- Utility types with template literal types
- Building type-safe libraries using utility types

**Red flags in answers**:
- Not understanding conditional types with `infer`
- Confusion about when these types resolve (compile-time vs runtime)
- Inability to compose utility types for complex scenarios
- Not knowing the difference between `Awaited` and simple Promise extraction

**Bonus advanced patterns**:
```typescript
// Recursive utility type composition
type DeepReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends (...args: any[]) => any
    ? DeepReturnType<R>
    : R
  : never;

// Utility types with mapped types
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type ExtractFunctions<T> = Pick<T, FunctionPropertyNames<T>>;
type FunctionSignatures<T> = {
  [K in keyof ExtractFunctions<T>]: Parameters<T[K]>;
};
```

</details>