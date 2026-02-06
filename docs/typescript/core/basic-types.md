# Basic Types

## ⚡ Quick Revision
- **Primitive types**: `string`, `number`, `boolean`, `symbol`, `bigint`, `undefined`, `null`
- **Object types**: `object`, arrays (`T[]` or `Array<T>`), functions
- **Enums**: Numeric (default), string, const, heterogeneous
- **Tuples**: Fixed-length arrays with specific types `[string, number]`
- **Type aliases**: `type Name = string | number`
- **Interfaces**: Contract for object structure, extensible, declaration merging
- **Key difference**: Interfaces for objects, type aliases for unions/primitives
- **Arrays vs Tuples**: Arrays are homogeneous/variable length, tuples are heterogeneous/fixed length

```typescript
// Basic types
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Enums
enum Color { Red, Green, Blue } // 0, 1, 2
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

// Tuples
let person: [string, number] = ["John", 30];

// Type alias vs Interface
type Point = { x: number; y: number };
interface Shape { area: number; }

// Interface extends
interface Circle extends Shape { radius: number; }
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
TypeScript's type system provides compile-time safety by catching type-related errors before runtime. Basic types form the foundation for more complex type operations and enable:

- **Static analysis**: Catch bugs during development
- **IntelliSense**: Better IDE support and autocomplete
- **Refactoring safety**: Confident code changes
- **Documentation**: Types serve as inline documentation
- **Runtime elimination**: No performance cost in compiled JavaScript

</details>

<details>
<summary>How it works</summary>
**Type checking process**:
1. Parser creates AST with type annotations
2. Type checker validates assignments and function calls
3. Type information is erased during compilation

**Enum compilation**:
```typescript
enum Color { Red, Green, Blue }
// Compiles to:
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Green"] = 1] = "Green";
    Color[Color["Blue"] = 2] = "Blue";
})(Color || (Color = {}));
```

**Const enums** are inlined at compile time:
```typescript
const enum Direction { Up, Down }
let dir = Direction.Up; // Becomes: let dir = 0;
```

**Interface vs Type structural equivalence**:
```typescript
interface A { x: number; }
type B = { x: number; };
// A and B are structurally equivalent
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Interfaces and types are identical"**
- Interfaces support declaration merging, types don't
- Interfaces can only describe objects, types can describe any type
- Interfaces create a name in error messages, types may be inlined

**❌ "Tuples are just arrays with types"**
```typescript
let arr: number[] = [1, 2, 3];
arr.push(4); // ✅ Valid

let tuple: [number, number] = [1, 2];
tuple.push(3); // ⚠️ Compiles but breaks tuple contract
```

**❌ "Enums are just constants"**
- Enums create both type and value
- Reverse mapping exists for numeric enums
- String enums don't have reverse mapping

**❌ "null and undefined are the same"**
- In strict mode, they're distinct types
- `null` represents intentional absence, `undefined` represents uninitialized

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Difference between interface and type?"**
   - Declaration merging capability
   - Use interface for object contracts, type for unions/intersections
   - Performance: interfaces are cached better by compiler

2. **"When would you use enums vs const assertions?"**
```typescript
// Enum - creates runtime object
enum Status { Active, Inactive }

// Const assertion - no runtime cost
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = typeof Status[keyof typeof Status];
```

3. **"How do tuples differ from arrays?"**
   - Fixed length vs variable length
   - Heterogeneous vs homogeneous types
   - Use for function return values with multiple types

4. **"Explain tuple destructuring safety"**
```typescript
function getCoords(): [number, number] {
  return [10, 20];
}
const [x, y] = getCoords(); // x and y are properly typed
```

**Red flags to avoid**:
- Using `any` instead of proper types
- Not understanding enum compilation behavior
- Confusing structural vs nominal typing
</details>