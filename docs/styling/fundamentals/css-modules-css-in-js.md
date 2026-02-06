# CSS Modules & CSS-in-JS

## ⚡ Quick Revision

- **CSS Modules**: Local scope by default, generates unique class names at build time
- **styled-components**: Tagged template literals, dynamic styling, theme support
- **Emotion**: Similar to styled-components but smaller bundle, better performance
- All solve CSS global scope problem and prevent naming conflicts
- Trade-offs: Runtime CSS-in-JS vs build-time CSS Modules

```javascript
// CSS Modules
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>

// styled-components
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  padding: 10px;
`;

// Emotion
const Button = styled.button`
  color: ${props => props.theme.primary};
`;
```

**Key differences:**
- CSS Modules: Build-time transformation, static CSS files
- styled-components/Emotion: Runtime injection, dynamic styling
- Performance: CSS Modules faster initial load, CSS-in-JS better for dynamic themes
- Developer experience: CSS-in-JS offers better TypeScript integration

---

## 🧠 Deep Understanding

<details>
<summary>Why these exist</summary>
Traditional CSS has global scope issues:
- Class name collisions in large applications
- Unused CSS accumulates over time
- No clear dependency relationship between JS and CSS
- Hard to delete styles confidently

CSS Modules and CSS-in-JS solve these by:
- **Scoping**: Automatic unique class names prevent conflicts
- **Colocation**: Styles live near components
- **Dead code elimination**: Unused styles removed with component
- **Type safety**: TypeScript integration for style props

These patterns emerged from component-based architecture needs in React/Vue ecosystems.
</details>

<details>
<summary>How they work</summary>
**CSS Modules mechanism:**
```css
/* Button.module.css */
.primary {
  background: blue;
}
```

Webpack/build tool transforms to:
```css
.Button_primary__3kL2s {
  background: blue;
}
```

```javascript
// Import contains mapping
import styles from './Button.module.css';
// styles.primary = "Button_primary__3kL2s"
```

**styled-components mechanism:**
1. Parse tagged template literal
2. Generate unique class name
3. Inject `<style>` tag into document head
4. Return component with generated className

```javascript
const Button = styled.button`
  color: blue;
`;
// Generates: .sc-abc123 { color: blue; }
// Returns: <button className="sc-abc123">
```

**Emotion mechanism:**
Similar to styled-components but uses different approach:
- Can use `css` prop directly on elements
- Smaller runtime bundle
- Better server-side rendering performance

```javascript
// Object styles
<div css={{ color: 'red' }} />

// String styles
<div css={css`color: blue;`} />
```
</details>

<details>
<summary>Common patterns</summary>
**1. CSS Modules composition:**
```css
/* base.module.css */
.button {
  padding: 10px;
  border: none;
}

/* Button.module.css */
.primary {
  composes: button from './base.module.css';
  background: blue;
}
```

**2. styled-components theming:**
```javascript
const theme = {
  colors: {
    primary: 'blue',
    secondary: 'gray'
  }
};

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
`;

<ThemeProvider theme={theme}>
  <Button>Themed Button</Button>
</ThemeProvider>
```

**3. Emotion with TypeScript:**
```typescript
import { css, Theme } from '@emotion/react';

const buttonStyle = (theme: Theme) => css`
  color: ${theme.colors.primary};
  &:hover {
    color: ${theme.colors.secondary};
  }
`;
```

