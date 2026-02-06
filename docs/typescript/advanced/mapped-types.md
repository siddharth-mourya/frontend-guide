# Mapped Types

## ⚡ Quick Revision
- **Syntax**: `{ [K in keyof T]: TransformType<T[K]> }` - iterate over keys and transform types
- **Key remapping**: `{ [K in keyof T as NewKey<K>]: T[K] }` - transform property names
- **Template literals**: `` `prefix_${string}_suffix` `` - pattern matching and generation
- **Recursive types**: Self-referencing mapped types for deep transformations
- **Modifiers**: `readonly`, `?` can be added (`+`) or removed (`-`)
- **Interview focus**: Demonstrate complex utility type implementations and recursive patterns

```typescript
// Basic mapped type
type Optional<T> = { [K in keyof T]?: T[K] };

// Key remapping with template literals
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

// Recursive mapped type
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Template literal type matching
type ExtractRouteParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Mapped types solve the problem of **systematic type transformations**. Before mapped types, you'd need to manually create similar types for every object structure.

**Key motivations**:
- **DRY principle**: Avoid repeating similar type definitions
- **Type derivation**: Generate related types from base types automatically  
- **Library typing**: Express complex transformations like form validation, API serialization
- **Generic utilities**: Create reusable type-level functions

**Problems they solve**:
```typescript
// Before mapped types - repetitive and error-prone
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserOptional {
  id?: number;
  name?: string;
  email?: string;
}

interface UserReadonly {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

// With mapped types - systematic and reusable
type Optional<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };

type UserOptional = Optional<User>;
type UserReadonly = Readonly<User>;
```

</details>

<details>
<summary>How it works</summary>
**Core mechanism**:
1. `keyof T` extracts all property keys as a union type
2. `K in Union` iterates over each member of the union
3. `T[K]` accesses the property type for key K
4. Template processing happens during iteration

**Key remapping syntax**:
```typescript
// Basic form
type Mapped<T> = { [K in keyof T]: T[K] };

// With key remapping
type Remapped<T> = { [K in keyof T as NewKeyType<K>]: T[K] };

// With filtering (using never to exclude keys)
type RemoveId<T> = { [K in keyof T as K extends 'id' ? never : K]: T[K] };
```

**Template literal types in action**:
```typescript
// Extract parameters from route strings
type Route = '/user/:id/posts/:postId';

type ExtractParams<T extends string> = 
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type RouteParams = ExtractParams<Route>; // { id: string; postId: string }

// Generate event handler names
type EventMap = {
  click: MouseEvent;
  focus: FocusEvent;
  change: ChangeEvent;
};

type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (event: T[K]) => void;
};

type Handlers = EventHandlers<EventMap>;
// { onClick: (event: MouseEvent) => void; onFocus: (event: FocusEvent) => void; ... }
```

**Recursive patterns**:
```typescript
// Deep readonly implementation
type DeepReadonly<T> = T extends primitive
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Flatten nested object paths
type FlattenPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? FlattenPaths<T[K], `${Prefix}${string & K}.`>
    : `${Prefix}${string & K}`;
}[keyof T];

type UserPaths = FlattenPaths<{
  profile: { name: string; age: number };
  settings: { theme: string };
}>; // "profile.name" | "profile.age" | "settings.theme"
```

**Advanced patterns**:
```typescript
// Conditional mapped types
type NonNullableProps<T> = {
  [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

// Higher-order mapped types
type Transform<T, U> = { [K in keyof T]: U };
type StringifyAll<T> = Transform<T, string>;

// Mapped types with multiple transformations
type ApiResponse<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => Promise<T[K]>;
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => Promise<void>;
};
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Mapped types only work with object types"**
```typescript
// Works with any type that has keys
type StringifyUnion<T extends string> = {
  [K in T]: `processed_${K}`;
}[T];

type Result = StringifyUnion<'a' | 'b' | 'c'>; // "processed_a" | "processed_b" | "processed_c"
```

**❌ "You can't filter properties in mapped types"**
```typescript
// Use 'never' to filter out unwanted properties
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
```

**❌ "Template literal types are just string concatenation"**
```typescript
// They include pattern matching and inference
type ParseCSSLength<T extends string> = T extends `${infer Num}${infer Unit}`
  ? Unit extends 'px' | 'em' | 'rem' | '%'
    ? { value: Num; unit: Unit }
    : never
  : never;

type Length = ParseCSSLength<'16px'>; // { value: "16"; unit: "px" }
```

**❌ "Recursive types cause infinite loops"**
```typescript
// TypeScript has built-in recursion limits and depth tracking
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// This works fine up to TypeScript's recursion limit
type NestedConfig = DeepPartial<{
  database: {
    connection: {
      host: string;
      port: number;
      credentials: {
        username: string;
        password: string;
      };
    };
  };
}>;
```

**❌ "Key remapping is just renaming"**
```typescript
// It's transformation - can create/remove/modify keys based on logic
type ApiEndpoints<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any 
    ? `POST /api/${string & K}` 
    : `GET /api/${string & K}`
  ]: T[K];
};
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Build complex utility types from scratch
- Understand performance implications of recursive types
- Show real-world applications (form validation, API typing)
- Explain template literal type parsing techniques

**Common interview questions**:
1. "Implement Omit using mapped types"
2. "Create a type that converts object keys to getter/setter methods"
3. "Build a type that validates form field types against validation rules"
4. "Extract route parameters from a URL template string"

**Code challenges**:
```typescript
// Challenge 1: Deep Pick implementation
type DeepPick<T, K extends string> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? { [P in Key]: DeepPick<T[Key], Rest> }
    : never
  : K extends keyof T
  ? Pick<T, K>
  : never;

// Challenge 2: Form validation schema
type ValidationSchema<T> = {
  [K in keyof T]: {
    required?: boolean;
    validator?: (value: T[K]) => boolean;
    transform?: (value: string) => T[K];
  };
};

// Challenge 3: SQL-like select for types
type Select<T, K extends keyof T> = Pick<T, K>;
type Where<T, Condition> = {
  [K in keyof T as T[K] extends Condition ? K : never]: T[K];
};

// Challenge 4: Function pipeline types
type Pipe<T, Fns extends readonly any[]> = Fns extends readonly [
  (...args: any[]) => infer U,
  ...infer Rest
]
  ? Rest extends readonly any[]
    ? Pipe<U, Rest>
    : U
  : T;

// Challenge 5: Object path intellisense
type Paths<T> = T extends primitive
  ? never
  : T extends any[]
  ? never
  : {
      [K in keyof T]: K extends string
        ? T[K] extends primitive
          ? K
          : K | `${K}.${Paths<T[K]>}`
        : never;
    }[keyof T];
```

**Advanced interview topics**:
- Mapped types with distributive conditional types
- Performance considerations for complex mapped types
- Mapped types in library design (React Hook Form, Zod)
- Template literal type parsing for DSLs

**Red flags in answers**:
- Not understanding the `[keyof T]` indexing pattern for extracting union types
- Confusion about when to use `as` keyword in key remapping
- Not knowing how to filter properties with `never`
- Unable to explain template literal type inference

</details>