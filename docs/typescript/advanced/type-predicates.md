# Type Predicates

## ⚡ Quick Revision
- **Type predicate**: Function return type that narrows types: `(x: unknown): x is string`
- **User-defined type guards**: Custom functions that check and narrow types at runtime
- **Assertion functions**: Functions that throw/error if condition fails: `asserts x is string`
- **Discriminated unions**: Use type predicates to narrow union types safely
- **Control flow analysis**: TypeScript uses these to narrow types in subsequent code
- **Interview focus**: Write custom type guards and understand type narrowing flow

```typescript
// Type predicate function
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Assertion function
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Expected number');
  }
}

// Usage narrows types
function process(value: unknown) {
  if (isString(value)) {
    value.toUpperCase(); // ✅ TypeScript knows value is string
  }
  
  assertIsNumber(value); // After this, value is definitely number
  return value * 2; // ✅ Safe to use number methods
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Type predicates bridge the gap between **runtime type checking and compile-time type safety**. JavaScript is dynamically typed, but TypeScript needs to understand what types exist at runtime to provide safety.

**Core problems they solve**:

**Runtime type validation with compile-time benefits**:
```typescript
// Problem: API responses are unknown at compile time
function handleApiResponse(response: unknown) {
  // TypeScript can't know what properties exist
  response.data; // ❌ Error: Object is of type 'unknown'
  response.status; // ❌ Error
}

// Solution: Type predicates provide runtime checking + compile-time narrowing
interface ApiResponse {
  data: any;
  status: number;
  success: boolean;
}

function isApiResponse(obj: unknown): obj is ApiResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'data' in obj &&
    'status' in obj &&
    'success' in obj
  );
}

function handleApiResponse(response: unknown) {
  if (isApiResponse(response)) {
    response.data; // ✅ TypeScript knows this is safe
    response.status; // ✅ All properties available
  }
}
```

**Discriminated union narrowing**:
```typescript
interface LoadingState { status: 'loading' }
interface SuccessState { status: 'success'; data: any[] }
interface ErrorState { status: 'error'; message: string }

type AppState = LoadingState | SuccessState | ErrorState;

// Type predicate for specific state
function isSuccessState(state: AppState): state is SuccessState {
  return state.status === 'success';
}

function renderState(state: AppState) {
  if (isSuccessState(state)) {
    return state.data.map(/* ... */); // ✅ data is available
  }
  // Handle other cases...
}
```

</details>

<details>
<summary>How it works</summary>
**Type predicate mechanics**:
1. Function executes at runtime to check actual values
2. Return type annotation tells TypeScript about the relationship
3. TypeScript's control flow analysis uses this information for narrowing
4. Subsequent code has narrowed type information

**Type predicate syntax**:
```typescript
// Basic type predicate
function isType(value: unknown): value is TargetType {
  // Runtime check logic
  return /* boolean expression */;
}

// Generic type predicate
function isArrayOf<T>(
  arr: unknown,
  itemCheck: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(itemCheck);
}

// Assertion function
function assertIsType(value: unknown): asserts value is TargetType {
  if (!isType(value)) {
    throw new Error('Type assertion failed');
  }
}
```

**Control flow analysis**:
```typescript
function example(value: string | number | boolean) {
  // Initially: string | number | boolean
  
  if (typeof value === 'string') {
    // Narrowed to: string
    value.charAt(0); // ✅ String methods available
    return;
  }
  
  // Now: number | boolean (string eliminated)
  
  if (typeof value === 'number') {
    // Narrowed to: number  
    value.toFixed(2); // ✅ Number methods available
    return;
  }
  
  // Now: boolean (only remaining type)
  value.valueOf(); // ✅ Boolean methods available
}
```

**Advanced patterns**:
```typescript
// Nested object type guards
interface User {
  id: number;
  profile: {
    name: string;
    email: string;
  };
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).profile === 'object' &&
    typeof (obj as any).profile?.name === 'string' &&
    typeof (obj as any).profile?.email === 'string'
  );
}

// Generic constraints with type predicates
function filterByType<T, U extends T>(
  items: T[],
  predicate: (item: T) => item is U
): U[] {
  return items.filter(predicate);
}

// Union type narrowing
type Shape = Circle | Rectangle | Triangle;

function isCircle(shape: Shape): shape is Circle {
  return 'radius' in shape;
}

function getArea(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2; // ✅ radius is available
  }
  // Handle other shapes...
}
```

**Assertion functions in detail**:
```typescript
// Different assertion patterns
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function assertHasProperty<T, K extends PropertyKey>(
  obj: T,
  key: K
): asserts obj is T & Record<K, unknown> {
  if (!(key in (obj as any))) {
    throw new Error(`Missing property: ${String(key)}`);
  }
}

