# Reconciliation

## ⚡ Quick Revision
- Virtual DOM diffing algorithm that determines what UI changes are needed
- React Fiber (React 16+): Incremental, interruptible reconciliation
- Three phases: Render → Commit → Effects
- **Pitfall**: Reconciliation can be paused, but commit phase is synchronous
- **Pitfall**: Same component type + key = update, different type = unmount/remount
- Keys enable efficient list updates by helping React match elements

```jsx
// Triggers reconciliation when state changes
const [count, setCount] = useState(0);

// React compares:
// Current: <div key="item-1">Old</div>
// Next:    <div key="item-1">New</div>
// Result:  Update text content, reuse DOM node
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Directly manipulating the DOM for every state change would be slow and error-prone. Reconciliation solves this by:

1. **Batching changes**: Multiple state updates become a single DOM update
2. **Minimizing DOM operations**: Only changes what actually needs updating  
3. **Preventing layout thrashing**: Coordinates updates to avoid performance bottlenecks
4. **Enabling predictable updates**: Declarative UI means describing end state, not mutations

Without reconciliation, React would need to rebuild the entire DOM tree on every change.

</details>

<details>
<summary>How it works</summary>
**React Fiber Architecture:**
- **Work units**: Each component/element becomes a "fiber" (work unit)
- **Priority scheduling**: High-priority updates (user input) interrupt low-priority ones
- **Time slicing**: Work is broken into chunks to keep the main thread responsive

**Reconciliation phases:**

1. **Render Phase** (Interruptible):
   - Build new virtual DOM tree
   - Compare with current tree (diffing)
   - Mark changes needed
   - Can be paused/resumed

2. **Commit Phase** (Synchronous):
   - Apply DOM mutations
   - Run lifecycle methods
   - Schedule effects

**Diffing algorithm:**
- **Tree level**: Different component types = full subtree replacement
- **Element level**: Same type = update props, different type = replace
- **List level**: Keys help identify moved/added/removed items

</details>

<details>
<summary>Common misconceptions</summary>
- **"Virtual DOM is always faster"** - For simple apps, direct DOM might be faster; VDOM shines with complex UIs
- **"Reconciliation happens instantly"** - Fiber can pause render work; only commit is synchronous
- **"Keys are just for lists"** - Keys work anywhere to help React identify elements
- **"React diffs the entire tree"** - React uses heuristics to skip unchanged subtrees
- **"setState immediately updates the DOM"** - Updates are batched and processed during reconciliation

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **Performance**: How does React minimize expensive DOM operations?
- **Fiber benefits**: What problems does time-slicing solve?
- **Update prioritization**: How does React handle competing updates?
- **Debugging**: Can you trace why a component re-rendered?

Critical concepts to explain:
- **Diffing strategy**: O(n³) → O(n) through heuristics
- **Work scheduling**: How React keeps UI responsive during heavy updates
- **Bailout conditions**: When React skips reconciliation for subtrees
- **Key importance**: How keys affect reconciliation decisions

Common questions:
- "What happens when you call setState?"
- "How does React decide what DOM changes to make?"
- "What are the benefits of React Fiber over the old reconciler?"
- "When would you use a key that's not an array index?"

</details>