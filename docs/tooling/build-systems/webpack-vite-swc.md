# Webpack, Vite, SWC & Bundlers

## Overview
Modern build tools and bundlers that transform and optimize code for production. Understanding their differences, tradeoffs, and use cases is crucial for frontend development.

---

## Webpack

### What is Webpack?
**Highly configurable module bundler** that treats every file as a module and creates a dependency graph to bundle assets.

### Core Concepts

#### Entry
Starting point for the dependency graph:
```javascript
module.exports = {
  entry: './src/index.js',
  // Multiple entries
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
};
```

#### Output
Where to emit bundles:
```javascript
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true // Clean dist folder
  }
};
```

#### Loaders
Transform files before bundling:
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|svg|jpg)$/,
        type: 'asset/resource'
      }
    ]
  }
};
```

#### Plugins
Extend webpack's capabilities:
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

### Code Splitting

#### Dynamic Imports
```javascript
// Lazy load component
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Dynamic import with webpack magic comments
import(/* webpackChunkName: "lodash" */ 'lodash').then(({ default: _ }) => {
  console.log(_.chunk([1, 2, 3, 4], 2));
});
```

#### SplitChunksPlugin
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### Optimization

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    runtimeChunk: 'single', // Separate runtime code
    moduleIds: 'deterministic' // Stable module IDs
  }
};
```

### Dev Server
```javascript
module.exports = {
  devServer: {
    static: './dist',
    hot: true, // Hot Module Replacement
    port: 3000,
    historyApiFallback: true, // SPA routing
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
};
```

---

## Vite

### What is Vite?
**Next-generation build tool** leveraging native ES modules in development with lightning-fast HMR and Rollup for production builds.

### Key Advantages

#### No Bundling in Dev
- Serves source files over native ESM
- Browser requests only what it needs
- Instant server start regardless of app size

#### Lightning-Fast HMR
```javascript
// Hot Module Replacement
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle hot update
  });
}
```

### Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components'
    }
  },
  
  // Dev server
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  // Build options
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

### Environment Variables
```javascript
// .env files
// VITE_API_URL=https://api.example.com

// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
console.log(import.meta.env.MODE); // 'development' or 'production'
```

### Asset Handling
```javascript
// Import as URL
import imgUrl from './img.png';
// imgUrl will be '/assets/img.2d8efhg.png'

// Import as string (with ?raw)
import shaderSource from './shader.glsl?raw';

// Import as Web Worker
import Worker from './worker.js?worker';
const worker = new Worker();
```

---

## SWC (Speedy Web Compiler)

### What is SWC?
**Rust-based JavaScript/TypeScript compiler** that is 20x faster than Babel. Used by Next.js 12+, Vite, and other modern tools.

### Key Features
- Written in Rust for maximum performance
- Drop-in replacement for Babel
- Built-in minification
- TypeScript support out of the box

### Configuration

```json
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true
    },
    "transform": {
      "react": {
        "runtime": "automatic",
        "development": false,
        "refresh": true
      }
    },
    "target": "es2020"
  },
  "module": {
    "type": "es6"
  },
  "minify": true
}
```

