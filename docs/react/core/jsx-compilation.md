# JSX Compilation

## ⚡ Quick Revision
- JSX compiles to `React.createElement(type, props, ...children)` calls
- Babel transforms JSX at build time, not runtime
- React 17+ introduced new JSX Transform (`_jsx` imports)
- Fragment `<>` compiles to `React.Fragment`
- **Pitfall**: JSX elements are objects, not DOM nodes
- **Pitfall**: Component names must be capitalized (lowercase = HTML tags)

```jsx
// This JSX:
<div className="container">
  <Button onClick={handleClick}>Click me</Button>
</div>

// Compiles to (Classic):
React.createElement('div', {className: 'container'}, 
  React.createElement(Button, {onClick: handleClick}, 'Click me')
)

// Or (New Transform):
import { jsx as _jsx } from 'react/jsx-runtime'
_jsx('div', {className: 'container', children: _jsx(Button, {onClick: handleClick, children: 'Click me'})})
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
JSX exists to provide a familiar, HTML-like syntax while maintaining JavaScript's full expressiveness. Without JSX, React components would require verbose `createElement` calls, making component trees unreadable and hard to maintain.

The compilation step allows developers to write declarative markup while React gets the optimized function calls it needs for virtual DOM creation.

</details>

<details>
<summary>How it works</summary>
**Build-time transformation:**
1. Babel parser identifies JSX syntax
2. Transforms JSX elements to function calls
3. Handles props spreading, children arrays, and expressions
4. Validates component naming conventions

**Runtime behavior:**
- `React.createElement` returns plain JavaScript objects (React elements)
- These objects describe the desired UI structure
- React uses these objects during reconciliation to build/update the DOM

**New JSX Transform (React 17+):**
- No longer requires `React` import in scope
- Uses `_jsx` and `_jsxs` functions from `react/jsx-runtime`
- Smaller bundle sizes, better performance

</details>

<details>
<summary>Common misconceptions</summary>
- **"JSX is HTML"** - JSX is JavaScript with XML-like syntax that compiles to function calls
- **"JSX runs in the browser"** - JSX is transformed at build time, browsers never see it
- **"className is a React thing"** - It's a DOM property name that JSX uses instead of the reserved `class` keyword
- **"Components return DOM elements"** - Components return React elements (plain objects)
- **"Fragments create extra DOM nodes"** - Fragments compile away, creating no DOM wrapper

</details>

<details>
<summary>Interview angle</summary>
Interviewers test understanding of:
- **Compilation vs runtime**: Can you explain when and how JSX transforms?
- **Element creation**: What does JSX actually produce?
- **Performance implications**: Why is build-time compilation better than runtime?
- **Debugging skills**: How to read compiled JSX in browser dev tools
- **Best practices**: Component naming, prop handling, key placement

Common questions:
- "What happens when you write JSX?"
- "Why do we need to import React in JSX files?" (Classic transform)
- "What's the difference between React elements and DOM elements?"

</details>