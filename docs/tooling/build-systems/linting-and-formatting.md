# Linting and Formatting

## Overview
Linting and formatting tools enforce code quality and consistency across your codebase. **ESLint** catches bugs and enforces patterns, while **Prettier** handles code formatting.

---

## ESLint

### What is ESLint?
**Static code analysis tool** that identifies problematic patterns and enforces coding standards in JavaScript/TypeScript code.

### Benefits
1. **Catch errors early** - Find bugs before runtime
2. **Enforce best practices** - Consistent code patterns
3. **Code quality** - Avoid common pitfalls
4. **Team consistency** - Same standards across team
5. **Customizable** - Configure rules to your needs

---

## ESLint Configuration

### Installation

```bash
# Install ESLint
npm install eslint --save-dev

# Initialize config
npx eslint --init

# Or manual install with plugins
npm install eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import \
  --save-dev
```

### Configuration Files

#### .eslintrc.json
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc"
      }
    }]
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

#### .eslintrc.js (with logic)
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Environment-specific rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Custom rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
```

---

## ESLint Rules

### Rule Levels
- `"off"` or `0` - Turn rule off
- `"warn"` or `1` - Warning (doesn't affect exit code)
- `"error"` or `2` - Error (exit code 1)

### Common Rules

#### JavaScript Best Practices
```json
{
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }],
    "no-param-reassign": ["error", {
      "props": true
    }],
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-eval": "error",
    "no-implied-eval": "error"
  }
}
```

#### React Rules
```json
{
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "react/no-danger": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### TypeScript Rules
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/consistent-type-imports": ["error", {
      "prefer": "type-imports"
    }]
  }
}
```

#### Import Rules
```json
{
  "rules": {
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        ["parent", "sibling"],
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }],
    "import/no-unresolved": "error",
    "import/no-duplicates": "error",
    "import/no-cycle": "error",
    "import/first": "error",
    "import/newline-after-import": "error"
  }
}
```

---

## ESLint Plugins

### Popular Plugins

#### eslint-plugin-react
React-specific linting rules:
```bash
npm install eslint-plugin-react --save-dev
```

```json
{
  "extends": ["plugin:react/recommended"],
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

#### eslint-plugin-react-hooks
Enforce React Hooks rules:
```bash
npm install eslint-plugin-react-hooks --save-dev
```

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### @typescript-eslint
TypeScript support:
```bash
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
```

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

#### eslint-plugin-jsx-a11y
Accessibility checks:
```bash
npm install eslint-plugin-jsx-a11y --save-dev
```

```json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

#### eslint-plugin-import
Import/export validation:
```bash
npm install eslint-plugin-import --save-dev
```

```json
{
  "extends": ["plugin:import/recommended"],
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

### Custom Plugin

```javascript
// eslint-plugin-custom.js
module.exports = {
  rules: {
    'no-console-log': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow console.log statements'
        },
        fixable: 'code'
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'console' &&
              node.callee.property.name === 'log'
            ) {
              context.report({
                node,
                message: 'Unexpected console.log statement',
                fix(fixer) {
                  return fixer.remove(node);
                }
              });
            }
          }
        };
      }
    }
  }
};
```

---

## Prettier

### What is Prettier?
**Opinionated code formatter** that enforces consistent code style by parsing and reprinting code.

### Key Philosophy
- **One way to format** - Minimal configuration
- **Automatic** - No manual formatting
- **Editor integration** - Format on save

### Installation

```bash
npm install prettier --save-dev

# Create config file
echo '{}' > .prettierrc.json
```

### Configuration

#### .prettierrc.json
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

#### .prettierrc.js
```javascript
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  
  // Override for specific files
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always'
      }
    }
  ]
};
```

#### .prettierignore
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/
out/

# Generated files
*.min.js
*.bundle.js

# Config files
.vscode/
.idea/
```

---

## ESLint + Prettier Integration

### Method 1: eslint-config-prettier

**Turns off ESLint formatting rules** that conflict with Prettier:

```bash
npm install eslint-config-prettier --save-dev
```

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier" // Must be last!
  ]
}
```

### Method 2: eslint-plugin-prettier (Not Recommended)

Runs Prettier as ESLint rule:

```bash
npm install eslint-plugin-prettier --save-dev
```

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

**Why not recommended?**
- Slower (runs Prettier through ESLint)
- Mixed concerns (linting + formatting)
- Better to run separately

### Recommended Setup

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\""
  }
}
```

---

## Pre-commit Hooks

### Husky + lint-staged

**Automatically lint and format** before committing:

#### Installation
```bash
npm install husky lint-staged --save-dev

