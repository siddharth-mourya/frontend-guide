# Modules

## ⚡ Quick Revision

- **ES Modules (ESM)**: Modern standard (`import`/`export`)
- **CommonJS**: Node.js traditional module system (`require`/`module.exports`)
- **Named exports**: Export multiple values by name
- **Default export**: Single default value per module
- **Dynamic imports**: `import()` returns promise, enables code splitting
- **Module scope**: Each module has its own scope

### Key Points

- ES modules are statically analyzed (imports hoisted)
- CommonJS is dynamically evaluated at runtime
- ES modules use strict mode by default
- Modules are singletons (cached after first load)
- Named exports better for tree-shaking
- Default exports convenient for single-purpose modules

### ES Module Syntax

```javascript
// math.js - Named exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Or export at end
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export { multiply, divide };

// Default export
export default function calculate(a, b, op) {
  return op(a, b);
}

// Import named exports
import { add, subtract } from './math.js';

// Import default
import calculate from './math.js';

// Import both
import calculate, { add, subtract } from './math.js';

// Import all as namespace
import * as math from './math.js';
console.log(math.add(1, 2)); // 3

// Rename imports
import { add as sum } from './math.js';
```

### CommonJS Syntax

```javascript
// math.js - CommonJS exports
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };

// Or individual exports
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Default export equivalent
module.exports = function calculate(a, b, op) {
  return op(a, b);
};

// Import
const { add, subtract } = require('./math.js');
const calculate = require('./math.js');
```

### Dynamic Imports

```javascript
// Static import - always loaded
import { heavy } from './heavy-module.js';

// Dynamic import - loaded on demand
async function loadModule() {
  const module = await import('./heavy-module.js');
  module.heavy();
}

// Conditional loading
if (condition) {
  const module = await import('./optional-module.js');
  module.doSomething();
}

// Code splitting in bundlers
button.addEventListener('click', async () => {
  const module = await import('./feature.js');
  module.initFeature();
});

// Error handling
try {
  const module = await import('./module.js');
  module.run();
} catch (error) {
  console.error('Failed to load module:', error);
}
```

### Module Patterns

```javascript
// Singleton pattern
// counter.js
let count = 0;

export function increment() {
  return ++count;
}

export function getCount() {
  return count;
}

// Every import gets same instance
import { increment, getCount } from './counter.js';
increment(); // 1
getCount(); // 1

// Factory pattern
// createLogger.js
export default function createLogger(name) {
  return {
    log(message) {
      console.log(`[${name}] ${message}`);
    }
  };
}

import createLogger from './createLogger.js';
const logger = createLogger('App');
logger.log('Started'); // [App] Started
```

### Common Pitfalls

```javascript
// Pitfall 1: Circular dependencies
// a.js
import { b } from './b.js';
export const a = 'a' + b;

// b.js
import { a } from './a.js';
export const b = 'b' + a; // ReferenceError!

// Fix: Restructure to avoid circular imports

// Pitfall 2: Named vs default confusion
// module.js
export default function myFunc() {}

// Wrong
import { myFunc } from './module.js'; // Error!

// Correct
import myFunc from './module.js';

// Pitfall 3: CommonJS in ESM
// Won't work in ES modules
const module = require('./module.js'); // SyntaxError

// Use dynamic import instead
const module = await import('./module.js');

// Pitfall 4: Side effects in modules
// config.js
console.log('Module loaded'); // Runs when imported!

// Runs every time module is imported
// But only once per application (cached)
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Problems Before Modules

**Early JavaScript (1995-2010)**
```html
<!-- All code in global scope -->
<script src="utils.js"></script>
<script src="app.js"></script>
<script>
  // utils.js and app.js share global scope
  // Name collisions likely
  // Load order matters
  // No dependency management
</script>
```

**Namespace Pattern**
```javascript
// Attempted solution
var MyApp = MyApp || {};
MyApp.utils = {
  add: function(a, b) { return a + b; }
};

// Still manual, error-prone
```

**IIFE Module Pattern**
```javascript
var MyModule = (function() {
  var privateVar = 'secret';
  
  return {
    publicMethod: function() {
      return privateVar;
    }
  };
})();

