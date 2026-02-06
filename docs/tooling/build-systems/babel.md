# Babel

## Overview
Babel is a **JavaScript transpiler** that converts modern JavaScript (ES6+) into backwards-compatible versions for older browsers and environments. It's the industry standard for JavaScript transformation.

---

## Core Concepts

### What is Transpilation?
**Source-to-source compilation** that transforms code from one version of JavaScript to another.

```javascript
// Input (ES6+)
const greet = (name = 'World') => `Hello, ${name}!`;
class Person {
  #privateField = 'secret';
}

// Output (ES5)
var greet = function greet(name) {
  if (name === void 0) name = 'World';
  return "Hello, " + name + "!";
};
var Person = function Person() {
  _classPrivateFieldInitSpec(this, _privateField, {
    writable: true,
    value: 'secret'
  });
};
```

### Why Babel?
1. **Use latest JavaScript features** today
2. **Browser compatibility** - Support older browsers
3. **Experimental features** - Test TC39 proposals
4. **Custom transformations** - Write your own plugins
5. **JSX support** - Transform React JSX
6. **TypeScript** - Can transpile TypeScript (though tsc is preferred)

---

## Configuration

### babel.config.js (Project-wide)
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'ie >= 11']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      helpers: true,
      regenerator: true
    }]
  ],
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    production: {
      plugins: ['transform-remove-console']
    },
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    }
  }
};
```

### .babelrc (File-specific)
```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-proposal-optional-chaining"]
}
```

### Package.json
```json
{
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

---

## Presets

### What are Presets?
**Collections of plugins** grouped together for common use cases. Instead of configuring dozens of plugins individually, use presets.

### @babel/preset-env

**Smart preset** that automatically determines which transformations and polyfills you need based on target environments.

```javascript
{
  presets: [
    ['@babel/preset-env', {
      // Target environments
      targets: {
        browsers: ['last 2 versions', 'safari >= 7'],
        node: 'current',
        esmodules: true
      },
      
      // Polyfill strategy
      useBuiltIns: 'usage', // 'entry' | 'usage' | false
      corejs: 3,
      
      // Module transformation
      modules: 'auto', // 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false
      
      // Loose mode (smaller output, less spec-compliant)
      loose: false,
      
      // Debugging
      debug: true
    }]
  ]
}
```

#### useBuiltIns Options

**false** (default) - No polyfills:
```javascript
// Only syntax transforms, no polyfills added
```

**entry** - Import all polyfills:
```javascript
// In your entry file
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Babel replaces with only needed polyfills
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.promise';
// ... only what your targets need
```

**usage** - Import polyfills automatically:
```javascript
// Your code
const result = [1, 2, 3].includes(2);
Promise.resolve();

// Babel automatically adds
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.promise';
```

### @babel/preset-react

Transforms **JSX and React-specific syntax**:

```javascript
{
  presets: [
    ['@babel/preset-react', {
      // React 17+ automatic runtime (no need to import React)
      runtime: 'automatic', // 'classic' | 'automatic'
      
      // Development mode (better error messages)
      development: process.env.NODE_ENV === 'development',
      
      // Custom pragma (for Preact, etc.)
      pragma: 'h', // default: 'React.createElement'
      pragmaFrag: 'Fragment',
      
      // Enable Flow syntax
      flow: false
    }]
  ]
}
```

**Automatic runtime (React 17+):**
```javascript
// Input
function App() {
  return <div>Hello</div>;
}

// Output (automatic runtime)
import { jsx as _jsx } from 'react/jsx-runtime';
function App() {
  return _jsx('div', { children: 'Hello' });
}

// Output (classic runtime)
import React from 'react';
function App() {
  return React.createElement('div', null, 'Hello');
}
```

### @babel/preset-typescript

**Strips TypeScript types** without type checking:

```javascript
{
  presets: [
    ['@babel/preset-typescript', {
      // Allow JSX in .ts files
      isTSX: true,
      allExtensions: true,
      
      // Enable decorators
      allowDeclareFields: true,
      
      // Only remove types (don't transform)
      onlyRemoveTypeImports: true
    }]
  ]
}
```

**Important:** Babel only removes types, doesn't check them. Use `tsc --noEmit` for type checking.

### Custom Preset

```javascript
// my-preset.js
module.exports = () => ({
  presets: [
    require('@babel/preset-env'),
    require('@babel/preset-react')
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties'),
    [require('@babel/plugin-transform-runtime'), { corejs: 3 }]
  ]
});

// Usage
{
  presets: ['./my-preset.js']
}
```

---

## Plugins

### Plugin Order
Plugins run **before presets**:
1. Plugins run in order (first to last)
2. Presets run in reverse order (last to first)

```javascript
{
  plugins: ['plugin-1', 'plugin-2'], // Runs: plugin-1 → plugin-2
  presets: ['preset-1', 'preset-2']  // Runs: preset-2 → preset-1
}
```

### Popular Plugins

#### @babel/plugin-transform-runtime

**Avoids duplication** of helper functions and polyfills:

```javascript
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      // Add polyfills
      corejs: 3, // false | 2 | 3
      
      // Extract Babel helpers
      helpers: true,
      
      // Transform async/await
      regenerator: true,
      
      // Use ESM version
      useESModules: true
    }]
  ]
}
```

**Without plugin:**
```javascript
// Helper duplicated in every file
function _classCallCheck(instance, Constructor) {
  // ...
}
class Person {}

// Another file
function _classCallCheck(instance, Constructor) {
  // Same helper duplicated!
}
class Animal {}
```

**With plugin:**
```javascript
// Helper imported from runtime
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
class Person {}

// Another file - reuses same helper
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
class Animal {}
```

#### Class Properties

```javascript
// Install
npm install @babel/plugin-proposal-class-properties

// Configure
{
  plugins: [
    ['@babel/plugin-proposal-class-properties', {
      loose: false // true = assignment, false = defineProperty
    }]
  ]
}

// Input
class Counter {
  count = 0;
  #privateCount = 0;
  
  increment = () => {
    this.count++;
  }
}

// Output (loose: false)
class Counter {
  constructor() {
    _defineProperty(this, "count", 0);
    _defineProperty(this, "increment", () => {
      this.count++;
    });
  }
}
```

#### Optional Chaining & Nullish Coalescing

```javascript
{
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
}

// Input
const value = obj?.nested?.value;
const config = userConfig ?? defaultConfig;

// Output
var _obj, _obj$nested;
const value = (_obj = obj) === null || _obj === void 0 
  ? void 0 
  : (_obj$nested = _obj.nested) === null || _obj$nested === void 0 
  ? void 0 
  : _obj$nested.value;
  
const config = userConfig !== null && userConfig !== void 0 
  ? userConfig 
  : defaultConfig;
```

#### Decorators

```javascript
{
  plugins: [
    ['@babel/plugin-proposal-decorators', {
      version: '2023-05', // Use latest decorators proposal
      decoratorsBeforeExport: true
    }]
  ]
}

// Input
@sealed
class Person {
  @readonly
  name = 'John';
  
  @log
  greet() {
    return `Hello, ${this.name}`;
  }
}
```

#### Dynamic Import

```javascript
{
  plugins: ['@babel/plugin-syntax-dynamic-import']
}

// Input
const module = await import('./module.js');

// Code splitting with React
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

#### Remove Console

```javascript
{
  plugins: ['babel-plugin-transform-remove-console']
}

// Or selective removal
{
  plugins: [
    ['babel-plugin-transform-remove-console', {
      exclude: ['error', 'warn']
    }]
  ]
}
```

### Writing Custom Plugins

#### Simple Plugin
```javascript
// babel-plugin-remove-debugger.js
module.exports = function() {
  return {
    name: 'remove-debugger',
    visitor: {
      DebuggerStatement(path) {
        path.remove();
      }
    }
  };
};
```

#### Plugin with Options
```javascript
module.exports = function({ types: t }) {
  return {
    name: 'transform-console',
    visitor: {
      CallExpression(path, state) {
        const callee = path.node.callee;
        
        // Check if console.log
        if (
          t.isMemberExpression(callee) &&
          callee.object.name === 'console' &&
          callee.property.name === 'log'
        ) {
          const { prefix } = state.opts;
          
          // Add prefix to console.log
          if (prefix) {
            const args = path.node.arguments;
            args.unshift(t.stringLiteral(`[${prefix}]`));
          }
        }
      }
    }
  };
};

// Usage
{
  plugins: [
    ['./babel-plugin-transform-console', { prefix: 'DEBUG' }]
  ]
}

// Input:  console.log('Hello');
// Output: console.log('[DEBUG]', 'Hello');
```

#### Advanced Plugin - Import Transformer
```javascript
module.exports = function({ types: t }) {
  return {
    name: 'transform-imports',
    visitor: {
      ImportDeclaration(path, state) {
        const source = path.node.source.value;
        const { libraryName, libraryDirectory = 'lib' } = state.opts;
        
        if (source === libraryName) {
          const specifiers = path.node.specifiers;
          
          specifiers.forEach(spec => {
            if (t.isImportSpecifier(spec)) {
              const importName = spec.imported.name;
              const localName = spec.local.name;
              
              // Create new import
              const newImport = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(localName))],
                t.stringLiteral(`${libraryName}/${libraryDirectory}/${importName}`)
              );
              
              path.insertAfter(newImport);
            }
          });
          
          path.remove();
        }
      }
    }
  };
};

