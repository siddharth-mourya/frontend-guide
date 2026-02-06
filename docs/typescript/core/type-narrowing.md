# Type Narrowing

## ⚡ Quick Revision
- **Type narrowing**: Process of refining union types to more specific types
- **Control flow analysis**: TypeScript tracks type changes through code paths
- **Type guards**: Functions that perform runtime checks and inform TypeScript about types
- **Discriminated unions**: Union types with a common discriminator property
- **Type predicates**: User-defined type guards with `is` keyword
- **Assertion functions**: Functions that throw if condition fails, narrow types
- **`in` operator**: Checks if property exists in object
- **`instanceof`**: Checks if object is instance of class
- **`typeof`**: Runtime type checking for primitives

```typescript
// Basic type narrowing
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toLowerCase(); // TypeScript knows value is string
  }
  return value.toFixed(2); // TypeScript knows value is number
}

// Discriminated union
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // shape is circle
    case 'square':
      return shape.size ** 2; // shape is square
    case 'rectangle':
      return shape.width * shape.height; // shape is rectangle
  }
}

// Type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
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
Type narrowing solves the challenge of working with union types safely:

**Without narrowing**:
```typescript
function process(input: string | number) {
  return input.toLowerCase(); // Error: number doesn't have toLowerCase
}
```

**With narrowing**:
```typescript
function process(input: string | number) {
  if (typeof input === 'string') {
    return input.toLowerCase(); // Safe: TypeScript knows it's string
  }
  return input.toString().toLowerCase();
}
```

**Real-world scenarios**:
- **API responses**: Different shapes based on success/error
- **Event handling**: Different event types with different properties  
- **State management**: Different states with different data
- **Form validation**: Validated vs unvalidated data

</details>

<details>
<summary>How it works</summary>
**Control flow analysis**:
```typescript
function example(x: string | number | boolean) {
  // x is string | number | boolean
  
  if (typeof x === 'string') {
    // x is string
    console.log(x.length);
  } else if (typeof x === 'number') {
    // x is number  
    console.log(x.toFixed(2));
  } else {
    // x is boolean (TypeScript eliminates other possibilities)
    console.log(x ? 'true' : 'false');
  }
}
```

**Discriminated union mechanics**:
```typescript
interface LoadingState { status: 'loading' }
interface SuccessState { status: 'success'; data: string }  
interface ErrorState { status: 'error'; error: string }

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState) {
  // TypeScript uses 'status' to discriminate
  switch (state.status) {
    case 'loading':
      // state is LoadingState, no data/error properties
      return 'Loading...';
    case 'success':
      // state is SuccessState, has data property
      return `Success: ${state.data}`;
    case 'error':
      // state is ErrorState, has error property
      return `Error: ${state.error}`;
  }
}
```

**Custom type predicate implementation**:
```typescript
// Runtime check + compile-time type information
function isUser(obj: unknown): obj is { name: string; email: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'email' in obj &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).email === 'string'
  );
}

function processUser(input: unknown) {
  if (isUser(input)) {
    // TypeScript now knows input has name and email properties
    console.log(`User: ${input.name} (${input.email})`);
  }
}
```

**Assertion functions**:
```typescript
function assertIsArray<T>(value: unknown): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array');
  }
}

function processItems(input: unknown) {
  assertIsArray<string>(input);
  // After assertion, TypeScript knows input is string[]
  return input.map(item => item.toLowerCase());
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Type guards are just runtime checks"**
- Type guards provide both runtime safety AND compile-time type information
- The `is` keyword is crucial for TypeScript's understanding

**❌ "All properties need to be discriminators"**
```typescript
// Only need ONE discriminator property
type Animal = 
  | { species: 'cat'; meow(): void; name: string }
  | { species: 'dog'; bark(): void; name: string }; // name is common, species discriminates
```

**❌ "Narrowing works with any condition"**
```typescript
function wrong(x: string | number) {
  const isString = typeof x === 'string';
  if (isString) {
    // x is still string | number here!
    // TypeScript doesn't track variable assignments
    return x.toLowerCase(); // Error
  }
}

function correct(x: string | number) {
  if (typeof x === 'string') {
    // Direct condition works
    return x.toLowerCase(); // OK
  }
}
```

**❌ "Assertion functions replace type guards"**
```typescript
// Assertion functions throw, type guards return boolean
function isString(x: unknown): x is string {
  return typeof x === 'string'; // Returns boolean, safe to use
}

function assertString(x: unknown): asserts x is string {
  if (typeof x !== 'string') throw new Error('Not string'); // Throws on failure
}

// Use type guards for optional checks, assertions for required conditions
```

**❌ "`in` operator works with all types"**
```typescript
// `in` only works with object types
function check(x: string | { length: number }) {
  if ('length' in x) { // Error: string is not an object type
    return x.length;
  }
}

// Correct approach
function check(x: string | { length: number }) {
  if (typeof x === 'object' && 'length' in x) {
    return x.length;
  }
  return x.length; // string also has length
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Implement a type-safe API response handler"**
```typescript
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    // TypeScript knows this is ApiSuccess<T>
    return response.data;
  } else {
    // TypeScript knows this is ApiError
    throw new Error(`API Error ${response.code}: ${response.error}`);
  }
}
```

2. **"Create a discriminated union for form states"**
```typescript
type FormState = 
  | { state: 'pristine' }
  | { state: 'validating' }
  | { state: 'valid'; data: Record<string, any> }
  | { state: 'invalid'; errors: Record<string, string[]> };

function renderForm(formState: FormState) {
  switch (formState.state) {
    case 'pristine':
      return 'Fill out the form';
    case 'validating':
      return 'Validating...';
    case 'valid':
      return `Ready to submit: ${JSON.stringify(formState.data)}`;
    case 'invalid':
      return `Errors: ${Object.keys(formState.errors).join(', ')}`;
  }
}
```

3. **"Write a type guard for complex validation"**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

function isValidUser(obj: unknown): obj is User {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const candidate = obj as Record<string, unknown>;
  
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.preferences === 'object' &&
    candidate.preferences !== null &&
    ['light', 'dark'].includes((candidate.preferences as any).theme) &&
    typeof (candidate.preferences as any).notifications === 'boolean'
  );
}
```

4. **"Implement exhaustive checking with never"**
```typescript
type Status = 'pending' | 'approved' | 'rejected';

function processStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Waiting for review';
    case 'approved':
      return 'Request approved';
    case 'rejected':
      return 'Request rejected';
    default:
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${status}`);
  }
}
```

5. **"Create a type-safe event system"**
```typescript
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'order:created': { orderId: string; amount: number };
};

class TypedEventEmitter {
  private listeners: { [K in keyof EventMap]?: Array<(data: EventMap[K]) => void> } = {};
  
  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }
  
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners[event]?.forEach(listener => listener(data));
  }
}
```

**Red flags to avoid**:
- Using type assertions instead of proper type guards
- Not understanding that narrowing requires direct conditionals
- Forgetting exhaustive checking in discriminated unions
- Using `any` to bypass narrowing issues
- Not leveraging control flow analysis effectively
</details>