### Usage with Webpack
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              }
            }
          }
        }
      }
    ]
  }
};
```

---

## Rollup

### What is Rollup?
**Module bundler optimized for libraries** with superior tree-shaking and ES module output.

### When to Use Rollup
- Building JavaScript libraries
- Need multiple output formats (ESM, CJS, UMD)
- Tree-shaking is critical

### Configuration
```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    terser()
  ],
  external: ['react', 'react-dom'] // Don't bundle peer dependencies
};
```

---

## esbuild

### What is esbuild?
**Extremely fast JavaScript bundler** written in Go. Used by Vite for development.

### Key Features
- 10-100x faster than traditional bundlers
- Built-in TypeScript support
- Minimal configuration
- No plugin ecosystem (intentional)

### Usage
```javascript
// esbuild.config.js
require('esbuild').build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  outfile: 'dist/bundle.js',
  loader: {
    '.png': 'dataurl',
    '.svg': 'text'
  }
}).catch(() => process.exit(1));
```

---

## Bundler Comparison

### Build Performance

| Tool | Speed | Language | HMR Speed |
|------|-------|----------|-----------|
| esbuild | ⚡⚡⚡⚡⚡ | Go | N/A |
| SWC | ⚡⚡⚡⚡ | Rust | ⚡⚡⚡⚡ |
| Vite | ⚡⚡⚡⚡ | JavaScript | ⚡⚡⚡⚡⚡ |
| Rollup | ⚡⚡⚡ | JavaScript | ⚡⚡⚡ |
| Webpack | ⚡⚡ | JavaScript | ⚡⚡⚡ |

### Use Cases

#### Webpack
- **Best for:** Complex applications with custom requirements
- **Pros:** Highly configurable, mature ecosystem, extensive plugin support
- **Cons:** Slower builds, complex configuration, steeper learning curve

#### Vite
- **Best for:** Modern web applications, fast development
- **Pros:** Instant dev server, lightning-fast HMR, simple config
- **Cons:** Less mature than webpack, limited plugin ecosystem

#### Rollup
- **Best for:** JavaScript libraries, npm packages
- **Pros:** Superior tree-shaking, multiple output formats, clean output
- **Cons:** Not ideal for applications, fewer loaders than webpack

#### esbuild
- **Best for:** Development builds, rapid prototyping
- **Pros:** Extremely fast, simple configuration
- **Cons:** Limited plugin ecosystem, no HMR, young project

### Migration Considerations

#### Webpack → Vite
```javascript
// Before (webpack.config.js)
module.exports = {
  entry: './src/main.js',
  output: { filename: 'bundle.js' }
};

// After (vite.config.js)
export default {
  build: {
    rollupOptions: {
      input: './src/main.js'
    }
  }
};
```

#### Key Differences
1. **No CommonJS in Vite** - Must use ESM imports
2. **Environment variables** - `process.env` → `import.meta.env`
3. **Asset imports** - Different URL handling
4. **Dynamic imports** - Native browser support

---

## Advanced Webpack Patterns

### Module Federation
Share code between separately deployed applications:

```javascript
// Host application
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// Remote application
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/Button'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
});

// Usage in host
const RemoteButton = React.lazy(() => import('app1/Button'));
```

### Custom Loaders
```javascript
// my-loader.js
module.exports = function(source) {
  // Transform source
  const transformed = source.replace(/console\.log/g, 'console.info');
  return transformed;
};

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: path.resolve(__dirname, 'my-loader.js')
      }
    ]
  }
};
```

### Custom Plugins
```javascript
class MyWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // Access compilation assets
      const assets = compilation.assets;
      
      // Add custom asset
      compilation.assets['my-file.txt'] = {
        source: () => 'Hello World',
        size: () => 11
      };
      
      callback();
    });
  }
}

module.exports = {
  plugins: [new MyWebpackPlugin()]
};
```

---

## Common Interview Questions

### Q: Why is Vite faster than Webpack in development?

**Answer:**
1. **No bundling in dev** - Vite serves source files over native ESM, browser only requests what it needs
2. **On-demand compilation** - Only transforms files when requested by browser
3. **Native ES modules** - Browser handles module resolution
4. **esbuild for dependencies** - Pre-bundles dependencies using ultra-fast esbuild
5. **Efficient HMR** - Updates only changed modules without full refresh

**Webpack in dev:**
- Bundles entire application on startup
- Re-bundles on changes (even with optimizations)
- Slower as app grows

### Q: What is tree shaking and how does it work?

**Answer:**
Tree shaking is **dead code elimination** that removes unused exports from bundle.

**Requirements:**
1. Must use ES modules (static imports/exports)
2. `sideEffects: false` in package.json
3. Production mode with minification

**Example:**
```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// app.js
import { add } from './math';
console.log(add(1, 2));

// Bundle only includes 'add', others are tree-shaken
```

### Q: How does code splitting improve performance?

**Answer:**
Code splitting **reduces initial bundle size** by loading code on-demand.

**Benefits:**
1. Faster initial page load
2. Parallel downloads of chunks
3. Better caching (vendor code separate from app code)
4. Load features only when needed

**Techniques:**
```javascript
// 1. Dynamic imports
const module = await import('./heavy-module.js');

