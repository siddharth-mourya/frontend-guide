# Type Operations

## ⚡ Quick Revision
- **Union types (`|`)**: Type can be any of the specified types `string | number`
- **Intersection types (`&`)**: Type must satisfy ALL specified types `A & B`
- **`keyof` operator**: Gets union of all property keys `keyof User = 'id' | 'name'`
- **`typeof` operator**: Gets type from value `typeof obj` (compile-time)
- **Indexed access types**: Get type of property `User['name']`
- **Mapped types**: Transform all properties `{ [K in keyof T]: T[K] }`
- **Template literal types**: String manipulation at type level `` `prefix_${string}` ``
- **Conditional types**: Type-level if statements `T extends U ? X : Y`
- **`infer` keyword**: Extract types in conditional types

```typescript
// Union vs Intersection
type StringOrNumber = string | number; // Either string OR number
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged; // Must have BOTH name AND age

// keyof and indexed access
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // 'id' | 'name' | 'email'
type UserName = User['name']; // string
type UserValues = User[keyof User]; // number | string

// Mapped types
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type StringifyValues<T> = {
  [K in keyof T]: string;
};

// Template literal types
type Prefixed<T extends string> = `prefix_${T}`;
type EventName = Prefixed<'click' | 'hover'>; // 'prefix_click' | 'prefix_hover'

// Conditional types with infer
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ArrayElement<T> = T extends (infer U)[] ? U : never;
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Type operations enable sophisticated type manipulation for:

**API design**: Creating flexible yet type-safe interfaces
```typescript
// Union for flexible input, intersection for combining contracts
type CreateUser = Pick<User, 'name' | 'email'> & { password: string };
type UpdateUser = Partial<Pick<User, 'name' | 'email'>>;
```

**Library authoring**: Generic utilities that transform types
```typescript
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (value: T[K]) => void;
};
// { onChange: (value: string) => void; onAge: (value: number) => void }
```

**Type safety**: Ensuring relationships between different parts of code
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // Return type automatically matches property type
}
```

**Framework integration**: Adapting external types to internal needs
```typescript
type ApiUser = { user_id: string; full_name: string };
type InternalUser = { id: string; name: string };

type Transform<T> = {
  [K in keyof T as K extends 'user_id' ? 'id' :
                    K extends 'full_name' ? 'name' : K]: T[K];
};
```

</details>

<details>
<summary>How it works</summary>
**Union type resolution**:
```typescript
// TypeScript finds common properties/methods
type StringOrNumber = string | number;
function getLength(value: StringOrNumber) {
  // Only methods/properties available on BOTH types are accessible
  return value.toString(); // ✅ Both have toString()
  // return value.length; // ❌ Number doesn't have length
}
```

**Intersection type merging**:
```typescript
type A = { x: number; y: string };
type B = { z: boolean; y: number }; // Conflicting y property
type C = A & B; // { x: number; y: string & number; z: boolean }

// y becomes never because string & number is impossible
const c: C = { x: 1, y: 'impossible' as never, z: true };
```

**keyof with different key types**:
```typescript
interface StringKeys { a: string; b: number; }
interface NumberKeys { 0: string; 1: number; }
interface SymbolKeys { [Symbol.iterator]: () => string; }

type SK = keyof StringKeys; // 'a' | 'b'
type NK = keyof NumberKeys; // 0 | 1  
type SyK = keyof SymbolKeys; // typeof Symbol.iterator
```

**Mapped type transformation mechanics**:
```typescript
// Key remapping with template literals
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }

// Conditional key filtering
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type NumberProperties = PickByType<User, number>; // { age: number }
```

**Template literal type parsing**:
```typescript
// Extract parts from template literals
type ParseRoute<T extends string> = 
  T extends `/${infer First}/${infer Rest}` 
    ? [First, ...ParseRoute<`/${Rest}`>]
    : T extends `/${infer Last}` 
      ? [Last] 
      : [];

type Route = ParseRoute<'/users/123/posts'>; // ['users', '123', 'posts']
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Union types merge properties"**
```typescript
type A = { x: number; shared: string };
type B = { y: number; shared: boolean };
type Union = A | B;

