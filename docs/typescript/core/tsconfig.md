# TypeScript Configuration (tsconfig.json)

## ⚡ Quick Revision
- **`strict: true`**: Enables all strict type checking options (recommended)
- **`target`**: ECMAScript version for compiled JS (`ES2020`, `ESNext`)
- **`module`**: Module system (`commonjs`, `es6`, `esnext`)
- **`moduleResolution`**: How modules are resolved (`node`, `bundler`)
- **`lib`**: Runtime libraries to include (`DOM`, `ES2020`, `ESNext`)
- **`baseUrl` + `paths`**: Module path mapping for custom resolution
- **`include/exclude`**: Which files to compile/ignore
- **`declaration`**: Generate `.d.ts` files for libraries
- **`sourceMap`**: Generate source maps for debugging
- **Key strict options**: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020", 
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },
    "types": ["node", "jest"],
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
tsconfig.json controls TypeScript's behavior and is crucial for:

**Development experience**: Proper IDE support, error reporting, and autocomplete
```json
{
  "compilerOptions": {
    "strict": true, // Catch more errors
    "noImplicitReturns": true, // Ensure all code paths return
    "noUnusedLocals": true // Catch unused variables
  }
}
```

**Build optimization**: Control compilation output and performance
```json
{
  "compilerOptions": {
    "target": "ES2020", // Modern features, smaller bundles
    "moduleResolution": "bundler", // Optimized for bundlers
    "skipLibCheck": true // Faster compilation
  }
}
```

**Team consistency**: Standardize TypeScript settings across developers
```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Library authoring**: Generate declaration files and proper exports
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  }
}
```

</details>

<details>
<summary>How it works</summary>
**Configuration inheritance**:
```json
// Base config: tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ES2020"
  }
}

// Extending: tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist" // Added to base config
  },
  "include": ["src/**/*"]
}
```

**Module resolution strategies**:
```json
// Node resolution (default)
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
// Looks for: node_modules/package/index.js or package.json main field

// Bundler resolution (modern)
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
// Optimized for webpack, vite, etc. Supports package.json exports field
```

**Path mapping mechanics**:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*", "shared/utils/*"], // Multiple fallbacks
      "shared": ["../shared/index.ts"] // Exact path
    }
  }
}

// TypeScript resolves:
// import { helper } from '@/utils/helper' → src/utils/helper.ts
// import shared from 'shared' → ../shared/index.ts
```

**Strict mode breakdown**:
```json
{
  "compilerOptions": {
    "strict": true // Enables all below:
    // "noImplicitAny": true,
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    // "strictBindCallApply": true,
    // "strictPropertyInitialization": true,
    // "noImplicitReturns": true,
    // "noImplicitThis": true,
    // "useUnknownInCatchVariables": true
  }
}
```

**Project references for monorepos**:
```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true, // Enable project references
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}

// packages/app/tsconfig.json  
{
  "references": [
    { "path": "../core" } // Reference core package
  ],
  "compilerOptions": {
    "outDir": "./dist"
  }
}

// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "target and lib are the same thing"**
```json
{
  "compilerOptions": {
    "target": "ES5", // What JS version to compile TO
    "lib": ["ES2020", "DOM"] // What APIs TypeScript assumes are available
  }
}
// You can compile to ES5 but still use ES2020 types if runtime supports it
```

**❌ "include/exclude work like .gitignore"**
```json
{
  "include": ["src/**/*"], // Must specify file patterns
  "exclude": ["**/*.spec.ts"] // Only excludes from include, not from imports
}
// exclude doesn't prevent imports, only compilation
```

**❌ "skipLibCheck makes compilation unsafe"**
- `skipLibCheck: true` skips type checking of `.d.ts` files
- Your code is still type-checked, just not dependencies
- Usually safe and improves performance

**❌ "esModuleInterop is always needed"**
```json
{
  "compilerOptions": {
    "esModuleInterop": true, // Only needed for CommonJS interop
    "allowSyntheticDefaultImports": true // Allows import React from 'react'
  }
}
// Not needed if using pure ES modules
```

**❌ "Paths work in compiled output"**
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"] // Only for TypeScript, not runtime
    }
  }
}
// Need bundler or build tool to resolve paths in compiled JS
```

**❌ "Stricter is always better"**
```json
{
  "compilerOptions": {
    "noImplicitAny": true, // Good for new projects
    "exactOptionalPropertyTypes": true, // Can break existing code
    "noUncheckedIndexedAccess": true // Very strict, might be too much
  }
}
// Balance strictness with productivity and migration effort
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Explain the difference between target and lib"**
```json
{
  "compilerOptions": {
    "target": "ES2018", // Compile output format
    "lib": ["ES2021", "DOM"], // Available APIs during development
    "polyfills": "usage" // Build tool might polyfill ES2021 features for ES2018
  }
}
```

2. **"How would you configure TypeScript for a monorepo?"**
```json
// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/client" },
    { "path": "./packages/server" }
  ]
}

// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist"
  }
}

// packages/client/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [{ "path": "../shared" }],
  "compilerOptions": {
    "lib": ["DOM", "ES2020"],
    "jsx": "react-jsx"
  }
}
```

3. **"Set up path mapping for a complex project structure"**
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      // Feature-based organization
      "@auth/*": ["src/features/auth/*"],
      "@user/*": ["src/features/user/*"],
      "@shared/*": ["src/shared/*"],
      
      // Layer-based organization  
      "@api/*": ["src/api/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      
      // Environment-specific
      "@config": ["src/config/index.ts"],
      "@env": ["src/env.ts"],
      
      // Testing utilities
      "@test-utils": ["src/test-utils/index.ts"]
    }
  }
}
```

4. **"Configure TypeScript for different environments"**
```json
// tsconfig.json (development)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "sourceMap": true,
    "incremental": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// tsconfig.build.json (production)
{
  "extends": "./tsconfig.base.json", 
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "declaration": true,
    "declarationMap": true
  },
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "src/test-utils"]
}

// tsconfig.test.json (testing)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"],
    "esModuleInterop": true
  },
  "include": ["src/**/*", "**/*.spec.ts", "**/*.test.ts"]
}
```

5. **"Explain strict mode configuration strategy"**
```json
// Gradual migration approach
{
  "compilerOptions": {
    // Start with these
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    
    // Add gradually
    "strictNullChecks": true,
    "noImplicitAny": true,
    
    // Advanced strictness
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}

// Per-file overrides during migration
{
  "compilerOptions": {
    "strict": true
  },
  "ts-node": {
    "compilerOptions": {
      "strict": false // Less strict for build scripts
    }
  }
}
```

**Red flags to avoid**:
- Using `any` to bypass strict mode instead of configuring properly
- Not understanding the difference between compile-time and runtime module resolution
- Overcomplicated path mappings that hurt maintainability
- Not using project references for monorepos
- Copying configurations without understanding what each option does
- Not having different configs for development, testing, and production
</details>