// Usage
{
  plugins: [
    ['./transform-imports', {
      libraryName: 'lodash',
      libraryDirectory: 'lib'
    }]
  ]
}

// Input:  import { debounce, throttle } from 'lodash';
// Output: import debounce from 'lodash/lib/debounce';
//         import throttle from 'lodash/lib/throttle';
```

---

## Polyfills

### What are Polyfills?
**Runtime code** that implements features missing in older environments.

### Core-js

**Most popular polyfill library:**

```bash
npm install core-js@3
```

#### Manual Import
```javascript
// Import all polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Or specific polyfills
import 'core-js/features/array/includes';
import 'core-js/features/promise';
import 'core-js/features/object/assign';
```

#### Automatic with preset-env
```javascript
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
}

// Babel automatically adds needed polyfills
```

### Polyfill vs Transform

**Transform** - Syntax conversion:
```javascript
// Arrow function (transform)
const add = (a, b) => a + b;
// Becomes
var add = function(a, b) { return a + b; };
```

**Polyfill** - Runtime implementation:
```javascript
// Array.includes (polyfill needed)
[1, 2, 3].includes(2);

// Requires runtime code:
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    // Implementation
  };
}
```

---

## Integration

### With Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // Cache transforms
            cacheCompression: false,
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  }
};
```

