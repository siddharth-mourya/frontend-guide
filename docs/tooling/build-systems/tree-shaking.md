# Tree Shaking

## Overview
Tree shaking is **dead code elimination** that removes unused exports from your JavaScript bundle. It's a critical optimization technique for reducing bundle size.

---

## What is Tree Shaking?

### Definition
**Static analysis** of ES modules to eliminate code that is exported but never imported or used.

### Origin
The term comes from shaking a tree to make dead leaves fall off. Similarly, tree shaking removes "dead code" from your bundle.

### Example

```javascript
// math.js (library)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => a / b;
export const power = (a, b) => Math.pow(a, b);

// app.js (your code)
import { add } from './math.js';
console.log(add(2, 3));

// Final bundle (after tree shaking)
// Only 'add' is included, other functions are eliminated
const add = (a, b) => a + b;
console.log(add(2, 3));
```

### Size Impact

**Without tree shaking:**
```javascript
// Bundle includes everything
const math = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  power: (a, b) => Math.pow(a, b)
};
// Bundle size: ~500 bytes
```

**With tree shaking:**
```javascript
// Bundle includes only used code
const add = (a, b) => a + b;
// Bundle size: ~50 bytes (90% reduction!)
```

---

## Requirements for Tree Shaking

### 1. ES Modules (ESM)

Tree shaking **only works with ES modules**, not CommonJS.

#### ✅ Tree-shakeable (ESM)
```javascript
// Named exports
export const foo = 'foo';
export const bar = 'bar';

// Import specific exports
import { foo } from './module';
```

#### ❌ Not tree-shakeable (CommonJS)
```javascript
// CommonJS exports
module.exports = {
  foo: 'foo',
  bar: 'bar'
};

// CommonJS require
const { foo } = require('./module');
// Still bundles entire object!
```

**Why?** 
- ESM imports are **static** - analyzable at build time
- CommonJS requires are **dynamic** - only known at runtime

```javascript
// Static - bundler knows exactly what's imported
import { foo } from './module';

// Dynamic - bundler can't determine what's used
const module = require('./module');
const key = Math.random() > 0.5 ? 'foo' : 'bar';
console.log(module[key]); // Could be anything!
```

### 2. Production Mode

Enable production mode for tree shaking:

#### Webpack
```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // Enables tree shaking + minification
  optimization: {
    usedExports: true, // Mark unused exports
    minimize: true // Remove marked code
  }
};
```

#### Rollup
```javascript
// Tree shaking enabled by default in production
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  }
};
```

#### Vite
```javascript
// Tree shaking automatic in production builds
export default {
  build: {
    minify: 'terser' // or 'esbuild'
  }
};
```

### 3. Side Effect Free Code

Mark your code as side-effect free:

#### package.json
```json
{
  "name": "my-library",
  "sideEffects": false
}
```

**With specific files:**
```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

#### What are side effects?
Code that affects external state when imported:

```javascript
// ❌ Has side effects
import './styles.css'; // Modifies DOM
import './polyfills.js'; // Modifies globals
console.log('Module loaded'); // Logs on import

// ✅ No side effects (pure)
export const add = (a, b) => a + b;
export class Calculator {}
```

---

## How Tree Shaking Works

### Step 1: Mark Used Exports

Bundler analyzes code and marks which exports are used:

```javascript
// library.js
export const used = () => 'used';
export const unused = () => 'unused';

// app.js
import { used } from './library';
used();

// Webpack marks:
// ✓ used (marked as used)
// ✗ unused (marked as unused)
```

### Step 2: Dead Code Elimination

Minifier removes unmarked code:

```javascript
// Before minification
const used = () => 'used';
const unused = () => 'unused'; // Will be removed

// After minification
const used = () => 'used';
```

### Step 3: Scope Hoisting

Webpack concatenates modules for better optimization:

```javascript
// Before scope hoisting
// module1.js
export const foo = 'foo';
// module2.js
import { foo } from './module1';
export const bar = foo + 'bar';

// After scope hoisting (concatenated)
const foo = 'foo';
const bar = foo + 'bar';
// Smaller, faster
```

---

## Common Pitfalls

### 1. Default Exports

Default exports can hinder tree shaking:

#### ❌ Harder to tree shake
```javascript
// utils.js
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