// Better, but still manual dependency management
```

### Why ES Modules?

1. **Static Analysis**: Bundlers can tree-shake unused code
2. **Explicit Dependencies**: Clear what module needs
3. **Scope Isolation**: No global pollution
4. **Standards**: Browser and Node.js convergence
5. **Async Loading**: Modules load asynchronously in browsers
6. **Circular Dependency Handling**: Better than CommonJS

### Why CommonJS?

1. **Synchronous**: Works with Node.js file system
2. **Dynamic**: Can conditionally require modules
3. **Simple**: Easy to understand and use
4. **Legacy**: Huge ecosystem of packages

### Evolution Timeline

- **2009**: CommonJS for Node.js
- **2011**: AMD (RequireJS) for browsers
- **2013**: UMD (Universal Module Definition)
- **2015**: ES6 modules standardized
- **2017**: Node.js experimental ESM support
- **2020**: Node.js stable ESM support
</details>

<details>
<summary>How it works</summary>
### ES Module Loading

```javascript
// 1. PARSING PHASE
// - Find all import/export statements
// - Build dependency graph
// - Imports are hoisted

// This works (imports hoisted)
console.log(add(1, 2));
import { add } from './math.js';

// 2. LOADING PHASE
// - Fetch all modules
// - Parse for imports
// - Recursive loading

// 3. LINKING PHASE
// - Connect exports to imports
// - Create live bindings

// 4. EXECUTION PHASE
// - Run module code
// - Execute in dependency order
```

### Live Bindings

```javascript
// counter.js
export let count = 0;

export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();
console.log(count); // 1 - Live binding updates!

// This is read-only
count++; // SyntaxError: "count" is read-only

// Compare with CommonJS (copy, not binding)
```

### CommonJS Loading

```javascript
// 1. SYNCHRONOUS LOADING
// - require() blocks until module loaded

const fs = require('fs');
const content = fs.readFileSync('file.txt');

// 2. RUNTIME EVALUATION
// - Can use dynamic paths

const moduleName = process.env.MODULE;
const module = require(`./${moduleName}`); // Works in CommonJS

// 3. CACHING
// - Modules cached after first require

// cache.js
console.log('Module loaded');
module.exports = { value: 42 };

// main.js
const cache1 = require('./cache'); // Logs: "Module loaded"
const cache2 = require('./cache'); // No log (cached)
console.log(cache1 === cache2); // true (same object)
```

### Module Resolution

```javascript
// 1. Relative imports
import { util } from './utils.js'; // Same directory
import { helper } from '../helpers.js'; // Parent directory

// 2. Absolute imports (with base URL)
import { config } from '/config.js'; // From root

// 3. Bare specifiers (Node.js/bundlers)
import React from 'react'; // node_modules/react

// Node.js resolution algorithm:
// 1. Check node_modules in current directory
// 2. Check node_modules in parent directory
// 3. Repeat up to file system root

// 4. File extensions (Node.js ESM)
import { util } from './utils.js'; // Must include .js
import { util } from './utils'; // Error in Node.js ESM
```

### Module Scope

```javascript
// Each module has own scope

// module1.js
let private = 'secret';
export let public = 'shared';

// module2.js
import { public } from './module1.js';
console.log(public); // 'shared'
console.log(private); // ReferenceError

// Modules use strict mode automatically
// No need for 'use strict'

// this is undefined in modules
console.log(this); // undefined (not window/global)
```

### Dynamic Import Mechanics

```javascript
// import() returns promise
const loadModule = async () => {
  // Promise-based
  const module = await import('./module.js');
  
  // module.default for default export
  // module.namedExport for named exports
};

// Webpack code splitting
// Creates separate bundle for this module
import(/* webpackChunkName: "feature" */ './feature.js')
  .then(module => {
    module.initFeature();
  });

// Import maps (browser)
<script type="importmap">
{
  "imports": {
    "lodash": "/node_modules/lodash-es/lodash.js",
    "react": "https://cdn.jsdelivr.net/npm/react/+esm"
  }
}
</script>