# Initialize husky
npx husky install

# Add prepare script
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Configuration

**package.json:**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

**Or .lintstagedrc.json:**
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": "prettier --write"
}
```

### Advanced lint-staged

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

### Commitlint

**Enforce commit message conventions:**

```bash
npm install @commitlint/cli @commitlint/config-conventional --save-dev

# Add hook
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**commitlint.config.js:**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf'
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'subject-max-length': [2, 'always', 100]
  }
};
```

**Example commits:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve memory leak in cache"
git commit -m "docs: update README with setup instructions"
```

---

## VS Code Integration

### settings.json

```json
{
  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": false,
  "eslint.lintTask.enable": true,
  
  // Prettier
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  
  // Language-specific settings
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Format on paste
  "editor.formatOnPaste": true,
  
  // Auto fix on save
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

### Required Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig"
  ]
}
```

---

## EditorConfig

**Maintain consistent coding styles** across editors:

**.editorconfig:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
max_line_length = 100

[*.{yml,yaml}]
indent_size = 2

[{package.json,.travis.yml}]
indent_size = 2
```

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/lint.yml:**
```yaml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check formatting
        run: npm run format:check
      
      - name: Type check
        run: npm run type-check
```

### GitLab CI

**.gitlab-ci.yml:**
```yaml
lint:
  stage: test
  image: node:18
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint
    - npm run format:check
  only:
    - merge_requests
    - main
```

---

## Advanced Configurations

### Monorepo Setup

**Root .eslintrc.json:**
```json
{
  "root": true,
  "extends": ["./packages/eslint-config-custom"]
}
```

**packages/eslint-config-custom/index.js:**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Shared rules
  }
};
```

**Package-specific overrides:**
```json
{
  "extends": ["custom"],
  "rules": {
    // Package-specific rules
  }
}
```

### Performance Optimization

```json
{
  "cache": true,
  "cacheLocation": ".eslintcache",
  "cacheStrategy": "content"
}
```

**Run ESLint:**
```bash
# With cache
eslint . --cache --cache-location .eslintcache

# Parallel processing
eslint . --max-warnings 0 --cache
```

---

## Common Interview Questions

### Q: What is the difference between ESLint and Prettier?

**Answer:**

**ESLint:**
- **Code quality** - Finds bugs, enforces patterns
- **Configurable** - Hundreds of rules
- **Can fix** - Some issues auto-fixable
- **Examples:** unused variables, missing dependencies, React rules

**Prettier:**
- **Code formatting** - Consistent style
- **Opinionated** - Minimal config
- **Always fixes** - Automatic formatting
- **Examples:** semicolons, quotes, line breaks

**Best practice:** Use both together
- ESLint for quality
- Prettier for formatting
- eslint-config-prettier to avoid conflicts

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Q: How does ESLint work internally?

**Answer:**

**4-step process:**

1. **Parse** - Convert code to AST (Abstract Syntax Tree)
```javascript
// Code
const x = 1;

// AST
{
  type: 'VariableDeclaration',
  kind: 'const',
  declarations: [...]
}
```

2. **Traverse** - Visit each node in AST
3. **Apply rules** - Check against configured rules
4. **Report** - Output errors/warnings

**Rule example:**
```javascript
module.exports = {
  create(context) {
    return {
      // Visitor pattern
      VariableDeclaration(node) {
        if (node.kind === 'var') {
          context.report({
            node,
            message: 'Use let or const instead of var'
          });
        }
      }
    };
  }
};
```

### Q: What are ESLint shareable configs?

**Answer:**

**Reusable ESLint configurations** published as npm packages:

**Popular configs:**
- `eslint:recommended` - Core ESLint rules
- `eslint-config-airbnb` - Airbnb style guide
- `eslint-config-standard` - Standard JS style
- `@typescript-eslint/recommended` - TypeScript rules
- `eslint-config-next` - Next.js optimized

