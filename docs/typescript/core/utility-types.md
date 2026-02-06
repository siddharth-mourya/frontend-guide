# Utility Types

## ⚡ Quick Revision
- **`Partial<T>`**: Makes all properties optional `{ name?: string }`
- **`Required<T>`**: Makes all properties required (opposite of Partial)
- **`Readonly<T>`**: Makes all properties readonly `readonly name: string`
- **`Pick<T, K>`**: Selects specific properties `Pick<User, 'id' | 'name'>`
- **`Omit<T, K>`**: Excludes specific properties `Omit<User, 'password'>`
- **`Record<K, V>`**: Creates type with keys K and values V `Record<string, number>`
- **`Exclude<T, U>`**: Removes types from union `Exclude<'a'|'b'|'c', 'a'> = 'b'|'c'`
- **`Extract<T, U>`**: Keeps only matching types `Extract<'a'|'b'|'c', 'a'|'x'> = 'a'`
- **`NonNullable<T>`**: Removes null and undefined from union

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

// Utility type examples
type PartialUser = Partial<User>; // All optional
type PublicUser = Omit<User, 'password'>; // No password
type UserUpdate = Pick<User, 'name' | 'email'>; // Only name/email
type StatusRecord = Record<string, boolean>; // { [key: string]: boolean }

// Advanced combinations
type CreateUserDTO = Omit<User, 'id'> & { confirmPassword: string };
type UserWithDefaults = Required<Pick<User, 'name'>> & Partial<Omit<User, 'name'>>;
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Utility types solve common patterns in TypeScript development:

**Data transformation**: Converting between different shapes of the same data
```typescript
// API response vs internal model vs form data
type UserAPI = { id: string; full_name: string; email_address: string };
type User = { id: number; name: string; email: string };
type UserForm = Pick<User, 'name' | 'email'>;
```

**Type safety in operations**: Ensuring operations maintain type relationships
```typescript
// Update functions that preserve type structure
function updateUser<T extends User>(user: T, updates: Partial<T>): T {
  return { ...user, ...updates };
}
```

**Configuration and options**: Creating flexible APIs with type safety
```typescript
// Configuration with required core + optional extensions
type CoreConfig = { apiUrl: string; timeout: number };
type OptionalConfig = { retries: number; caching: boolean };
type Config = CoreConfig & Partial<OptionalConfig>;
```

</details>

<details>
<summary>How it works</summary>
**Mapped types foundation**:
```typescript
// Partial implementation
type Partial<T> = {
  [P in keyof T]?: T[P];
}

// Pick implementation  
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
}

// Record implementation
type Record<K extends keyof any, T> = {
  [P in K]: T;
}
```

**Conditional type mechanics**:
```typescript
// Exclude implementation
type Exclude<T, U> = T extends U ? never : T;

// Extract implementation
type Extract<T, U> = T extends U ? T : never;

// NonNullable implementation
type NonNullable<T> = T extends null | undefined ? never : T;
```

**Complex utility combinations**:
```typescript
// DeepPartial - recursive partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// PickByType - pick properties by their type
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type User = { id: number; name: string; age: number; isActive: boolean };
type NumberProps = PickByType<User, number>; // { id: number; age: number }
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Partial makes everything optional recursively"**
```typescript
interface User {
  profile: {
    name: string;
    age: number;
  };
}

type PartialUser = Partial<User>;
// Only top level is optional: { profile?: { name: string; age: number } }
// profile.name is still required if profile exists

// For deep partial, you need custom type
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

**❌ "Pick and Omit can be used on anything"**
```typescript
// Pick/Omit only work with object types
type StringPick = Pick<string, 'length'>; // Error
type UserPick = Pick<User, 'name' | 'email'>; // OK
```

**❌ "Record is just an object type"**
```typescript
// Record enforces ALL keys must be present
type Status = 'loading' | 'success' | 'error';
type StatusConfig = Record<Status, boolean>;

const config: StatusConfig = {
  loading: true,
  success: true,
  // error: false // Missing error key = compile error
};

// For partial records:
type PartialStatusConfig = Partial<Record<Status, boolean>>;
```

**❌ "Exclude and Extract work on object properties"**
```typescript
// They work on union types, not object properties
type Colors = 'red' | 'blue' | 'green';
type WarmColors = Exclude<Colors, 'blue'>; // 'red' | 'green'
type CoolColors = Extract<Colors, 'blue' | 'purple'>; // 'blue'

// For object properties, use Pick/Omit
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Implement a function that updates partial user data"**
```typescript
function updateUser(
  userId: string, 
  updates: Partial<Pick<User, 'name' | 'email' | 'isActive'>>
): Promise<User> {
  // Only allow updating specific fields, all optional
  return api.patch(`/users/${userId}`, updates);
}

// Usage
updateUser('123', { name: 'John' }); // ✅
updateUser('123', { password: 'new' }); // ❌ Password not allowed
```

2. **"Create a type-safe configuration builder"**
```typescript
interface Config {
  database: { host: string; port: number; };
  cache: { redis: string; ttl: number; };
  features: { analytics: boolean; logging: boolean; };
}

type ConfigBuilder<T = {}> = {
  database: (config: Config['database']) => ConfigBuilder<T & { database: Config['database'] }>;
  cache: (config: Config['cache']) => ConfigBuilder<T & { cache: Config['cache'] }>;
  features: (config: Config['features']) => ConfigBuilder<T & { features: Config['features'] }>;
  build: T extends Config ? () => Config : never;
};
```

3. **"How would you make only certain properties optional?"**
```typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type CreateUser = PartialBy<User, 'id'>; // id is optional, rest required
// { name: string; email: string; password: string; id?: number }
```

4. **"Implement a safe object key extraction"**
```typescript
function getKeys<T extends Record<string, any>>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

function pickFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

const user = { id: 1, name: "John", email: "john@ex.com", password: "secret" };
const publicUser = pickFields(user, ['id', 'name', 'email']);
// Type: Pick<typeof user, 'id' | 'name' | 'email'>
```

5. **"Create a type that ensures all enum values are handled"**
```typescript
enum Status { Pending, Approved, Rejected }

type StatusHandler = Record<Status, (data: any) => void>;

const handlers: StatusHandler = {
  [Status.Pending]: (data) => console.log('Pending:', data),
  [Status.Approved]: (data) => console.log('Approved:', data),
  [Status.Rejected]: (data) => console.log('Rejected:', data),
  // TypeScript ensures all status values are handled
};
```

**Red flags to avoid**:
- Using `any` instead of proper utility types
- Not understanding the difference between Exclude/Extract and Pick/Omit
- Assuming Partial works recursively
- Creating verbose manual types when utility types exist
- Not leveraging utility type combinations for complex scenarios
</details>