<script type="module">
import _ from 'lodash'; // Uses import map
</script>
```

### Tree Shaking

```javascript
// utils.js
export function used() {
  console.log('Used');
}

export function unused() {
  console.log('Unused');
}

// main.js
import { used } from './utils.js';
used();

// Bundler (webpack/rollup) removes unused():
// - Static analysis finds what's imported
// - Removes dead code
// - Reduces bundle size

// Only works with ES modules (static imports)
// CommonJS can't be tree-shaken (dynamic nature)
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Modules are just namespaces"

**Reality**: Modules provide scope isolation, not just organization

```javascript
// Namespace (still global)
var MyApp = MyApp || {};
MyApp.utils = {
  add: (a, b) => a + b
};

// Anyone can modify
MyApp.utils.add = () => 'broken';

// Module (truly private)
// utils.js
let privateCache = {};
export function add(a, b) {
  // privateCache not accessible outside
  return a + b;
}

// Can't modify from outside
```

### Misconception 2: "Default exports are better"

**Reality**: Named exports better for tree-shaking and refactoring

```javascript
// Default export - harder to tree-shake
// utils.js
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b // Unused
};

// main.js
import utils from './utils.js';
utils.add(1, 2);
// Bundler must include entire object (multiply too)

// Named exports - better tree-shaking
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// main.js
import { add } from './utils.js';
// Bundler can remove unused exports (subtract, multiply)
```

### Misconception 3: "import is like require"

**Reality**: Very different behaviors

```javascript
// CommonJS - dynamic, runtime
const path = condition ? './a.js' : './b.js';
const module = require(path); // Works

// ES modules - static, compile-time
const path = condition ? './a.js' : './b.js';
import module from path; // SyntaxError!

// Must use dynamic import
const module = await import(path); // Works

// Imports are hoisted
foo(); // Works
import { foo } from './module.js';

// Requires are not
foo(); // ReferenceError
const { foo } = require('./module.js');
```

### Misconception 4: "Modules run every time they're imported"

**Reality**: Modules are singletons, run once

```javascript
// counter.js
let count = 0;
console.log('Module initialized');

export function increment() {
  count++;
}

export function getCount() {
  return count;
}

// a.js
import { increment } from './counter.js'; // Logs once
increment();

// b.js
import { getCount } from './counter.js'; // Doesn't log again
console.log(getCount()); // 1 (shared state)
```

### Misconception 5: "Can mix CommonJS and ESM freely"

**Reality**: Interop has limitations

```javascript
// CommonJS can import ESM (Node.js)
const esmModule = await import('./esm-module.js');

// ESM can import CommonJS
import cjsModule from './cjs-module.js'; // Default export
// Named imports may not work as expected

// Best practice: Pick one system per project
// Or use build tools to transpile
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "Difference between CommonJS and ES Modules?"**

```javascript
// CommonJS
// - Synchronous loading
// - Dynamic (runtime)
// - require/module.exports
// - Node.js default (before ESM)

const module = require('./module');
const conditionalModule = condition ? 
  require('./a') : require('./b'); // Dynamic

// ES Modules
// - Asynchronous loading
// - Static (compile-time)
// - import/export
// - Browser native, Node.js supported

import { func } from './module.js';
// Can't do conditional static import
import module from condition ? './a' : './b'; // Error

// Key differences:
// 1. ESM is statically analyzable (tree-shaking)
// 2. ESM has live bindings, CommonJS copies
// 3. ESM is async, CommonJS is sync
// 4. ESM strict mode by default
```

**Q2: "What are live bindings in ES modules?"**

```javascript
// counter.js
export let count = 0;

export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();
console.log(count); // 1 - Updated! Live binding

// This is read-only in importer
count = 5; // SyntaxError

// CommonJS doesn't have live bindings
// counter.js (CommonJS)
let count = 0;
exports.count = count;
exports.increment = () => {
  count++;
  exports.count = count; // Must manually update
};

