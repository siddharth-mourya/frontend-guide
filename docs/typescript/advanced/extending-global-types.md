# Extending Global Types

## ⚡ Quick Revision
- **`declare global`**: Augment global namespace types (Window, Document, NodeJS, etc.)
- **Module augmentation**: Extend existing module types using `declare module`
- **Interface merging**: TypeScript automatically merges interfaces with same name
- **Namespace merging**: Extend existing namespaces with additional properties
- **Triple-slash directives**: Reference type dependencies for global augmentation
- **Interview focus**: Show practical global type extensions and understand merge behavior

```typescript
// Global interface augmentation
declare global {
  interface Window {
    ENV: {
      API_URL: string;
      DEBUG: boolean;
    };
    gtag: (command: string, ...args: any[]) => void;
  }
  
  interface Document {
    startViewTransition?: (callback?: () => void) => ViewTransition;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
    }
  }
}

// Module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: string };
    correlationId: string;
  }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Global type extension solves the problem of **type compatibility with external libraries, environments, and runtime additions** that TypeScript doesn't know about by default.

**Core problems they solve**:

**Environment-specific globals**:
```typescript
// Problem: Browser APIs not in TypeScript's default lib
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js'); // ✅ Built-in
}

// But newer APIs might not be included
document.startViewTransition(() => { // ❌ Property doesn't exist
  updateDOM();
});

// Solution: Augment global types
declare global {
  interface Document {
    startViewTransition?: (callback?: () => void) => ViewTransition;
  }
  
  interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
  }
}
```

**Library integrations that modify globals**:
```typescript
// Problem: Libraries add properties to global objects
// After loading analytics library:
window.gtag('config', 'GA-12345'); // ❌ gtag doesn't exist on Window

// Solution: Extend Window interface
declare global {
  interface Window {
    gtag: (command: 'config' | 'event' | 'custom', ...args: any[]) => void;
    dataLayer: any[];
  }
}
```

**Framework-specific extensions**:
```typescript
// Problem: Express middleware adds properties to req/res
app.use((req, res, next) => {
  req.user = await authenticate(req); // ❌ user doesn't exist on Request
  res.success = (data) => res.json({success: true, data}); // ❌ success method doesn't exist
  next();
});

// Solution: Augment framework types
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    correlationId: string;
  }
  
  interface Response {
    success(data: any): Response;
    error(message: string, code?: number): Response;
  }
}
```

</details>

<details>
<summary>How it works</summary>
**Declaration merging mechanics**:
TypeScript automatically merges declarations of the same name, allowing you to extend existing types:

```typescript
// Built-in Window interface has basic properties
// Your augmentation adds more properties
declare global {
  interface Window {
    customProperty: string; // Merged with existing Window interface
  }
}

// Multiple files can contribute to the same interface
// file1.d.ts
declare global {
  interface Window {
    analytics: AnalyticsObject;
  }
}

// file2.d.ts  
declare global {
  interface Window {
    config: AppConfig;
  }
}

// Result: Window now has both analytics and config
```

**Module augmentation patterns**:

```typescript
// Augmenting external module types
declare module 'lodash' {
  interface LoDashStatic {
    customMethod<T>(collection: T[]): T[];
  }
}

// Augmenting Node.js built-in modules
declare module 'fs' {
  function customReadFile(path: string): Promise<string>;
}

// Augmenting library with namespaces
declare module 'moment' {
  namespace moment {
    interface Moment {
      businessDays(): number;
      isBusinessDay(): boolean;
    }
  }
}
```

**Global namespace extension**:
```typescript
// Extending built-in global namespaces
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Environment variable types
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      REDIS_URL?: string;
    }
    
    interface Process {
      // Custom process properties
      isReady: boolean;
      startTime: number;
    }
  }
  
  namespace Express {
    interface Request {
      // Global Express augmentation
      requestId: string;
      startTime: number;
    }
  }
}
```

**Complex augmentation scenarios**:
```typescript
// Conditional global augmentation
declare global {
  interface Window {
    // Only in development
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
    
    // Analytics (conditional based on environment)
    gtag: typeof import('./analytics').gtag;
    dataLayer: any[];
  }
  
  // Augment built-in types
  interface Array<T> {
    // Custom array methods
    unique(): T[];
    groupBy<K extends string | number | symbol>(
      keyFn: (item: T) => K
    ): Record<K, T[]>;
  }
  
  interface String {
    // Custom string methods
    toTitleCase(): string;
    truncate(length: number): string;
  }
}

