# Type Guards

## ⚡ Quick Revision
- **`typeof` guard**: Checks primitive types `typeof x === 'string'`
- **`instanceof` guard**: Checks class instances `x instanceof Date`
- **`in` operator guard**: Checks property existence `'property' in object`
- **Custom type guards**: Functions returning `is` predicates `x is Type`
- **Assertion functions**: Functions that assert types `asserts x is Type`
- **Truthiness guards**: Narrow nullable types with truthiness checks
- **Array type guards**: `Array.isArray()` for array type checking
- **Discriminated union guards**: Use discriminator properties to narrow
- **Multiple guards**: Chain guards with `&&` for complex narrowing

```typescript
// typeof guard
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toLowerCase(); // TypeScript knows value is string
  }
  return value.toFixed(2); // TypeScript knows value is number
}

// instanceof guard
function handleError(error: Error | string) {
  if (error instanceof Error) {
    return error.message; // error is Error
  }
  return error; // error is string
}

// Custom type guard
interface User { name: string; email: string; }
function isUser(obj: any): obj is User {
  return obj && typeof obj.name === 'string' && typeof obj.email === 'string';
}

// in operator guard
type Cat = { meow(): void; name: string };
type Dog = { bark(): void; name: string };

function makeSound(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow(); // animal is Cat
  } else {
    animal.bark(); // animal is Dog
  }
}

// Assertion function
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Expected number');
  }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Type guards solve the fundamental problem of runtime type checking in a statically typed system:

**Runtime safety**: JavaScript is dynamically typed, so values can be anything at runtime
```typescript
// Without guards: unsafe
function unsafe(data: any) {
  return data.name.toLowerCase(); // Runtime error if data.name doesn't exist
}

// With guards: safe
function safe(data: unknown) {
  if (isUser(data)) {
    return data.name.toLowerCase(); // TypeScript guarantees data.name exists
  }
  throw new Error('Invalid user data');
}
```

**API boundaries**: External data needs validation
```typescript
// API responses, user input, parsed JSON all need type guards
const apiResponse = await fetch('/api/user').then(r => r.json());
if (isUser(apiResponse)) {
  // Safe to use as User
  processUser(apiResponse);
}
```

**Polymorphic handling**: Working with union types safely
```typescript
// Handle different shapes of data based on runtime properties
function handleShape(shape: Circle | Rectangle | Triangle) {
  if ('radius' in shape) {
    // shape is Circle
    return Math.PI * shape.radius ** 2;
  }
  // Continue narrowing...
}
```

</details>

<details>
<summary>How it works</summary>
**Control flow analysis**:
```typescript
function example(value: string | number | null) {
  // value: string | number | null
  
  if (typeof value === 'string') {
    // value: string (typeof guard narrows)
    console.log(value.length);
    return;
  }
  
  // value: number | null (string eliminated)
  
  if (value !== null) {
    // value: number (truthiness guard eliminates null)
    console.log(value.toFixed(2));
    return;
  }
  
  // value: null (all other types eliminated)
}
```

**Type predicate mechanics**:
```typescript
// The 'is' keyword tells TypeScript about the type relationship
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// TypeScript transforms this to:
// if (isString(x)) { /* x is string */ } else { /* x is not string */ }

function processUnknown(value: unknown) {
  if (isString(value)) {
    // TypeScript narrows value to string
    console.log(value.toLowerCase());
  } else {
    // TypeScript knows value is not string
    console.log('Not a string:', value);
  }
}
```

**Assertion function behavior**:
```typescript
function assertIsArray<T>(value: unknown): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array');
  }
  // If function doesn't throw, TypeScript knows value is T[]
}

function processItems(input: unknown) {
  assertIsArray<string>(input);
  // After this line, TypeScript knows input is string[]
  return input.map(item => item.toLowerCase());
}
```

**Complex guard combinations**:
```typescript
interface ApiSuccess { status: 'success'; data: any }
interface ApiError { status: 'error'; message: string }
type ApiResponse = ApiSuccess | ApiError;

function isApiSuccess(response: ApiResponse): response is ApiSuccess {
  return response.status === 'success';
}

function isApiError(response: ApiResponse): response is ApiError {
  return response.status === 'error';
}

