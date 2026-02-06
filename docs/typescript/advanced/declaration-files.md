# Declaration Files

## ⚡ Quick Revision
- **Purpose**: Provide type information for JavaScript libraries without modifying source
- **File extension**: `.d.ts` files contain only type declarations, no runtime code
- **Global declarations**: Use `declare global` to augment global namespace
- **Module declarations**: `declare module 'library-name'` to type external libraries
- **DefinitelyTyped**: Community repository `@types/*` packages for popular libraries
- **Triple-slash directives**: `/// <reference types="..." />` for type dependencies
- **Interview focus**: Writing .d.ts files for untyped libraries and understanding type resolution

```typescript
// Basic declaration file structure
declare module 'untyped-library' {
  export function doSomething(param: string): number;
  export interface Config {
    timeout: number;
    retries: boolean;
  }
  export default class Library {
    constructor(config: Config);
    process(): Promise<any>;
  }
}

// Global augmentation
declare global {
  interface Window {
    myGlobalFunction: (data: any) => void;
  }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Declaration files bridge the gap between **JavaScript libraries and TypeScript's type system**. They provide type safety without requiring library authors to rewrite in TypeScript or maintain TypeScript versions.

**Core problems they solve**:

**Legacy JavaScript libraries**:
```typescript
// Problem: Using untyped JavaScript library
import $ from 'jquery'; // ❌ Error: Could not find declaration file
$('#element').fadeIn(); // ❌ No intellisense or type checking

// Solution: Declaration file provides types
// jquery.d.ts
declare module 'jquery' {
  interface JQueryStatic {
    (selector: string): JQuery;
  }
  
  interface JQuery {
    fadeIn(duration?: number): JQuery;
    fadeOut(duration?: number): JQuery;
  }
  
  const $: JQueryStatic;
  export = $;
}

// Now works with types
import $ from 'jquery'; // ✅ Types available
$('#element').fadeIn(); // ✅ Type checking and intellisense
```

**Global libraries and environment types**:
```typescript
// Problem: Browser APIs or global libraries not recognized
window.gtag('config', 'GA_MEASUREMENT_ID'); // ❌ gtag doesn't exist on window

// Solution: Global declarations
// global.d.ts
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

// Alternative: declare function for global scope
declare function gtag(command: string, targetId: string, config?: any): void;
```

**Module augmentation for existing types**:
```typescript
// Problem: Need to extend Express Request type
app.get('/user', (req, res) => {
  const user = req.user; // ❌ Property 'user' does not exist
});

// Solution: Module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
```

</details>

<details>
<summary>How it works</summary>
**Declaration file structure and syntax**:

```typescript
// Basic module declaration
declare module 'library-name' {
  // Export types, interfaces, functions, classes
  export interface Config {
    apiKey: string;
    timeout?: number;
  }
  
  export function init(config: Config): void;
  export function cleanup(): Promise<void>;
  
  export class ApiClient {
    constructor(config: Config);
    request<T>(endpoint: string): Promise<T>;
  }
  
  // Default export
  export default ApiClient;
}

// Namespace declarations
declare namespace MyLibrary {
  interface Options {
    debug: boolean;
  }
  
  function configure(options: Options): void;
  function getData(): any[];
  
  namespace Utils {
    function formatDate(date: Date): string;
    function parseJSON(json: string): any;
  }
}

// Global declarations
declare global {
  // Augment existing global interfaces
  interface Window {
    APP_CONFIG: {
      apiUrl: string;
      version: string;
    };
  }
  
  interface Document {
    customMethod(): void;
  }
  
  // Declare global variables
  const BUILD_VERSION: string;
  const IS_DEVELOPMENT: boolean;
  
  // Declare global functions
  function analytics(event: string, data?: any): void;
}
```

**Module resolution patterns**:
```typescript
// Node module pattern
declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface Request extends IncomingMessage {
    params: any;
    query: any;
    body: any;
  }
  
  export interface Response extends ServerResponse {
    json(obj: any): Response;
    status(code: number): Response;
  }
  
  export interface Application {
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
  }
  
  function express(): Application;
  export = express;
}