// Module with global side effects
declare module 'my-polyfill' {
  // This module extends global types when imported
  global {
    interface Array<T> {
      includes(searchElement: T, fromIndex?: number): boolean;
    }
  }
}
```

**Advanced patterns**:
```typescript
// Generic global augmentation
declare global {
  interface Window {
    // Type-safe event system
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (event: CustomEventMap[K]) => void
    ): void;
  }
  
  interface CustomEventMap {
    'app:ready': CustomEvent<{ version: string }>;
    'user:login': CustomEvent<{ userId: string }>;
    'data:update': CustomEvent<{ collection: string; count: number }>;
  }
}

// Conditional type augmentation
declare global {
  interface Window {
    ENV: typeof import('./env').ENV;
  }
}

// Library-specific global augmentation
declare module 'react' {
  // Augment React's global JSX namespace
  namespace JSX {
    interface IntrinsicElements {
      'custom-element': CustomElementProps;
    }
  }
}

declare global {
  namespace JSX {
    // Alternative way to augment JSX
    interface IntrinsicElements {
      'another-custom-element': AnotherElementProps;
    }
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Global augmentations affect runtime behavior"**
```typescript
// WRONG: This doesn't add the method to Array.prototype
declare global {
  interface Array<T> {
    customMethod(): T[];
  }
}

// You still need to implement it at runtime
Array.prototype.customMethod = function() {
  // Implementation
  return this;
};

// The declaration just provides TypeScript types
```

**❌ "Module augmentation requires the original module"**
```typescript
// You can augment modules you don't even import
declare module 'some-library-i-dont-use' {
  interface SomeInterface {
    extraProperty: string;
  }
}

// This affects the types if anyone else imports that module
// But it doesn't cause the module to be bundled
```

**❌ "Global declarations are scoped to files"**
```typescript
// In file1.ts
declare global {
  interface Window {
    method1(): void;
  }
}

// In file2.ts  
// This sees the Window.method1 declaration from file1.ts
window.method1(); // ✅ Works even without importing file1

// Global declarations affect the entire TypeScript project
```

**❌ "Interface merging overwrites existing properties"**
```typescript
// Built-in Window interface
interface Window {
  location: Location;
  document: Document;
}

// Your augmentation
declare global {
  interface Window {
    location: CustomLocation; // ❌ Error: Duplicate identifier
    customProp: string; // ✅ Added to existing interface
  }
}

// You can only add new properties, not override existing ones
```

**❌ "Triple-slash directives are always needed"**
```typescript
// NOT always necessary
declare global {
  interface Window {
    myProp: string; // Works without triple-slash directive
  }
}

// Only needed when referencing specific type libraries
/// <reference types="node" />
declare global {
  namespace NodeJS {
    interface Process { // Now NodeJS namespace is available
      customProp: string;
    }
  }
}
```

**❌ "Global augmentations can't be conditional"**
```typescript
// You can use conditional types in global augmentations
declare global {
  interface Window {
    gtag: typeof NODE_ENV extends 'production' 
      ? (command: string, ...args: any[]) => void 
      : undefined;
  }
}

// Or conditional declaration merging
declare module 'express-serve-static-core' {
  interface Request {
    user: typeof process.env.NODE_ENV extends 'development' 
      ? any  // Relaxed in development
      : User; // Strict in production
  }
}
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Implement type-safe global extensions for real-world scenarios
- Understand declaration merging rules and limitations
- Show knowledge of framework-specific augmentation patterns
- Demonstrate conditional and generic global type extensions

**Common interview questions**:
1. "How would you add type-safe environment variables to process.env?"
2. "Extend Express Request to include authentication data"
3. "Add custom methods to built-in JavaScript types like Array"
4. "How do you handle library globals that might not be present?"

**Code challenges**:
```typescript
// Challenge 1: Type-safe environment configuration
// Make process.env type-safe with required and optional variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Your implementation
    }
  }
}