### With Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@babel/plugin-proposal-decorators']
      }
    })
  ]
});
```

### With Rollup

```javascript
// rollup.config.js
import babel from '@rollup/plugin-babel';

export default {
  plugins: [
    babel({
      babelHelpers: 'runtime', // 'bundled' | 'runtime' | 'inline'
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    })
  ]
};
```

### With Jest

```javascript
// jest.config.js
module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }]
  }
};
```

### CLI Usage

```bash
# Transform file
npx babel src/app.js -o dist/app.js

# Transform directory
npx babel src --out-dir dist

# Watch mode
npx babel src --watch --out-dir dist

# Source maps
npx babel src --source-maps --out-dir dist

# Using config file
npx babel src --out-dir dist --config-file ./babel.config.js
```

---

## Performance Optimization

### 1. Caching

```javascript
// babel-loader with cache
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false // Faster in dev
  }
}
```

### 2. Exclude node_modules

```javascript
{
  exclude: /node_modules/,
  // Or include specific modules that need transpilation
  exclude: /node_modules\/(?!(package-to-transpile)\/).*/
}
```

### 3. Use Loose Mode

```javascript
{
  presets: [
    ['@babel/preset-env', {
      loose: true // Smaller output, slightly less spec-compliant
    }]
  ]
}
```

### 4. Target Modern Browsers

```javascript
{
  presets: [
    ['@babel/preset-env', {
      targets: {
        esmodules: true // Only modern browsers with ESM support
      }
    }]
  ]
}
```

### 5. babel-loader with thread-loader

```javascript
{
  test: /\.js$/,
  use: ['thread-loader', 'babel-loader']
}
```

---

## Common Interview Questions

### Q: What is the difference between Babel and TypeScript compiler?

**Answer:**

| Feature | Babel | TypeScript Compiler (tsc) |
|---------|-------|---------------------------|
| Type checking | ❌ No | ✅ Yes |
| Transpilation | ✅ Fast | ✅ Slower |
| Polyfills | ✅ Yes | ❌ No |
| Latest features | ✅ Experimental | ⚠️ Only finalized |
| Plugin system | ✅ Extensive | ❌ Limited |

**Best practice:** Use both!
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "babel src --out-dir dist",
    "prebuild": "npm run type-check"
  }
}
```

### Q: Explain useBuiltIns options in @babel/preset-env

**Answer:**

**false** - No polyfills, only syntax transforms
```javascript
// No polyfills added, smallest bundle
// Must manually include polyfills if needed
```

**entry** - Import polyfills based on targets
```javascript
// Entry file
import 'core-js/stable';

// Babel replaces with only needed polyfills for your targets
import 'core-js/modules/es.array.includes'; // Only if IE11 in targets
```

**usage** - Automatic polyfills based on code usage
```javascript
// Your code
const hasTwo = [1, 2, 3].includes(2);

// Babel adds polyfill if needed for targets
import 'core-js/modules/es.array.includes';
```

**Best choice:** `usage` for optimal bundle size

### Q: What is @babel/plugin-transform-runtime and why use it?

**Answer:**