// 2. React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// 3. Route-based splitting
const routes = [
  { path: '/admin', component: () => import('./Admin') }
];
```

### Q: When would you choose Rollup over Webpack?

**Answer:**
Choose **Rollup** for:
1. **Libraries/packages** - Need multiple output formats (ESM, CJS, UMD)
2. **Tree-shaking critical** - Superior dead code elimination
3. **Clean output** - More readable bundled code

Choose **Webpack** for:
1. **Applications** - Better dev experience with HMR
2. **Complex assets** - Images, CSS, fonts
3. **Code splitting** - Dynamic imports, lazy loading

### Q: How does Webpack's Module Federation work?

**Answer:**
Module Federation allows **sharing code between separately deployed applications**.

**Use cases:**
1. Micro-frontends architecture
2. Share common libraries
3. Independent deployment

**Key concepts:**
- **Host** - Consumes remote modules
- **Remote** - Exposes modules
- **Shared dependencies** - Avoid duplication (React, etc.)

```javascript
// Remote exposes Button
exposes: { './Button': './src/Button' }

// Host consumes Button
remotes: { app1: 'app1@http://localhost:3001/remoteEntry.js' }

// Usage
import('app1/Button')
```

### Q: What is the difference between Babel and SWC?

**Answer:**
Both are **transpilers** that convert modern JavaScript to browser-compatible code.

**SWC:**
- Written in Rust (20x faster)
- Built-in minification
- Less mature plugin ecosystem
- Used by Next.js 12+

**Babel:**
- Written in JavaScript
- Extensive plugin ecosystem
- More configuration options
- Industry standard

**When to use:**
- **SWC** - Performance critical, simpler transforms
- **Babel** - Need specific plugins, complex transforms

### Q: How do you optimize Webpack bundle size?

**Answer:**
```javascript
// 1. Tree shaking
mode: 'production', // Enables minification

// 2. Code splitting
optimization: {
  splitChunks: { chunks: 'all' }
},

// 3. Minimize dependencies
externals: { react: 'React' },

// 4. Dynamic imports
const module = await import('./module');

// 5. Analyze bundle
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer');
plugins: [new BundleAnalyzerPlugin()],

// 6. Compression
const CompressionPlugin = require('compression-webpack-plugin');
plugins: [new CompressionPlugin()],

// 7. Remove source maps in production
devtool: false,

// 8. Scope hoisting
optimization: {
  concatenateModules: true
}
```

---

## Performance Tips

### 1. Cache Busting with Content Hashes
```javascript
output: {
  filename: '[name].[contenthash].js',
  chunkFilename: '[name].[contenthash].chunk.js'
}
```

### 2. Persistent Caching (Webpack 5)
```javascript
cache: {
  type: 'filesystem',
  buildDependencies: {
    config: [__filename]
  }
}
```

### 3. Parallel Builds
```javascript
// Use thread-loader for expensive loaders
{
  test: /\.js$/,
  use: ['thread-loader', 'babel-loader']
}
```

### 4. DLL Plugin (for rarely changing deps)
```javascript
// webpack.dll.js
new webpack.DllPlugin({
  name: '[name]_dll',
  path: path.join(__dirname, 'dll', '[name].manifest.json')
});

// Reference in main config
new webpack.DllReferencePlugin({
  manifest: require('./dll/vendor.manifest.json')
});
```

---

## Summary

### Key Takeaways
1. **Webpack** - Mature, configurable, best for complex apps
2. **Vite** - Fast dev experience, ideal for modern apps
3. **Rollup** - Best for libraries with superior tree-shaking
4. **esbuild** - Fastest builds, minimal config
5. **SWC** - Rust-based, drop-in Babel replacement

### Decision Matrix
- **New project?** → Vite
- **Library?** → Rollup
- **Complex requirements?** → Webpack
- **Speed critical?** → esbuild/SWC
- **Micro-frontends?** → Webpack Module Federation

### Modern Stack (2024+)
```
Development: Vite + SWC
Production: Rollup (via Vite)
Transpilation: SWC
Minification: esbuild/SWC
```