// main.js
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // Still 0! Not live
```

**Q3: "When to use named vs default exports?"**

```javascript
// Use named exports when:
// 1. Multiple exports
// 2. Tree-shaking important
// 3. Want consistent naming

// utils.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// Consistent import name
import { add } from './utils.js';

// Use default export when:
// 1. Single purpose module
// 2. Main/primary export
// 3. Component/class modules

// Button.js
export default function Button() {
  return <button>Click me</button>;
}

// Can name anything
import MyButton from './Button.js';
import Btn from './Button.js';

// Best practice: Don't mix default and named exports
// Makes API confusing
```

**Q4: "Explain circular dependencies"**

```javascript
// Problematic circular dependency
// a.js
import { b } from './b.js';
export const a = 'A depends on ' + b;

// b.js
import { a } from './a.js';
export const b = 'B depends on ' + a; // ReferenceError!

// Why it breaks:
// 1. a.js starts loading
// 2. Encounters import from b.js
// 3. b.js starts loading
// 4. Encounters import from a.js
// 5. a.js not finished yet - 'a' is undefined

// Solution 1: Restructure
// Extract shared code to third module

// common.js
export const shared = 'shared';

// a.js
import { shared } from './common.js';
export const a = 'A uses ' + shared;

// b.js
import { shared } from './common.js';
export const b = 'B uses ' + shared;

// Solution 2: Use functions (lazy evaluation)
// a.js
import { getB } from './b.js';
export function getA() {
  return 'A depends on ' + getB();
}

// b.js
import { getA } from './a.js';
export function getB() {
  return 'B depends on ' + getA();
}

// Functions executed after both modules loaded
```

**Q5: "How do dynamic imports work?"**

```javascript
// Dynamic import returns promise
async function loadModule() {
  try {
    // import() is a function-like operator
    const module = await import('./module.js');
    
    // Access default export
    const defaultExport = module.default;
    
    // Access named exports
    const { namedExport } = module;
    
    return module;
  } catch (error) {
    console.error('Failed to load:', error);
  }
}

// Use cases:

// 1. Code splitting
button.addEventListener('click', async () => {
  const { feature } = await import('./feature.js');
  feature.init();
});

// 2. Conditional loading
if (isAdmin) {
  const admin = await import('./admin-panel.js');
  admin.show();
}

// 3. Computed module paths
const locale = navigator.language;
const translations = await import(`./i18n/${locale}.js`);

// 4. Lazy loading routes (React)
const About = lazy(() => import('./About'));
```

### Advanced Interview Questions

**Q6: "Implement module caching"**

```javascript
// Simple module cache
class ModuleCache {
  constructor() {
    this.cache = new Map();
  }
  
  async load(path) {
    // Check cache
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    // Load module
    const module = await import(path);
    
    // Cache for future
    this.cache.set(path, module);
    
    return module;
  }
  
  clear(path) {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
  }
}

// Usage
const cache = new ModuleCache();
const module = await cache.load('./module.js'); // Loads
const module2 = await cache.load('./module.js'); // From cache
```

**Q7: "Module pattern for private members"**

```javascript
// Before ES modules
const Counter = (function() {
  // Private
  let count = 0;
  
  // Public API
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
})();

// With ES modules
// counter.js
let count = 0; // Private to module

export function increment() {
  return ++count;
}

export function decrement() {
  return --count;
}

export function getCount() {
  return count;
}

// With WeakMap (for instances)
const privateData = new WeakMap();

export class Counter {
  constructor() {
    privateData.set(this, { count: 0 });
  }
  
  increment() {
    const data = privateData.get(this);
    return ++data.count;
  }
  
  getCount() {
    return privateData.get(this).count;
  }
}
```

### Pro Tips for Interviews

1. **Know static vs dynamic**: ESM static, CommonJS dynamic
2. **Explain tree-shaking**: Why ESM enables it
3. **Live bindings**: Key ESM feature vs CommonJS
4. **Circular deps**: How to detect and fix
5. **Dynamic imports**: Code splitting, lazy loading
6. **Module resolution**: How Node.js finds modules
7. **Practical experience**: Mention webpack, Rollup, Vite
</details>