**Problem:** Babel helpers duplicated in every file
```javascript
// File 1
function _classCallCheck() { /* ... */ }
class Foo {}

// File 2
function _classCallCheck() { /* ... */ } // Duplicated!
class Bar {}
```

**Solution:** Extract helpers to shared module
```javascript
// Both files import
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
```

**Additional benefits:**
1. **No global pollution** - Sandboxed polyfills
2. **Smaller bundle** - Shared helpers
3. **Library-friendly** - Won't affect global scope

**Configuration:**
```javascript
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,        // Include polyfills
      helpers: true,    // Extract helpers
      regenerator: true // Transform async/await
    }]
  ]
}
```

### Q: How does Babel handle async/await?

**Answer:**

Babel transforms async/await into **generator functions** using regenerator-runtime:

```javascript
// Input
async function fetchData() {
  const response = await fetch('/api');
  return response.json();
}

// Output (simplified)
function fetchData() {
  return _asyncToGenerator(function* () {
    const response = yield fetch('/api');
    return response.json();
  })();
}
```

**Requires:**
1. `regenerator-runtime` polyfill
2. `@babel/plugin-transform-runtime` or preset-env
3. Browsers must support generators or further transpilation

### Q: What is the difference between preset and plugin?

**Answer:**

**Plugin:**
- Single transformation
- Granular control
- Example: `@babel/plugin-proposal-optional-chaining`

**Preset:**
- Collection of plugins
- Convenience grouping
- Example: `@babel/preset-env` includes 50+ plugins

```javascript
// Instead of this
{
  plugins: [
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-destructuring',
    // ... 50+ more plugins
  ]
}

// Use this
{
  presets: ['@babel/preset-env']
}
```

### Q: How do you debug Babel transformations?

**Answer:**

**1. Enable debug mode:**
```javascript
{
  presets: [
    ['@babel/preset-env', {
      debug: true // Shows which plugins/polyfills are used
    }]
  ]
}
```

**2. Use Babel REPL:**
- Visit [babeljs.io/repl](https://babeljs.io/repl)
- Test transformations interactively

**3. Output to file:**
```bash
npx babel src/app.js -o output.js
```

**4. Check AST:**
```javascript
const babel = require('@babel/core');
const result = babel.transformSync(code);
console.log(result.code);
console.log(result.ast); // Abstract Syntax Tree
```

### Q: When would you use loose mode?

**Answer:**

**Loose mode** generates simpler, smaller code that's slightly less spec-compliant.

```javascript
{
  presets: [
    ['@babel/preset-env', { loose: true }]
  ]
}
```

**Strict mode (loose: false):**
```javascript
// Uses Object.defineProperty (slower, spec-compliant)
_createClass(Person, [{
  key: 'greet',
  value: function greet() {}
}]);
```

**Loose mode (loose: true):**
```javascript
// Simple assignment (faster, smaller)
Person.prototype.greet = function() {};
```

**Use loose when:**
- Performance critical
- Don't need exact spec compliance
- Know your code doesn't rely on edge cases

**Avoid loose when:**
- Building libraries
- Need strict spec compliance
- Using advanced features

---

## Best Practices

### 1. Use preset-env with browserslist

```json
// package.json
{
  "browserslist": [
    "defaults",
    "not IE 11",
    "maintained node versions"
  ]
}
```

### 2. Enable caching

```javascript
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true
  }
}
```

### 3. Use transform-runtime for libraries

```javascript
// For libraries, avoid global pollution
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3
    }]
  ]
}
```

### 4. Separate dev/prod config

```javascript
{
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    production: {
      plugins: ['transform-remove-console']
    }
  }
}
```

### 5. Type check separately

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "babel src -d dist"
  }
}
```

---

## Migration from Babel 6 to 7

### Package name changes
```bash
# Babel 6
npm install babel-core babel-preset-env

# Babel 7
npm install @babel/core @babel/preset-env
```

### Configuration updates
```javascript
// Babel 6
{
  "presets": ["env", "react"]
}

// Babel 7
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### peer dependencies
- Install `@babel/core` as peer dependency
- Update all babel packages to v7

---

## Summary

### Key Takeaways

1. **Babel** transpiles modern JavaScript to older versions
2. **Presets** are collections of plugins (@babel/preset-env, preset-react)
3. **useBuiltIns: 'usage'** optimizes polyfill bundle size
4. **transform-runtime** avoids helper duplication
5. **Plugins** run before presets, in order
6. **Loose mode** produces smaller but less compliant code
7. Use **browserslist** for automatic target configuration
8. **Cache** transforms for faster builds

### Modern Setup (2024+)
```javascript
{
  presets: [
    ['@babel/preset-env', {
      targets: { esmodules: true },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { corejs: 3 }]
  ]
}
```