**Creating shareable config:**
```javascript
// eslint-config-mycompany/index.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'error',
    'prefer-const': 'error'
  }
};

// Publish to npm
npm publish eslint-config-mycompany

// Usage
{
  "extends": ["mycompany"]
}
```

### Q: How do you handle ESLint in monorepos?

**Answer:**

**Approach 1: Shared config package**
```
packages/
  eslint-config-custom/
    index.js
  app1/
    .eslintrc.json → extends: ["custom"]
  app2/
    .eslintrc.json → extends: ["custom"]
```

**Approach 2: Root config with overrides**
```json
{
  "root": true,
  "extends": ["eslint:recommended"],
  "overrides": [
    {
      "files": ["packages/frontend/**"],
      "extends": ["plugin:react/recommended"]
    },
    {
      "files": ["packages/backend/**"],
      "env": { "node": true }
    }
  ]
}
```

**Run from root:**
```bash
# Lint all packages
eslint "packages/**/*.{js,ts}"

# Or with lerna/nx
lerna run lint
nx run-many --target=lint
```

### Q: What are the performance implications of ESLint?

**Answer:**

**ESLint can be slow on large codebases:**

**Optimization strategies:**

1. **Enable caching:**
```bash
eslint . --cache
```

2. **Ignore files:**
```
# .eslintignore
node_modules/
dist/
*.min.js
```

3. **Run on changed files only:**
```json
{
  "lint-staged": {
    "*.js": "eslint"
  }
}
```

4. **Disable expensive rules:**
```json
{
  "rules": {
    "import/no-cycle": "off" // Expensive rule
  }
}
```

5. **Parallel processing:**
```bash
eslint . --max-warnings 0 & prettier --check .
```

**Typical speeds:**
- Small project (100 files): < 1s
- Medium (1000 files): 5-10s
- Large (10000 files): 30-60s (without cache)

### Q: How do pre-commit hooks work with husky?

**Answer:**

**Husky** adds Git hooks that run before commits:

**Setup:**
```bash
npm install husky lint-staged --save-dev
npx husky install
```

**Flow:**
```
1. Developer runs: git commit
2. Git triggers: .husky/pre-commit
3. Hook runs: npx lint-staged
4. lint-staged runs: eslint --fix
5. If successful: commit proceeds
6. If failed: commit blocked
```

**Configuration:**
```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

**.husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Benefits:**
- Prevents bad code from being committed
- Automatic formatting
- Fast (only staged files)
- Team consistency

### Q: When would you disable ESLint rules?

**Answer:**

**Inline disable:**
```javascript
// Single line
// eslint-disable-next-line no-console
console.log('Debug info');

// Multiple lines
/* eslint-disable no-console */
console.log('Start');
console.log('End');
/* eslint-enable no-console */

// Specific rules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// Entire file
/* eslint-disable */
```

**When to disable:**
1. **Third-party code** - Legacy code you can't modify
2. **Generated files** - Build outputs
3. **Edge cases** - Legitimate exceptions
4. **Development** - Console logs in development

**Better alternatives:**
```javascript
// Instead of disabling, fix the issue
const logger = process.env.NODE_ENV === 'development' ? console : null;

// Or configure rule
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

---

## Best Practices

### 1. Use Standard Configs
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ]
}
```

### 2. Separate Linting and Formatting
```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "check": "npm run lint && npm run format:check"
  }
}
```

### 3. Use Pre-commit Hooks
```json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 4. Configure Editor
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 5. Run in CI
```yaml
- name: Lint
  run: npm run lint && npm run format:check
```

### 6. Document Exceptions
```javascript
// Disabling rule because third-party API requires any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processLegacyData(data: any) {
  // ...
}
```

---

## Summary

### Key Takeaways

1. **ESLint** - Code quality and bug detection
2. **Prettier** - Automatic code formatting
3. **Use together** - ESLint for logic, Prettier for style
4. **eslint-config-prettier** - Prevent conflicts
5. **Husky + lint-staged** - Pre-commit hooks
6. **CI integration** - Enforce in pipeline
7. **Editor integration** - Format on save
8. **Shareable configs** - Team consistency

### Recommended Setup

```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "eslint-config-prettier": "^9.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  },
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```