**4. Dynamic styling:**
```javascript
// styled-components
const Button = styled.button`
  background: ${props => props.variant === 'primary' ? 'blue' : 'gray'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  ${props => props.fullWidth && css`
    width: 100%;
    display: block;
  `}
`;

<Button variant="primary" fullWidth>Click</Button>
```

**5. Global styles with CSS-in-JS:**
```javascript
// styled-components
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: sans-serif;
  }
`;

// Emotion
import { Global, css } from '@emotion/react';

<Global styles={css`
  body { margin: 0; }
`} />
```
</details>

<details>
<summary>Edge cases and gotchas</summary>
**CSS Modules:**
- `:global()` needed for global selectors
- Can't use dynamic class names easily
- Composition order can be tricky

```css
/* Escape local scope */
:global(.external-class) {
  color: red;
}

/* Local by default */
.local {
  color: blue;
}
```

**styled-components:**
- Props with `$` prefix to prevent DOM warnings
- Styling third-party components requires wrapper
- SSR requires babel plugin or SWC

```javascript
// Bad: transient props leak to DOM
<Button hidden={true} /> // Warning in console

// Good: use $ prefix
const Button = styled.button`
  display: ${props => props.$hidden ? 'none' : 'block'};
`;
<Button $hidden={true} />
```

**Emotion:**
- `css` prop requires JSX pragma or babel plugin
- Object styles have different property names (camelCase)

```javascript
// Requires /** @jsxImportSource @emotion/react */
<div css={{ fontSize: '16px' }} />

// Or configure babel
{
  "presets": ["@emotion/babel-preset-css-prop"]
}
```

**Performance issues:**
- Runtime CSS-in-JS can cause FoUC (Flash of Unstyled Content)
- Dynamic styles trigger recalculation on every render
- Use memoization for expensive style calculations

```javascript
// Bad: Creates new style object every render
function Button({ color }) {
  return <div css={{ background: color }} />;
}

// Better: Memoize
const getStyles = (color) => css`background: ${color};`;
function Button({ color }) {
  const styles = useMemo(() => getStyles(color), [color]);
  return <div css={styles} />;
}
```
</details>

---

## 💡 Interview Questions

<details>
<summary>What problems do CSS Modules solve?</summary>
CSS Modules solve:

1. **Global scope pollution**: All class names are local by default
2. **Naming collisions**: Automatic unique class name generation
3. **Dependency clarity**: Import CSS directly in JS components
4. **Dead code elimination**: Unused styles removed with webpack tree-shaking
5. **Maintenance**: Clear relationship between styles and components

Example:
```javascript
// Button.jsx
import styles from './Button.module.css';

// Class name automatically scoped
<button className={styles.primary} />

// Webpack generates: Button_primary__xy12z
```

Benefits:
- No runtime overhead (static CSS)
- Works with any preprocessor (Sass, Less)
- Easy migration from regular CSS
- Type-safe with TypeScript using `typescript-plugin-css-modules`
</details>

<details>
<summary>styled-components vs Emotion - which to choose?</summary>
**styled-components:**
- Pros: Larger ecosystem, more examples, better docs
- Cons: Larger bundle (~16kb), slower SSR
- Best for: Projects prioritizing stability and community

**Emotion:**
- Pros: Smaller bundle (~7kb), faster performance, flexible API
- Cons: Smaller community, fewer resources
- Best for: Performance-critical apps, flexibility

**Key differences:**

| Feature | styled-components | Emotion |
|---------|------------------|---------|
| Bundle size | ~16kb | ~7kb |
| SSR performance | Slower | Faster |
| API flexibility | Template literals only | Template + object styles |
| css prop | Requires plugin | Native support |
| Ecosystem | Larger | Growing |

**Code comparison:**
```javascript
// Both support styled API
const Button = styled.button`color: blue;`;

// Emotion also supports css prop
<div css={css`color: blue;`} />

// Emotion object styles
<div css={{ color: 'blue' }} />
```

**Choose styled-components if:**
- Team familiar with it
- Need extensive examples/community support
- Bundle size not critical

**Choose Emotion if:**
- Performance is priority
- Want object styles option
- Need better SSR performance
- Prefer smaller bundle
</details>

<details>
<summary>Performance implications of runtime CSS-in-JS?</summary>
**Runtime CSS-in-JS costs:**

1. **Initial parsing**: Template literals parsed on mount
2. **Style injection**: Styles injected into DOM dynamically
3. **Recalculation**: Dynamic props trigger style regeneration
4. **Bundle size**: Runtime library adds to JS bundle

**Performance impact:**
```javascript
// Generates style on every render
function Button({ color }) {
  const StyledButton = styled.button`
    background: ${color};
  `;
  return <StyledButton>Click</StyledButton>;
}

// Better: Define outside component
const StyledButton = styled.button`
  background: ${props => props.color};
`;

function Button({ color }) {
  return <StyledButton color={color}>Click</StyledButton>;
}
```

**Mitigation strategies:**

1. **Define styles outside components:**
```javascript
// Bad: Creates new component every render
const Button = () => {
  const Styled = styled.button`...`;
  return <Styled />;
};

// Good: Define once
const Styled = styled.button`...`;
const Button = () => <Styled />;
```

2. **Use CSS variables for dynamic values:**
```javascript
// Avoid recalculating styles
const Button = styled.button`
  background: var(--bg-color);
`;

<Button style={{ '--bg-color': color }} />
```

3. **Memoize complex styles:**
```javascript
const getStyles = (theme) => css`
  /* Complex calculations */
`;

const styles = useMemo(() => getStyles(theme), [theme]);
```

4. **Consider zero-runtime alternatives:**
- Linaria: CSS-in-JS extracted at build time
- vanilla-extract: Type-safe CSS extracted at build
- Compiled: Zero-runtime CSS-in-JS by Meta

**When runtime CSS-in-JS is worth it:**
- Heavy theming requirements
- Truly dynamic styles based on props
- Developer experience benefits outweigh perf cost
- Not performance-critical sections
</details>

<details>
<summary>How to handle SSR with CSS-in-JS?</summary>
**Problem**: Styles generated at runtime cause Flash of Unstyled Content (FoUC)

**Solution**: Extract and inject styles during SSR

**styled-components SSR:**
```javascript
// server.js
import { ServerStyleSheet } from 'styled-components';

const sheet = new ServerStyleSheet();

try {
  const html = renderToString(
    sheet.collectStyles(<App />)
  );
  
  const styleTags = sheet.getStyleTags();
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        ${styleTags}
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `);
} finally {
  sheet.seal();
}
```

**Emotion SSR:**
```javascript
// server.js
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';

const cache = createCache({ key: 'css' });
const { extractCriticalToChunks, constructStyleTagsFromChunks } =
  createEmotionServer(cache);

const html = renderToString(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
);

const chunks = extractCriticalToChunks(html);
const styles = constructStyleTagsFromChunks(chunks);

res.send(`
  <!DOCTYPE html>
  <html>
    <head>${styles}</head>
    <body><div id="root">${html}</div></body>
  </html>
`);
```

**Next.js integration:**

styled-components requires `pages/_document.js`:
```javascript
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }
}
```

**Critical CSS extraction**: Both libraries extract only styles used in rendered HTML, reducing initial payload.
</details>

<details>
<summary>When to use CSS Modules vs CSS-in-JS?</summary>
**Use CSS Modules when:**
- Performance is critical priority
- Don't need dynamic theming
- Team prefers traditional CSS
- Want smaller JavaScript bundle
- Server-side rendering is complex
- Static styles predominate

```javascript
// CSS Modules: Simple, fast, no runtime
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>
```

**Use CSS-in-JS when:**
- Need dynamic theming extensively
- Styles depend heavily on props/state
- Want TypeScript integration for styles
- Prefer colocation of styles with logic
- Component library development
- Need style composition capabilities

```javascript
// CSS-in-JS: Dynamic, flexible, runtime
const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;
```

**Comparison table:**

| Criteria | CSS Modules | CSS-in-JS |
|----------|-------------|-----------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Dynamic styling | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| TypeScript support | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bundle size | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| SSR complexity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Theming | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Learning curve | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Hybrid approach:**
```javascript
// Base styles with CSS Modules
import styles from './Button.module.css';

// Dynamic overrides with inline styles or CSS variables
<button 
  className={styles.button}
  style={{ '--theme-color': themeColor }}
>
  Click
</button>
```

**Modern zero-runtime alternatives:**
- **Linaria**: CSS-in-JS extracted at build time
- **vanilla-extract**: Type-safe CSS with zero runtime
- **Compiled** (Meta): styled-components syntax, zero runtime

These offer CSS-in-JS DX with CSS Modules performance.
</details>

---

## 🎯 Key Takeaways

1. **CSS Modules**: Build-time scoping, best performance, static styles
2. **styled-components**: Popular, large ecosystem, runtime overhead
3. **Emotion**: Better performance than styled-components, flexible API
4. **Trade-off**: Developer experience vs runtime performance
5. **Modern trend**: Zero-runtime CSS-in-JS (Linaria, vanilla-extract)
6. **SSR complexity**: CSS-in-JS requires special handling
7. **Choose based on**: Dynamic styling needs, performance requirements, team preference
