# Keys and Rendering

## ⚡ Quick Revision
- Keys help React identify which list items changed, moved, or were added/removed
- Stable, unique keys enable efficient DOM reuse
- **Pitfall**: Array indices as keys cause issues when list order changes
- **Pitfall**: Missing keys in lists trigger React warnings and poor performance
- Re-rendering rules: props change, state change, parent re-renders, or context change

```jsx
// Bad: Index keys cause issues on reorder
{items.map((item, index) => 
  <Item key={index} data={item} />
)}

// Good: Stable unique keys
{items.map(item => 
  <Item key={item.id} data={item} />
)}

// Force remount with key change
<Component key={shouldReset ? 'reset' : 'normal'} />
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Without keys, React has no way to correlate list items between renders. This leads to:

1. **Incorrect state preservation**: Input focus/values stick to wrong items
2. **Poor performance**: React recreates DOM nodes instead of reusing them  
3. **Visual bugs**: Animations and transitions break during list changes
4. **Inefficient updates**: React can't determine minimal set of DOM operations

Keys solve this by providing stable identity that persists across renders, enabling React to make smart decisions about DOM reuse vs recreation.

</details>

<details>
<summary>How it works</summary>
**Key-based reconciliation:**
1. React builds a map of old elements by their keys
2. For each new element, React checks if a matching key exists
3. **Match found**: Update existing element with new props
4. **No match**: Create new element, destroy unmatched old elements

**Re-rendering triggers:**
- **Props change**: Parent passes different props
- **State change**: Component's own state updates  
- **Context change**: Consumed context value changes
- **Parent re-render**: Parent renders, child renders too (unless optimized)

**Optimization techniques:**
- `React.memo`: Skip re-render if props haven't changed
- `useMemo`/`useCallback`: Prevent prop changes from object recreation
- `PureComponent`: Class component automatic shallow comparison

**Key change behavior:**
- Different key = React treats as completely different element
- Useful for forcing component remount and state reset

</details>

<details>
<summary>Common misconceptions</summary>
- **"Keys are only for performance"** - Keys also ensure correct component state/behavior
- **"Index keys are always bad"** - They're fine for static lists that never reorder
- **"Random keys work"** - Keys must be stable across renders, not random
- **"Keys must be globally unique"** - Only unique among siblings, not the entire app
- **"Re-rendering is always bad"** - Sometimes re-renders are necessary and fast enough
- **"Key={Math.random()} forces update"** - This destroys and recreates components, losing state

</details>

<details>
<summary>Interview angle</summary>
Interviewers assess understanding of:
- **List rendering performance**: How keys affect DOM operations
- **State preservation**: When component state persists vs resets
- **React optimization**: How to prevent unnecessary re-renders
- **Debugging skills**: Identifying re-render causes and key-related bugs

Key scenarios to explain:
- **Todo list reordering**: Why index keys break item state
- **Form inputs in lists**: How wrong keys cause focus/value bugs  
- **Performance optimization**: When `React.memo` helps vs hurts
- **Forced remounting**: Using key changes to reset component state

Common questions:
- "Why shouldn't you use array indices as keys?"
- "What causes a React component to re-render?"
- "How would you optimize a list with expensive child components?"
- "What happens when you change a component's key?"
- "When is it okay to use index as a key?"

</details>