// Usage
function processConfig(config: unknown) {
  assertHasProperty(config, 'apiUrl');
  assertIsString(config.apiUrl); // config is now known to have apiUrl: string
  
  // Safe to use
  fetch(config.apiUrl);
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Type predicates provide runtime type safety"**
- They only provide **compile-time** type narrowing
- The actual runtime checking is up to your implementation
- TypeScript trusts that your predicate logic is correct

```typescript
// BAD: Lying type predicate
function isString(value: unknown): value is string {
  return true; // Always returns true but claims it checks for string
}

// This compiles but will fail at runtime
let x: unknown = 123;
if (isString(x)) {
  x.charAt(0); // 💥 Runtime error! 123 doesn't have charAt
}
```

**❌ "Assertion functions and type predicates are the same"**
```typescript
// Type predicate - returns boolean, used in conditions
function isNumber(x: unknown): x is number {
  return typeof x === 'number';
}

// Assertion function - throws on failure, narrows in all subsequent code
function assertIsNumber(x: unknown): asserts x is number {
  if (typeof x !== 'number') {
    throw new Error('Not a number');
  }
}

// Different usage patterns
if (isNumber(value)) {
  // value is number in this block only
}

assertIsNumber(value);
// value is number from this point forward
```

**❌ "Type predicates work with any boolean expression"**
```typescript
// WRONG: TypeScript doesn't understand complex boolean logic
function isValidUser(obj: unknown): obj is User {
  const isObject = typeof obj === 'object';
  const hasId = obj && 'id' in obj;
  return isObject && hasId; // TypeScript can't follow this logic
}

// BETTER: Direct, clear checks
function isValidUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as any).id === 'number'
  );
}
```

**❌ "Type narrowing persists across function calls"**
```typescript
let value: string | number = getValue();

if (typeof value === 'string') {
  processValue(); // Could modify 'value'
  value.charAt(0); // ❌ Error: value could be number again
}

// TypeScript resets type information after function calls that might modify variables
```

**❌ "You need type predicates for all type checking"**
```typescript
// Built-in type guards work fine for simple cases
function process(value: unknown) {
  if (typeof value === 'string') {
    // TypeScript automatically narrows here
    value.toUpperCase(); // ✅ No custom type predicate needed
  }
  
  if (Array.isArray(value)) {
    // Built-in Array.isArray is a type predicate
    value.forEach(/* ... */); // ✅ Known to be array
  }
}
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Implement robust type guards for complex data structures
- Understand the difference between type predicates and assertion functions
- Show real-world usage patterns (API validation, data parsing)
- Demonstrate understanding of control flow analysis

**Common interview questions**:
1. "Write a type guard for a discriminated union of shapes"
2. "How would you validate an API response with unknown structure?"
3. "What's the difference between type predicates and assertion functions?"
4. "How do type guards interact with TypeScript's control flow analysis?"

**Code challenges**:
```typescript
// Challenge 1: Nested object validation
interface ApiUser {
  id: number;
  profile: {
    name: string;
    email: string;
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  permissions: string[];
}

function isApiUser(obj: unknown): obj is ApiUser {
  // Your implementation
}

// Challenge 2: Generic array type guard
function isArrayOfType<T>(
  arr: unknown,
  typeGuard: (item: unknown) => item is T
): arr is T[] {
  // Your implementation
}

// Challenge 3: Discriminated union with type guards
type ServerResponse = 
  | { type: 'success'; data: any }
  | { type: 'error'; message: string }
  | { type: 'loading' };

function isSuccessResponse(response: ServerResponse): response is /* ? */ {
  // Your implementation
}

function isErrorResponse(response: ServerResponse): response is /* ? */ {
  // Your implementation
}

// Challenge 4: Assertion function with custom error
function assertIsValidEmail(email: unknown): asserts email is string {
  // Your implementation - throw descriptive error if invalid
}

// Challenge 5: Complex validation with error accumulation
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

function validateAndParse<T>(
  obj: unknown,
  schema: /* Define schema type */
): ValidationResult<T> {
  // Your implementation
}
```

**Advanced interview topics**:
- Type predicates with generic constraints
- Building validation libraries with type predicates
- Performance considerations for runtime type checking
- Integration with JSON schema validation

**Real-world scenarios**:
```typescript
// API response validation
async function fetchUserData(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (!isUser(data)) {
    throw new Error('Invalid user data received from API');
  }
  
  return data; // TypeScript knows this is User
}

// Form validation with type guards
interface FormData {
  name: string;
  age: number;
  email: string;
}

function isValidFormData(obj: unknown): obj is FormData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).age === 'number' &&
    typeof (obj as any).email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((obj as any).email)
  );
}

// State machine with type predicates
type State = IdleState | LoadingState | SuccessState | ErrorState;

function canTransitionTo(from: State, to: State): boolean {
  if (isLoadingState(from)) {
    return isSuccessState(to) || isErrorState(to);
  }
  // Other transition rules...
}
```

**Red flags in answers**:
- Type predicates that don't actually check the claimed type
- Not understanding the difference between compile-time and runtime safety
- Overcomplicating simple type checks that TypeScript handles automatically
- Not knowing about assertion functions vs type predicates

</details>