// Challenge 2: Analytics integration
// Add type-safe Google Analytics gtag to Window
declare global {
  interface Window {
    // Your implementation with proper overloads
  }
}

// Challenge 3: Express middleware augmentation
// Add correlation ID, user info, and custom response methods
declare module 'express-serve-static-core' {
  interface Request {
    // Your implementation
  }
  
  interface Response {
    // Your implementation
  }
}

// Challenge 4: Custom DOM events
// Create type-safe custom event system
declare global {
  interface Window {
    // Your implementation for type-safe addEventListener
  }
  
  interface DocumentEventMap {
    // Your custom events
  }
}

// Challenge 5: Library with global side effects
// Augment a library that adds methods to global prototypes
declare global {
  interface String {
    // Your string extensions
  }
  
  interface Array<T> {
    // Your array extensions
  }
  
  interface Date {
    // Your date extensions
  }
}
```

**Real-world patterns**:
```typescript
// Environment-based configuration
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly PORT: string;
      readonly DATABASE_URL: string;
      readonly JWT_SECRET: string;
      readonly REDIS_URL?: string;
      readonly LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
    }
  }
}

// Browser API polyfills and new features
declare global {
  interface Window {
    // Service Worker
    workbox?: any;
    
    // Analytics
    gtag?: (command: 'config' | 'event' | 'custom', ...args: any[]) => void;
    dataLayer?: any[];
    
    // Development tools
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
    
    // App configuration
    APP_CONFIG: {
      apiUrl: string;
      version: string;
      features: {
        newDashboard: boolean;
        betaFeatures: boolean;
      };
    };
  }
  
  interface Document {
    // New browser APIs
    startViewTransition?: (callback?: () => void) => ViewTransition;
  }
  
  interface Navigator {
    // Browser capabilities
    connection?: NetworkInformation;
    deviceMemory?: number;
  }
}

// Framework extensions
declare module '@nestjs/common' {
  interface ExecutionContext {
    getUser(): User | undefined;
    getCorrelationId(): string;
  }
}

declare module 'react' {
  interface HTMLAttributes<T> {
    // Custom data attributes
    'data-testid'?: string;
    'data-analytics-id'?: string;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      // Web Components
      'app-header': { title: string; theme?: 'light' | 'dark' };
      'app-sidebar': { collapsed?: boolean };
    }
  }
}

// Database ORM extensions  
declare module 'typeorm' {
  interface QueryBuilder<Entity> {
    whereIf(condition: boolean, where: string, parameters?: any): this;
    orWhereIf(condition: boolean, where: string, parameters?: any): this;
  }
}

// Testing framework extensions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toMatchApiSchema(schema: object): R;
      toHaveBeenCalledWithUser(user: User): R;
    }
  }
}
```

**Advanced interview topics**:
- Performance implications of extensive global augmentation
- Managing global type conflicts in large codebases
- Building type-safe APIs with global extensions
- Conditional compilation with global types

**Red flags in answers**:
- Not understanding the difference between type augmentation and runtime modification
- Confusion about when triple-slash directives are needed
- Not knowing about interface merging limitations
- Unable to structure global augmentations properly

**Best practices to demonstrate**:
- Keep global augmentations minimal and focused
- Use namespaces to organize related global types
- Document runtime requirements for type extensions
- Consider creating separate .d.ts files for different concerns

</details>