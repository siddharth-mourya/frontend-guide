# Decorators

## ⚡ Quick Revision
- **Experimental feature**: Enable with `"experimentalDecorators": true` in tsconfig
- **Syntax**: `@decorator` applied to classes, methods, properties, parameters, and accessors
- **Execution order**: Parameter → Method → Accessor → Property → Class (bottom to top, left to right)
- **Metadata**: Use `reflect-metadata` library for runtime metadata reflection
- **Stage 3 proposal**: New decorator standard coming, different from current implementation
- **Interview focus**: Show practical decorator implementations and metadata usage

```typescript
// Class decorator
@sealed
class ApiClient {
  @logged
  @validate
  async fetchUser(@required id: string): Promise<User> {
    return fetch(`/api/users/${id}`).then(r => r.json());
  }
}

// Method decorator implementation
function logged(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    return originalMethod.apply(this, args);
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Decorators provide **declarative metadata and behavior modification** for classes and their members. They solve the problem of cross-cutting concerns (logging, validation, authentication) without polluting business logic.

**Core problems they solve**:

**Cross-cutting concerns**:
```typescript
// Problem: Repetitive boilerplate across methods
class UserService {
  async getUser(id: string) {
    console.log('Starting getUser');
    try {
      const user = await this.userRepo.findById(id);
      console.log('Completed getUser');
      return user;
    } catch (error) {
      console.log('Error in getUser', error);
      throw error;
    }
  }
  
  async updateUser(id: string, data: Partial<User>) {
    console.log('Starting updateUser');
    try {
      const result = await this.userRepo.update(id, data);
      console.log('Completed updateUser');
      return result;
    } catch (error) {
      console.log('Error in updateUser', error);
      throw error;
    }
  }
}

// Solution: Extract concerns into decorators
class UserService {
  @log
  @errorHandler
  async getUser(id: string) {
    return this.userRepo.findById(id);
  }
  
  @log
  @errorHandler
  async updateUser(id: string, data: Partial<User>) {
    return this.userRepo.update(id, data);
  }
}
```

**Framework integration**: Decorators enable framework magic
```typescript
// Dependency injection
@Injectable()
class UserService {
  constructor(
    @Inject('UserRepository') private userRepo: UserRepository
  ) {}
}

// HTTP endpoints
@Controller('/users')
class UserController {
  @Get('/:id')
  @UseGuards(AuthGuard)
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
```

</details>

<details>
<summary>How it works</summary>
**Decorator types and signatures**:

```typescript
// Class decorator
type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;

// Method decorator
type MethodDecorator = <T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// Property decorator
type PropertyDecorator = (target: any, propertyKey: string | symbol) => void;

// Parameter decorator
type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;
```

**Implementation examples**:
```typescript
// Class decorator - modify constructor
function singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  let instance: T;
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this as any;
    }
  };
}

// Method decorator - modify behavior
function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cache = new Map<string, any>();
  
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Property decorator - define metadata
function column(type: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('column:type', type, target, propertyKey);
  };
}

// Parameter decorator - collect parameter info
function validate(target: any, propertyKey: string, parameterIndex: number) {
  const existingParams = Reflect.getOwnMetadata('validate:params', target, propertyKey) || [];
  existingParams.push(parameterIndex);
  Reflect.defineMetadata('validate:params', existingParams, target, propertyKey);
}
```

**Decorator composition and execution order**:
```typescript
@decorator1
@decorator2
class Example {
  @propDecorator1
  @propDecorator2
  property: string;
  
  @methodDecorator1
  @methodDecorator2
  method(@paramDecorator param: string) {}
}

// Execution order:
// 1. paramDecorator (parameter decorators first)
// 2. methodDecorator2, methodDecorator1 (method decorators bottom-up)
// 3. propDecorator2, propDecorator1 (property decorators bottom-up)
// 4. decorator2, decorator1 (class decorators bottom-up)
```

**Metadata reflection pattern**:
```typescript
import 'reflect-metadata';

// Define metadata
@Reflect.metadata('role', 'admin')
class UserController {
  @Reflect.metadata('permissions', ['read', 'write'])
  updateUser() {}
}

// Read metadata
const role = Reflect.getMetadata('role', UserController);
const permissions = Reflect.getMetadata('permissions', UserController.prototype, 'updateUser');

// Build authorization system
function authorize(requiredRole: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const userRole = getCurrentUserRole();
      if (userRole !== requiredRole) {
        throw new Error('Unauthorized');
      }
      return originalMethod.apply(this, args);
    };
  };
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Decorators are just syntactic sugar for functions"**
- They have special compilation behavior
- Metadata can be attached and read at runtime
- Framework tooling relies on decorator metadata for DI, routing, etc.

