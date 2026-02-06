# Unknown, Any, and Never

## ⚡ Quick Revision
- **`any`**: Disables type checking, escape hatch, should be avoided
- **`unknown`**: Type-safe alternative to `any`, requires type checking before use
- **`never`**: Represents values that never occur (unreachable code, exhaustive checks)
- **Type safety hierarchy**: `never` ⊆ `unknown` ⊆ `any`
- **Use `unknown` for**: API responses, user input, JSON parsing
- **Use `never` for**: Exhaustive switch cases, functions that always throw
- **Migration strategy**: Replace `any` with `unknown` + type guards

```typescript
// any - disables type checking
let value: any = 42;
value.foo.bar.baz; // No error, runtime crash

// unknown - type-safe top type
let userInput: unknown = JSON.parse('{"name": "John"}');
// userInput.name; // Error: Object is of type 'unknown'
if (typeof userInput === 'object' && userInput !== null) {
  console.log((userInput as any).name); // Requires type assertion or guard
}

// never - represents impossible values
function throwError(message: string): never {
  throw new Error(message);
}

// Exhaustive checking
type Status = 'loading' | 'success' | 'error';
function handleStatus(status: Status) {
  switch (status) {
    case 'loading': return 'Loading...';
    case 'success': return 'Done';
    case 'error': return 'Error';
    default:
      const _exhaustive: never = status; // Ensures all cases handled
  }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
These types solve different problems in TypeScript's type system:

**`any` exists for**:
- Migration from JavaScript
- Interacting with dynamic content where types are truly unknowable
- Temporary escape hatch during development

**`unknown` exists for**:
- Type-safe handling of dynamic content
- API boundaries where data shape is uncertain
- Better alternative to `any` that forces type checking

**`never` exists for**:
- Representing impossible states
- Exhaustiveness checking in discriminated unions
- Functions that never return normally
- Bottom type in type theory (assignable to everything, nothing assignable to it)

</details>

<details>
<summary>How it works</summary>
**Type hierarchy**:
```typescript
// never is assignable to everything
let str: string = (() => { throw new Error(); })(); // ✅

// nothing is assignable to never (except never)
let nev: never = "string"; // ❌ Error

// unknown accepts everything
let unk: unknown = 42; // ✅
let unk2: unknown = "string"; // ✅

// but requires type checking to use
console.log(unk.length); // ❌ Error
```

**Control flow analysis with `never`**:
```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toLowerCase(); // value is string
  } else if (typeof value === 'number') {
    return value.toFixed(2); // value is number  
  } else {
    // value is never here - all cases handled
    const _exhaustive: never = value;
  }
}
```

**`unknown` type guards**:
```typescript
function isUser(obj: unknown): obj is { name: string; age: number } {
  return typeof obj === 'object' && 
         obj !== null &&
         'name' in obj && 
         'age' in obj &&
         typeof (obj as any).name === 'string' &&
         typeof (obj as any).age === 'number';
}

function processUser(input: unknown) {
  if (isUser(input)) {
    console.log(input.name); // ✅ TypeScript knows it's a user
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "`any` is fine for prototyping"**
- `any` spreads through your codebase like a virus
- Use `unknown` or `object` instead for truly dynamic content

**❌ "`never` is useless"**
```typescript
// never is crucial for exhaustiveness
type Shape = Circle | Square | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    // Forgot triangle case
    default:
      const _exhaustive: never = shape; // Error if new shape added
  }
}
```

**❌ "unknown and any are interchangeable"**
```typescript
let data: any = fetchData();
data.someMethod(); // No type checking - dangerous

let data2: unknown = fetchData();
// data2.someMethod(); // Error - forces type checking
```

**❌ "never functions should return undefined"**
```typescript
// Wrong
function fail(): never {
  throw new Error();
  return undefined; // Unreachable code error
}

// Right  
function fail(): never {
  throw new Error();
  // No return statement needed
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"When would you use `unknown` vs `any`?"**
   - `unknown` when you need type safety but don't know the type
   - `any` only when migrating JS code or truly dynamic scenarios
   - Show how `unknown` forces type guards

2. **"Explain exhaustiveness checking with `never`"**
```typescript
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(action: Action) {
  switch (action.type) {
    case 'increment': return { count: 1 };
    case 'decrement': return { count: -1 };
    default:
      const _exhaustive: never = action; // Ensures all cases handled
  }
}
```

3. **"How does `never` help with type inference?"**
```typescript
// Conditional types with never
type NonNullable<T> = T extends null | undefined ? never : T;
type Result = NonNullable<string | null>; // string
```

4. **"Show me proper unknown type guarding"**
```typescript
function processApiResponse(response: unknown) {
  // Proper validation chain
  if (typeof response === 'object' && 
      response !== null && 
      'data' in response) {
    return (response as { data: any }).data;
  }
  throw new Error('Invalid response format');
}
```

**Red flags to avoid**:
- Using `any` without justification
- Not understanding that `never` is the bottom type
- Forgetting that `unknown` requires type guards
- Missing exhaustiveness checks in switch statements
</details>