// app.js
import utils from './utils';
utils.add(1, 2);
// Entire object bundled!
```

#### ✅ Better for tree shaking
```javascript
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// app.js
import { add } from './utils';
add(1, 2);
// Only 'add' bundled
```

### 2. Side Effects in Modules

```javascript
// ❌ Side effect prevents tree shaking
export const logger = {
  log: (msg) => console.log(msg)
};

// Side effect! Runs on import
console.log('Logger initialized');
```

```javascript
// ✅ No side effects
export const logger = {
  log: (msg) => console.log(msg)
};
// Pure export, tree-shakeable
```

### 3. Namespace Imports

```javascript
// ❌ Imports everything
import * as utils from './utils';
utils.add(1, 2);
// All exports bundled!

// ✅ Import only what you need
import { add } from './utils';
add(1, 2);
// Only 'add' bundled
```

### 4. CommonJS Mixed with ESM

```javascript
// ❌ Breaks tree shaking
import lodash from 'lodash'; // CommonJS package
// Entire lodash bundled (~70KB)

// ✅ Use ESM version
import debounce from 'lodash-es/debounce';
// Only debounce bundled (~2KB)

// ✅ Or use individual packages
import debounce from 'lodash.debounce';
```

### 5. Barrel Exports

Barrel files can hurt tree shaking:

#### ❌ Problematic barrel
```javascript
// components/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
// ... 50 more components

// app.js
import { Button } from './components';
// May bundle more than just Button if bundler can't analyze
```

#### ✅ Direct imports
```javascript
// app.js
import { Button } from './components/Button';
// Only Button bundled
```

**Better barrel approach:**
```javascript
// components/index.js
export { Button } from './Button';
export { Input } from './Input';

// With sideEffects: false in package.json
// app.js
import { Button } from './components';
// Only Button bundled if configured correctly
```

### 6. Class Side Effects

```javascript
// ❌ Class with side effects
export class Analytics {
  constructor() {
    // Side effect in constructor
    window.analytics = this;
  }
  
  track(event) {}
}

// Even if unused, might not be tree-shaken
```

```javascript
// ✅ Pure class
export class Analytics {
  track(event) {}
}

// Side effect separate from class
export function initAnalytics() {
  window.analytics = new Analytics();
}
```

---

## Library-Specific Considerations

### Lodash

#### ❌ Wrong way
```javascript
import _ from 'lodash'; // Bundles all ~70KB

import { debounce } from 'lodash'; // Still bundles everything!
```

#### ✅ Right way
```javascript
// Option 1: lodash-es (ESM version)
import debounce from 'lodash-es/debounce';

// Option 2: Individual packages
import debounce from 'lodash.debounce';

// Option 3: Babel plugin
// babel-plugin-lodash transforms imports automatically
import { debounce } from 'lodash';
// Becomes: import debounce from 'lodash/debounce';
```

### Moment.js

#### ❌ Not tree-shakeable
```javascript
import moment from 'moment';
// Bundles all locales (~160KB)
```

#### ✅ Alternatives
```javascript
// Use date-fns (tree-shakeable)
import { format, addDays } from 'date-fns';

// Or Day.js (smaller alternative)
import dayjs from 'dayjs';
```

### Material-UI / MUI

#### ❌ Wrong way
```javascript
import { Button, TextField } from '@mui/material';
// Bundles entire library
```

#### ✅ Right way
```javascript
// Direct imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Or use babel plugin
// babel-plugin-import
```

### React Icons

#### ❌ Not optimized
```javascript
import { FaBeer } from 'react-icons/fa';
// May bundle multiple icon sets
```

#### ✅ Optimized
```javascript
import { FaBeer } from 'react-icons/fa/FaBeer';
// Or individual package
import FaBeer from 'react-icons/fa/FaBeer';
```

---

## Webpack Configuration

### Basic Setup

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  
  optimization: {
    // Mark unused exports
    usedExports: true,
    
    // Enable tree shaking
    minimize: true,
    
    // Concatenate modules
    concatenateModules: true,
    
    // Deterministic module IDs
    moduleIds: 'deterministic',
    
    // Split chunks
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

### Analyzing Tree Shaking

```javascript
// Install webpack-bundle-analyzer
npm install webpack-bundle-analyzer --save-dev

// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true
    })
  ]
};
```

### Advanced Configuration

```javascript
module.exports = {
  optimization: {
    usedExports: true,
    
    // Minimize with Terser
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            dead_code: true,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.info', 'console.debug']
          },
          mangle: true
        }
      })
    ],
    
    // Side effects optimization
    sideEffects: true
  }
};
```

---

## Rollup Configuration

Rollup has excellent tree shaking by default:

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    commonjs(), // Convert CJS to ESM
    terser() // Minify and remove dead code
  ],
  
  // Tree shake even side-effect modules
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  }
};
```

### Aggressive Tree Shaking

```javascript
export default {
  treeshake: {
    // Assume module has no side effects
    moduleSideEffects: false,
    
    // Assume property access has no side effects
    propertyReadSideEffects: false,
    
    // Remove unused external imports
    tryCatchDeoptimization: false,
    
    // More aggressive unknown value tracking
    unknownGlobalSideEffects: false
  }
};
```

---

## Testing Tree Shaking

### Method 1: Bundle Analysis

```bash
# Webpack
npm install webpack-bundle-analyzer --save-dev
npx webpack --mode production --analyze

# Rollup
npm install rollup-plugin-visualizer --save-dev

# Vite
npx vite build --mode production
npx vite-bundle-visualizer
```

### Method 2: Manual Inspection

```javascript
// Create test file
// test-treeshake.js
import { used } from './library';
used();

// Build and check output
npx webpack --mode production

// Check if unused exports are in bundle
grep -r "unused" dist/
```

### Method 3: Size Comparison

```bash
# Before
npm run build
du -h dist/bundle.js

# After optimization
# Should be smaller
```

---

## Best Practices

### 1. Use Named Exports

```javascript
// ✅ Preferred
export const foo = 'foo';
export const bar = 'bar';

// ❌ Avoid
export default { foo: 'foo', bar: 'bar' };
```

### 2. Mark Side Effects

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 3. Avoid Dynamic Imports in Statements

```javascript
// ❌ Can't be analyzed
const module = condition ? require('./a') : require('./b');

// ✅ Can be tree-shaken
import { foo } from './module';
```

### 4. Use ESM Versions of Libraries

```javascript
// ✅ ESM version
import debounce from 'lodash-es/debounce';

// ❌ CommonJS version
import debounce from 'lodash/debounce';
```

### 5. Write Pure Functions

```javascript
// ✅ Pure function (tree-shakeable)
export const add = (a, b) => a + b;

// ❌ Function with side effects
export const log = (msg) => {
  console.log(msg); // Side effect
  return msg;
};
```

### 6. Split Large Objects

```javascript
// ❌ Large default export
export default {
  utility1: () => {},
  utility2: () => {},
  // ... 100 more utilities
};

// ✅ Individual exports
export const utility1 = () => {};
export const utility2 = () => {};
```

### 7. Use Babel Plugin for Large Libraries

```javascript
// .babelrc
{
  "plugins": [
    ["babel-plugin-import", {
      "libraryName": "antd",
      "style": true
    }]
  ]
}

// Transforms
import { Button } from 'antd';
// Into
import Button from 'antd/lib/button';
```

---

## Common Interview Questions

### Q: What is tree shaking and how does it work?

**Answer:**

Tree shaking is **dead code elimination** that removes unused exports from bundles.

**How it works:**
1. **Static analysis** - Bundler analyzes import/export statements
2. **Mark phase** - Marks which exports are used
3. **Sweep phase** - Minifier removes unmarked code

**Requirements:**
- ES modules (not CommonJS)
- Production mode
- `sideEffects: false` in package.json

**Example:**
```javascript
// Library exports 5 functions
export const a, b, c, d, e;

// You import only one
import { a } from './lib';

// Bundle includes only 'a'
// b, c, d, e are tree-shaken
```

### Q: Why doesn't tree shaking work with CommonJS?

**Answer:**

**CommonJS is dynamic**, analysis only possible at runtime:

```javascript
// Dynamic property access
const lib = require('./lib');
const key = userInput; // Unknown at build time
lib[key](); // Could be any export!

// Conditional requires
if (condition) {
  require('./moduleA');
} else {
  require('./moduleB');
}
```

**ESM is static**, fully analyzable at build time:

```javascript
// Static imports - known at build time
import { foo } from './lib';
foo(); // Bundler knows exactly what's used
```

### Q: What are side effects in the context of tree shaking?

**Answer:**

**Side effects** are code that affects external state when imported:

**Examples with side effects:**
```javascript
// 1. Modifying globals
window.myLib = {};

// 2. Running code on import
console.log('Module loaded');

// 3. Modifying prototypes
Array.prototype.myMethod = function() {};

// 4. CSS imports
import './styles.css';
```

**Pure (no side effects):**
```javascript
// Only exports functions/classes
export const add = (a, b) => a + b;
export class Calculator {}
```

**Configuration:**
```json
{
  "sideEffects": false, // No side effects, safe to tree shake
  
  // Or list files with side effects
  "sideEffects": ["*.css", "./polyfills.js"]
}
```

### Q: How do you debug tree shaking issues?

**Answer:**

**1. Check webpack stats:**
```javascript
// webpack.config.js
optimization: {
  usedExports: true,
  providedExports: true
}

// Run with stats
npx webpack --mode production --json > stats.json

// Analyze
npx webpack-bundle-analyzer stats.json
```

**2. Verify ES modules:**
```javascript
// Check if using ES modules
// Look for import/export, not require/module.exports
```

**3. Check package.json:**
```json
{
  "sideEffects": false,
  "module": "dist/index.esm.js" // ESM entry point
}
```

**4. Build in production mode:**
```javascript
// Tree shaking only works in production
mode: 'production'
```

**5. Test with simple example:**
```javascript
// Create minimal test case
export const used = () => 'used';
export const unused = () => 'unused';

import { used } from './test';
used();

// Build and verify unused is removed
```

### Q: What is the difference between tree shaking and code splitting?

**Answer:**

**Tree Shaking:**
- **Removes unused code** from bundles
- Works on **export level** (functions, classes)
- Reduces size of **individual bundles**
- Happens during **build time**

```javascript
// Remove unused exports
import { used } from './lib'; // Only 'used' bundled
```

**Code Splitting:**
- **Splits code into separate chunks**
- Works on **module level** (entire files)
- Creates **multiple bundles** loaded on-demand
- Can happen **at runtime**

```javascript
// Split into separate chunk
const module = await import('./heavy-module');
```

**Both techniques:**
- Improve performance
- Reduce bundle size
- Often used together

### Q: How do you make a library tree-shakeable?

**Answer:**

**1. Use ES modules:**
```javascript
// Export named exports
export const foo = 'foo';
export const bar = 'bar';

// Not default export of object
// export default { foo, bar }; // ❌
```

**2. Configure package.json:**
```json
{
  "main": "dist/index.cjs.js",  // CommonJS
  "module": "dist/index.esm.js", // ES modules (for bundlers)
  "sideEffects": false
}
```

**3. Build with Rollup:**
```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' }
  ]
};
```

**4. Avoid side effects:**
```javascript
// ❌ Has side effects
export const lib = {};
console.log('Lib initialized');

// ✅ Pure exports
export const lib = {};
```

**5. Use individual files:**
```javascript
// Allow importing individual functions
// lodash-es/debounce.js
export default function debounce() {}
```

---

## Real-World Examples

### Example 1: Optimizing Lodash

```javascript
// Before (250KB)
import _ from 'lodash';
_.debounce(fn, 300);

// After (5KB)
import debounce from 'lodash-es/debounce';
debounce(fn, 300);

// Savings: 98% reduction!
```

### Example 2: Material-UI

```javascript
// Before (500KB)
import { Button, TextField, Select } from '@mui/material';

// After (50KB)
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';

// Savings: 90% reduction!
```

### Example 3: Custom Library

```javascript
// utils/index.js
export * from './array';
export * from './object';
export * from './string';
export * from './number';

// app.js - Only imports what's needed
import { debounce } from './utils';

// With sideEffects: false
// Only array.js bundled, rest tree-shaken
```

---

## Summary

### Key Takeaways

1. **ESM required** - Tree shaking only works with ES modules
2. **Production mode** - Enable usedExports and minimize
3. **sideEffects: false** - Mark pure modules
4. **Named exports** - Better than default exports
5. **Avoid CommonJS** - Use ESM versions of libraries
6. **Test** - Use bundle analyzers to verify

### Checklist for Tree Shaking

- [ ] Using ES modules (import/export)
- [ ] Production mode enabled
- [ ] `sideEffects` configured in package.json
- [ ] Using named exports (not default export objects)
- [ ] ESM versions of third-party libraries
- [ ] No dynamic requires or imports
- [ ] Bundle analyzer to verify
- [ ] Pure functions without side effects