// UMD (Universal Module Definition) pattern
declare module 'lodash' {
  interface LoDashStatic {
    map<T, R>(collection: T[], iteratee: (item: T) => R): R[];
    filter<T>(collection: T[], predicate: (item: T) => boolean): T[];
    groupBy<T>(collection: T[], iteratee: (item: T) => any): Record<string, T[]>;
  }
  
  const _: LoDashStatic;
  export = _;
}

// ES6 module pattern
declare module 'modern-library' {
  export interface Config {
    timeout: number;
  }
  
  export function process(data: any): Promise<any>;
  export { default as Utils } from './utils';
  
  const library: {
    init(config: Config): void;
    version: string;
  };
  
  export default library;
}
```

**Advanced declaration patterns**:
```typescript
// Generic declarations
declare module 'generic-library' {
  export interface Collection<T> {
    add(item: T): void;
    find(predicate: (item: T) => boolean): T | undefined;
    map<U>(transform: (item: T) => U): Collection<U>;
  }
  
  export function createCollection<T>(): Collection<T>;
}

// Conditional types in declarations
declare module 'conditional-lib' {
  export type ApiResponse<T> = T extends string 
    ? { message: T }
    : { data: T };
    
  export function fetch<T>(url: string): Promise<ApiResponse<T>>;
}

// Function overloads
declare module 'overloaded-lib' {
  export function parse(input: string): object;
  export function parse(input: Buffer): object;
  export function parse<T>(input: string, schema: Schema<T>): T;
}

// Augmenting existing modules
declare module 'existing-module' {
  interface ExistingInterface {
    newMethod(): void;
  }
  
  export function newFunction(): void;
}
```

**DefinitelyTyped patterns**:
```typescript
// Typical @types package structure
// @types/jquery/index.d.ts
declare global {
  interface JQueryStatic {
    (selector: string): JQuery;
    (element: Element): JQuery;
    (callback: (jq: JQueryStatic) => void): void;
  }
  
  interface JQuery {
    addClass(className: string): JQuery;
    removeClass(className?: string): JQuery;
    on(events: string, handler: (event: Event) => void): JQuery;
  }
}

declare const $: JQueryStatic;
declare const jQuery: JQueryStatic;

export = $;
export as namespace $;
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ ".d.ts files contain runtime code"**
```typescript
// WRONG: This won't work in .d.ts file
declare module 'my-lib' {
  export function doSomething() {
    console.log('This is implementation!'); // ❌ No implementation allowed
  }
}

// RIGHT: Only declarations
declare module 'my-lib' {
  export function doSomething(): void; // ✅ Declaration only
}
```

**❌ "Global declarations are always available"**
```typescript
// In some-file.d.ts
declare global {
  interface Window {
    myFunction(): void;
  }
}

// This only works if the .d.ts file is:
// 1. In your TypeScript project
// 2. Referenced in tsconfig.json
// 3. Not inside a module (or has export {})

// To make it a global declaration file, add:
export {}; // Makes it a module, then global declarations work
```

**❌ "You need separate .d.ts files for every library"**
```typescript
// You can declare multiple modules in one file
// types/external-libs.d.ts
declare module 'untyped-lib-1' {
  export function method1(): void;
}

declare module 'untyped-lib-2' {
  export function method2(): string;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
```

**❌ "Declaration merging doesn't work across files"**
```typescript
// file1.d.ts
declare module 'my-module' {
  export interface Config {
    timeout: number;
  }
}

// file2.d.ts  
declare module 'my-module' {
  export interface Config {
    retries: boolean; // ✅ Merged with previous declaration
  }
  
  export function init(config: Config): void;
}

// Result: Config has both timeout and retries
```