// TypeScript tracks both positive and negative cases
function handleResponse(response: ApiResponse) {
  if (isApiSuccess(response)) {
    console.log('Data:', response.data);
  } else {
    // TypeScript knows it must be ApiError
    console.log('Error:', response.message);
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Type guards work with any condition"**
```typescript
// This doesn't work as a type guard
function badGuard(x: string | number): x is string {
  const isString = typeof x === 'string';
  return isString; // TypeScript can't track variable assignments
}

// Must be direct condition
function goodGuard(x: string | number): x is string {
  return typeof x === 'string';
}
```

**❌ "instanceof works with interfaces"**
```typescript
interface User { name: string }

function checkUser(obj: any): obj is User {
  return obj instanceof User; // Error: interfaces don't exist at runtime
}

// Must check properties directly
function checkUser(obj: any): obj is User {
  return obj && typeof obj.name === 'string';
}
```

**❌ "Assertion functions return boolean"**
```typescript
// Wrong: assertion functions don't return values
function assertString(x: unknown): boolean { // Wrong return type
  if (typeof x !== 'string') throw new Error('Not string');
  return true; // Unnecessary
}

// Correct: assertion functions return void
function assertString(x: unknown): asserts x is string {
  if (typeof x !== 'string') throw new Error('Not string');
  // No return needed
}
```

**❌ "Array.isArray() doesn't narrow element types"**
```typescript
function processArray(value: unknown) {
  if (Array.isArray(value)) {
    // value is any[], not string[] or number[]
    return value.map(item => item.toLowerCase()); // Error: item is any
  }
}

// Need additional guards for element types
function processStringArray(value: unknown): string[] | null {
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value; // Now TypeScript knows it's string[]
  }
  return null;
}
```

**❌ "Type guards eliminate the need for discriminated unions"**
```typescript
// Don't avoid discriminated unions - they're more reliable
type Shape = 
  | { type: 'circle'; radius: number }
  | { type: 'rectangle'; width: number; height: number };

// Good: use discriminator
function getArea(shape: Shape) {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
  }
}

// Avoid: manual property checking when discriminator exists
function getAreaBad(shape: Shape) {
  if ('radius' in shape) {
    // Less clear intent, more error-prone
    return Math.PI * shape.radius ** 2;
  } else {
    return shape.width * shape.height;
  }
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Implement a robust object validator"**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

function isUser(obj: unknown): obj is User {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const candidate = obj as Record<string, unknown>;
  
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    candidate.email.includes('@') &&
    (candidate.age === undefined || typeof candidate.age === 'number')
  );
}

// Usage with API data
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (isUser(data)) {
    return data;
  }
  
  throw new Error('Invalid user data from API');
}
```

2. **"Create guards for nested objects"**
```typescript
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface UserWithAddress {
  name: string;
  address: Address;
}

function isAddress(obj: unknown): obj is Address {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).street === 'string' &&
    typeof (obj as any).city === 'string' &&
    typeof (obj as any).zipCode === 'string'
  );
}

function isUserWithAddress(obj: unknown): obj is UserWithAddress {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).name === 'string' &&
    isAddress((obj as any).address)
  );
}
```

3. **"Implement array type guards with element validation"**
```typescript
function isArrayOf<T>(
  guard: (item: unknown) => item is T
): (value: unknown) => value is T[] {
  return (value): value is T[] => {
    return Array.isArray(value) && value.every(guard);
  };
}

// Usage
const isStringArray = isArrayOf((item): item is string => typeof item === 'string');
const isUserArray = isArrayOf(isUser);

function processUserList(data: unknown) {
  if (isUserArray(data)) {
    // data is User[]
    return data.map(user => user.name);
  }
  throw new Error('Expected user array');
}
```

4. **"Create discriminated union guards"**
```typescript
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: string };
type ErrorState = { status: 'error'; error: string };
type AsyncState = LoadingState | SuccessState | ErrorState;

function isLoadingState(state: AsyncState): state is LoadingState {
  return state.status === 'loading';
}

function isSuccessState(state: AsyncState): state is SuccessState {
  return state.status === 'success';
}

function isErrorState(state: AsyncState): state is ErrorState {
  return state.status === 'error';
}

function handleAsyncState(state: AsyncState): string {
  if (isLoadingState(state)) {
    return 'Loading...';
  } else if (isSuccessState(state)) {
    return `Success: ${state.data}`;
  } else if (isErrorState(state)) {
    return `Error: ${state.error}`;
  }
  
  // Exhaustiveness check
  const _exhaustive: never = state;
  throw new Error('Unhandled state');
}
```

5. **"Implement assertion-based validation"**
```typescript
function assertIsPositiveNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number' || value <= 0 || !isFinite(value)) {
    throw new Error('Expected positive finite number');
  }
}

function assertHasProperty<T extends string>(
  obj: unknown, 
  prop: T
): asserts obj is Record<T, unknown> {
  if (typeof obj !== 'object' || obj === null || !(prop in obj)) {
    throw new Error(`Expected object with property ${prop}`);
  }
}

function processConfig(config: unknown) {
  assertHasProperty(config, 'timeout');
  assertIsPositiveNumber(config.timeout);
  
  // TypeScript knows config has timeout property and it's a positive number
  setTimeout(doWork, config.timeout);
}
```

**Red flags to avoid**:
- Using `any` instead of proper type guards
- Forgetting that `instanceof` doesn't work with interfaces
- Not handling edge cases (null, undefined, non-objects)
- Using complex logic in type predicates instead of simple checks
- Mixing up type guards and assertion functions
- Not considering performance for frequently-called guards
</details>