// Union can be EITHER A or B, not merged properties
const union: Union = { x: 1, shared: 'hello' }; // ✅ Valid A
// const invalid: Union = { x: 1, y: 2, shared: 'hello' }; // ❌ Neither A nor B
```

**❌ "Intersection always combines cleanly"**
```typescript
type StringProp = { value: string };
type NumberProp = { value: number };
type Intersection = StringProp & NumberProp;

// value becomes string & number = never
const impossible: Intersection = { 
  value: 'string' as never // Impossible to satisfy both constraints
};
```

**❌ "`keyof` returns string literals"**
```typescript
const obj = { 0: 'zero', name: 'test', [Symbol.for('key')]: 'symbol' };
type Keys = keyof typeof obj; // 0 | 'name' | typeof Symbol.for('key')
// Note: 0 is numeric literal, not string '0'
```

**❌ "Template literal types are just concatenation"**
```typescript
// Template literals can extract and manipulate
type ParseEventName<T extends string> = 
  T extends `on${infer Event}` ? Event : never;

type Event = ParseEventName<'onClick'>; // 'Click'

// They're not just string concatenation
type Routes<T extends readonly string[]> = 
  T[number] extends `/${infer Path}` ? Path : never;
```

**❌ "Conditional types always resolve immediately"**
```typescript
// Conditional types can be deferred when T is generic
type IsArray<T> = T extends any[] ? true : false;

function check<T>(value: T): IsArray<T> {
  // IsArray<T> is not resolved until T is known
  return Array.isArray(value) as IsArray<T>;
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Implement deep readonly type"**
```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object 
    ? T[K] extends Function 
      ? T[K] 
      : DeepReadonly<T[K]>
    : T[K];
};

interface User {
  profile: {
    name: string;
    settings: { theme: string; };
  };
}

type ReadonlyUser = DeepReadonly<User>;
// All nested properties become readonly
```

2. **"Create a type that transforms object keys"**
```typescript
type CamelToSnake<S extends string> = 
  S extends `${infer T}${infer U}` 
    ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
    : S;

type SnakeKeys<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K];
};

type User = { firstName: string; lastName: string; };
type SnakeUser = SnakeKeys<User>; // { first_name: string; last_name: string; }
```

3. **"Implement a type-safe path accessor"**
```typescript
type PathKeys<T, K extends keyof T = keyof T> = 
  K extends string | number 
    ? T[K] extends Record<string, any>
      ? K | `${K}.${PathKeys<T[K]>}`
      : K
    : never;

type GetByPath<T, P extends string> = 
  P extends keyof T 
    ? T[P]
    : P extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? GetByPath<T[K], R>
        : never
      : never;

function getProperty<T, P extends PathKeys<T>>(
  obj: T, 
  path: P
): GetByPath<T, P> {
  return path.split('.').reduce((o, k) => o[k], obj) as GetByPath<T, P>;
}

const user = { profile: { name: 'John', settings: { theme: 'dark' } } };
const name = getProperty(user, 'profile.name'); // Type: string
```

4. **"Create a function overload type generator"**
```typescript
type OverloadFromUnion<T, U = T> = 
  T extends any 
    ? (arg: T) => void 
    : never;

type UnionToOverload<T> = OverloadFromUnion<T>;

// Convert union to function overloads
type Handler = UnionToOverload<string | number | boolean>;
// (arg: string) => void & (arg: number) => void & (arg: boolean) => void

declare const handler: Handler;
handler('string'); // ✅ Matches string overload
handler(42); // ✅ Matches number overload
```

5. **"Implement conditional type for API response"**
```typescript
type ApiConfig = {
  endpoints: {
    users: { response: User[]; params: { page: number } };
    user: { response: User; params: { id: string } };
    posts: { response: Post[]; params: { userId?: string } };
  };
};

type ApiCall<
  T extends keyof ApiConfig['endpoints']
> = ApiConfig['endpoints'][T] extends { 
  response: infer R; 
  params: infer P 
} ? (params: P) => Promise<R> : never;

type GetUsers = ApiCall<'users'>; // (params: { page: number }) => Promise<User[]>
type GetUser = ApiCall<'user'>; // (params: { id: string }) => Promise<User>
```

**Red flags to avoid**:
- Confusing union and intersection types
- Using `any` to bypass complex type operations
- Not understanding template literal type capabilities
- Missing the difference between `typeof` at runtime vs compile-time
- Creating overly complex types when simpler solutions exist
- Not leveraging `keyof` for type-safe property access
</details>