**❌ "Module augmentation affects the original module"**
```typescript
// Module augmentation only affects TypeScript types, not runtime
declare module 'express-serve-static-core' {
  interface Request {
    user?: User; // This is TypeScript-only
  }
}

// At runtime, req.user is still undefined unless you set it
app.use((req, res, next) => {
  req.user = getCurrentUser(); // You need to actually set it
  next();
});
```

**❌ "Triple-slash directives are obsolete"**
```typescript
// Still needed for some scenarios
/// <reference types="node" />
/// <reference types="jest" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
    }
  }
}

// Without the reference, NodeJS namespace might not be available
```

</details>

<details>
<summary>Interview angle</summary>
**Senior-level expectations**:
- Write declaration files for complex JavaScript libraries
- Understand module resolution and augmentation patterns
- Show knowledge of DefinitelyTyped contribution process
- Demonstrate troubleshooting type resolution issues

**Common interview questions**:
1. "Write a declaration file for a jQuery plugin"
2. "How would you add custom properties to the Express Request type?"
3. "Create types for a library that has both global and module exports"
4. "How do you handle libraries with multiple entry points?"

**Code challenges**:
```typescript
// Challenge 1: Complex JavaScript library
// Given this JavaScript library usage:
const db = require('simple-db');
db.connect('mongodb://localhost');
const users = db.collection('users');
users.find({name: 'John'}).then(results => console.log(results));

// Write declaration file for it
declare module 'simple-db' {
  // Your implementation
}

// Challenge 2: Global library with namespaces
// Library adds gtag and dataLayer to global scope
// gtag('config', 'GA_ID', {custom_map: {dimension1: 'user_id'}});
// dataLayer.push({event: 'page_view', page_title: 'Home'});

declare global {
  // Your implementation
}

// Challenge 3: Module augmentation for popular library
// Add custom methods to moment.js
declare module 'moment' {
  interface Moment {
    business(): Moment;
    businessAdd(amount: number, unit: string): Moment;
  }
}

// Challenge 4: Generic library with builders
// const query = QueryBuilder.select('name', 'email').from('users').where('active', true);

declare module 'query-builder' {
  // Your implementation with method chaining
}

// Challenge 5: React component library
// import { Button, Modal } from 'ui-components';
// <Button variant="primary" size="large" onClick={handler}>Text</Button>

declare module 'ui-components' {
  import { ComponentType, MouseEventHandler, ReactNode } from 'react';
  
  // Your implementation
}
```

**Real-world scenarios**:
```typescript
// Typing environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      JWT_SECRET: string;
      REDIS_URL?: string;
    }
  }
}

// Typing Webpack require.context
declare var require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
  };
};

// Typing CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Typing asset imports
declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export { ReactComponent };
  const src: string;
  export default src;
}

// Typing service worker
declare module '*.worker.ts' {
  const Worker: new () => Worker;
  export default Worker;
}

// Complex library with multiple patterns
declare module 'complex-lib' {
  // Class-based API
  export class Client {
    constructor(options: ClientOptions);
    request<T>(endpoint: string): Promise<T>;
  }
  
  // Function-based API  
  export function createClient(options: ClientOptions): Client;
  
  // Namespace for utilities
  export namespace utils {
    function formatDate(date: Date): string;
    function parseResponse<T>(response: any): T;
  }
  
  // Default export
  const lib: {
    Client: typeof Client;
    createClient: typeof createClient;
    utils: typeof utils;
  };
  
  export default lib;
}
```

**Advanced interview topics**:
- Writing declaration files for libraries with complex APIs
- Handling version-specific type differences
- Contributing to DefinitelyTyped
- Performance implications of complex declaration files

**Red flags in answers**:
- Not understanding the difference between .d.ts and .ts files
- Confusion about global vs module declarations
- Not knowing about declaration merging
- Unable to handle complex JavaScript patterns in declarations

</details>