```typescript
// Not just this:
function logged(fn) { /* ... */ }
const method = logged(originalMethod);

// But this enables:
@Injectable()
class Service {} // Framework can discover and instantiate

const metadata = Reflect.getMetadata('design:type', Service);
```

**❌ "Decorators run at runtime"**
- They execute **at class definition time** (when module loads)
- The decorated functions run at runtime
- Metadata is attached at definition time, read at runtime

```typescript
console.log('Module loading...');

@logged // This executes NOW (module load time)
class Example {
  @timed // This also executes NOW
  method() { // This executes later (when called)
    console.log('Method running');
  }
}

console.log('Module loaded');
```

**❌ "Property decorators can modify property values"**
```typescript
// WRONG: Property decorators can't change the property value
function defaultValue(value: any) {
  return function (target: any, propertyKey: string) {
    // This doesn't work - can't modify the property value
    target[propertyKey] = value; 
  };
}

// RIGHT: Use class decorator or modify constructor
function defaultValues(defaults: Record<string, any>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        Object.assign(this, defaults);
      }
    };
  };
}
```

**❌ "All decorators return something"**
```typescript
// Class decorators can return a new constructor
function enhanced<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    enhanced = true;
  };
}

// Method decorators modify the descriptor
function readonly(target: any, key: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false;
  // No return needed - modifies in place
}

// Property/parameter decorators only attach metadata
function metadata(value: any) {
  return function (target: any, key: string) {
    // Never return anything
    Reflect.defineMetadata('custom', value, target, key);
  };
}
```

**❌ "TypeScript decorators are the same as the TC39 proposal"**
- Current TypeScript uses experimental decorators (legacy)
- TC39 Stage 3 proposal is different and incompatible
- Future TypeScript will support new standard decorators

```typescript
// Current TypeScript experimental decorators
function legacy(target: any, key: string, descriptor: PropertyDescriptor) {
  // Has access to descriptor
}

// Future TC39 decorators (different signature)
function standard(value, context) {
  // Different parameters, different capabilities
}
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Implement practical decorators for common use cases
- Understand metadata reflection patterns
- Explain decorator execution order and timing
- Show real-world framework usage (NestJS, Angular)

**Common interview questions**:
1. "Implement a retry decorator for async methods"
2. "Create a caching decorator that respects TTL"
3. "Build a validation decorator that checks method parameters"
4. "How would you implement a simple dependency injection system?"

**Code challenges**:
```typescript
// Challenge 1: Rate limiting decorator
function rateLimit(requestsPerSecond: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Implement rate limiting logic
  };
}

// Challenge 2: Async retry with exponential backoff
function retry(maxAttempts: number, backoffMs: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Your implementation
    };
  };
}

// Challenge 3: Method timing and performance monitoring
function monitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // Log execution time, memory usage, etc.
}

// Challenge 4: Simple validation system
function validate(schema: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Validate parameters against schema
  };
}

// Challenge 5: Dependency injection container
function Injectable(target: any) {
  // Register class in DI container
}

function Inject(token: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // Mark parameter for injection
  };
}

class DIContainer {
  static resolve<T>(constructor: new (...args: any[]) => T): T {
    // Resolve dependencies and instantiate
  }
}
```

**Real-world patterns**:
```typescript
// API endpoint decoration (NestJS style)
@Controller('/api/users')
export class UserController {
  constructor(
    @Inject('UserService') private userService: UserService
  ) {}
  
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async getUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request
  ): Promise<User> {
    return this.userService.findById(id);
  }
  
  @Post()
  @UseInterceptors(LoggingInterceptor)
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.create(userData);
  }
}

// Database entity decoration (TypeORM style)
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ length: 100 })
  @Index()
  name: string;
  
  @Column({ unique: true })
  email: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

// Validation decorators
export class CreateUserDto {
  @IsString()
  @Length(1, 100)
  name: string;
  
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;
}
```

**Advanced interview topics**:
- Decorator factories and parameterized decorators
- Circular dependencies in decorator-based DI systems
- Performance implications of heavy decorator usage
- Building custom decorator-based frameworks

**Red flags in answers**:
- Not understanding decorator execution timing
- Confusion about what each decorator type can/cannot do
- Not knowing about `reflect-metadata` for advanced scenarios
- Unable to implement practical decorators

</details>