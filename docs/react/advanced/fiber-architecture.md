# React Fiber Architecture

## Overview

React Fiber is the reimplementation of React's core algorithm introduced in React 16. It enables incremental rendering, allowing React to split rendering work into chunks and spread it out over multiple frames.

## What is Fiber?

A **Fiber** is a JavaScript object that represents a unit of work. Each React element has a corresponding Fiber node that tracks:
- Component state and props
- Component type
- Links to parent, child, and sibling Fibers
- Pending work priority
- Side effects to perform

```javascript
// Simplified Fiber structure
{
  type: 'div',                    // Component type
  key: null,                      // Unique key
  stateNode: DOMNode,            // Reference to DOM node or component instance
  
  // Fiber relationships
  return: parentFiber,           // Parent fiber
  child: firstChildFiber,        // First child
  sibling: nextSiblingFiber,     // Next sibling
  
  // Work tracking
  pendingProps: {},              // New props
  memoizedProps: {},             // Previous props
  memoizedState: {},             // Previous state
  updateQueue: [],               // Queue of updates
  
  // Effects
  flags: Update | Placement,     // Side effect tags
  subtreeFlags: Update,          // Aggregate of child effects
  
  // Priority
  lanes: SyncLane,               // Priority lanes
  childLanes: DefaultLane,       // Child priority
  
  // Double buffering
  alternate: workInProgressFiber // Alternate fiber tree
}
```

## Double Buffering

React maintains two Fiber trees:
- **Current tree**: Reflects what's on screen
- **Work-in-progress tree**: Being built during reconciliation

```javascript
// When reconciliation completes, React swaps the trees
function commitRoot(root) {
  const finishedWork = root.current.alternate;
  root.current = finishedWork; // Swap!
}
```

## Reconciliation Process

### Phase 1: Render Phase (Interruptible)

Fiber walks the tree and identifies changes:

```javascript
function workLoop(isAsync) {
  if (!isAsync) {
    // Synchronous - complete all work
    while (workInProgress !== null) {
      workInProgress = performUnitOfWork(workInProgress);
    }
  } else {
    // Async - can be interrupted
    while (workInProgress !== null && !shouldYield()) {
      workInProgress = performUnitOfWork(workInProgress);
    }
  }
}

function performUnitOfWork(fiber) {
  // 1. Begin work on this fiber
  const next = beginWork(fiber);
  
  // 2. If there's a child, work on it next
  if (next !== null) {
    return next;
  }
  
  // 3. No child, complete this unit
  completeUnitOfWork(fiber);
}

function beginWork(fiber) {
  // Call component function or class render method
  // Reconcile children
  // Return first child or null
}

function completeUnitOfWork(fiber) {
  // Finalize fiber (create DOM nodes, etc.)
  // Move to sibling or parent
}
```

### Phase 2: Commit Phase (Synchronous)

Apply changes to DOM atomically:

```javascript
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // Phase 1: Before mutation
  commitBeforeMutationEffects(finishedWork);
  
  // Phase 2: Mutation (update DOM)
  commitMutationEffects(finishedWork);
  
  // Switch trees
  root.current = finishedWork;
  
  // Phase 3: Layout effects
  commitLayoutEffects(finishedWork);
  
  // Phase 4: Passive effects (useEffect)
  schedulePassiveEffects(finishedWork);
}
```

## Work Loop and Scheduling

```javascript
// Simplified scheduler
function scheduleUpdateOnFiber(fiber, lane) {
  // Mark fiber for update
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  
  // Schedule work based on priority
  if (lane === SyncLane) {
    // Synchronous update (legacy mode)
    performSyncWorkOnRoot(root);
  } else {
    // Concurrent update
    ensureRootIsScheduled(root);
  }
}

function ensureRootIsScheduled(root) {
  const nextLanes = getNextLanes(root);
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  
  // Schedule callback with appropriate priority
  scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  );
}
```

## Priority Levels and Lanes

React uses a **lanes** model for priority:

```javascript
// Lane priorities (from highest to lowest)
const SyncLane = 0b0000000000000000000000000000001;
const InputContinuousLane = 0b0000000000000000000000000000100;
const DefaultLane = 0b0000000000000000000000000010000;
const TransitionLane = 0b0000000000000000000001000000000;
const IdleLane = 0b0100000000000000000000000000000;

// Example: High priority update
function onClick() {
  // Discrete event - SyncLane
  setCount(count + 1);
}

// Example: Lower priority update
function onScroll() {
  // Continuous event - InputContinuousLane
  setScrollPos(window.scrollY);
}
```

## Incremental Rendering

Fiber can pause work and resume later:

```javascript
function workLoopConcurrent() {
  // Check if we should yield to browser
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
  
  if (workInProgress !== null) {
    // More work remains, schedule continuation
    return RootInProgress;
  } else {
    // All work complete
    return RootCompleted;
  }
}

function shouldYield() {
  const currentTime = getCurrentTime();
  // Yield if frame time exceeded (typically 5ms)
  return currentTime >= deadline;
}
```

## Practical Example: Understanding the Flow

```javascript
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// What happens when button is clicked:
// 1. Event handler calls setCount
// 2. React creates an update object
// 3. Update is enqueued on the fiber's updateQueue
// 4. scheduleUpdateOnFiber is called
// 5. Render phase begins:
//    - App fiber is processed
//    - New children are reconciled
//    - div, h1, button fibers are updated
// 6. Commit phase:
//    - DOM mutations applied
//    - Layout effects run
//    - Passive effects scheduled
```

## Effect Flags

Fibers track what work needs to be done:

```javascript
// Effect flags
const NoFlags = 0b00000000000000000000000000;
const PerformedWork = 0b00000000000000000000000001;
const Placement = 0b00000000000000000000000010; // Insert
const Update = 0b00000000000000000000000100;    // Update
const Deletion = 0b00000000000000000000001000;  // Remove
const Ref = 0b00000000000000000100000000;       // Update ref
const Passive = 0b00000000000001000000000000;   // useEffect

// Checking flags
if (fiber.flags & Update) {
  // This fiber needs updating
}

if (fiber.flags & (Placement | Update)) {
  // This fiber needs placement or update
}
```

## Error Boundaries with Fiber

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Error info includes component stack
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Fiber handles errors by:
// 1. Capturing error during render
// 2. Walking up fiber tree to find error boundary
// 3. Calling getDerivedStateFromError
// 4. Re-rendering from error boundary
// 5. Calling componentDidCatch after commit
```

## Benefits of Fiber Architecture

1. **Incremental Rendering**: Work can be split across frames
2. **Pause, Abort, Reuse**: React can interrupt low-priority work
3. **Priority Levels**: Different updates can have different priorities
4. **Concurrent Features**: Enables concurrent mode features
5. **Better Error Handling**: Errors can be caught and handled gracefully

## Interview Questions

### Q: What problem does Fiber solve?

**A**: Before Fiber, React's reconciliation was synchronous and couldn't be interrupted. For large component trees, this could block the main thread for extended periods, causing janky UI. Fiber enables:
- Breaking work into chunks
- Prioritizing different types of updates
- Pausing and resuming work
- Aborting work that's no longer needed

### Q: How does Fiber enable concurrent rendering?

**A**: Fiber maintains work-in-progress trees that can be built asynchronously. The render phase is interruptible - React can pause work to handle high-priority updates, then resume where it left off. Only the commit phase is synchronous, ensuring consistent UI updates.

### Q: Explain the double buffering technique in Fiber.

**A**: React maintains two fiber trees:
- **current**: What's rendered on screen
- **workInProgress**: Being built during updates

React builds the workInProgress tree during reconciliation. When complete, it swaps pointers so workInProgress becomes current. This allows React to build a new tree without affecting the current screen until ready to commit.

### Q: What are lanes in React Fiber?

**A**: Lanes are a bitwise priority system that replaces the older expiration times model. Each lane represents a priority level for updates:
- SyncLane: Highest priority (user interactions)
- InputContinuousLane: Continuous events (scroll, drag)
- DefaultLane: Normal updates
- TransitionLanes: Deferred updates
- IdleLane: Lowest priority

Multiple lanes can be active simultaneously, and React processes them in priority order.

### Q: How does Fiber decide when to yield?

**A**: Fiber uses the scheduler's `shouldYield()` function, which checks if the current frame budget is exceeded (typically 5ms). If true, React yields control back to the browser to handle user input, animations, etc. Work continues in the next available frame.

## Performance Implications

```javascript
// Long blocking render (pre-Fiber or sync mode)
function HeavyComponent() {
  const items = new Array(10000).fill(0).map((_, i) => ({
    id: i,
    data: computeExpensiveValue(i) // Blocks for each item
  }));
  
  return <List items={items} />;
}

// With Fiber + concurrent features
function OptimizedComponent() {
  const [items, setItems] = useState([]);
  const deferredItems = useDeferredValue(items);
  
  useEffect(() => {
    // Can be interrupted
    const computed = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      data: computeExpensiveValue(i)
    }));
    setItems(computed);
  }, []);
  
  return <List items={deferredItems} />;
}
```

## Common Misconceptions

1. **"Fiber makes everything faster"**: Fiber enables better scheduling but doesn't automatically optimize your code
2. **"Render phase is always async"**: In legacy mode or with sync updates, render is still synchronous
3. **"Every update is interruptible"**: Only concurrent updates can be interrupted; sync updates complete immediately

## Best Practices

1. **Leverage concurrent features**: Use useTransition and useDeferredValue for better UX
2. **Don't block render**: Keep render functions pure and fast
3. **Use React DevTools Profiler**: Visualize fiber work and identify bottlenecks
4. **Understand priority**: Know which updates are urgent vs. deferrable
5. **Test with React StrictMode**: Double renders help catch issues with concurrent rendering

## Key Takeaways

- Fiber is a unit of work and reconciliation algorithm
- Enables incremental, interruptible rendering
- Uses double buffering for smooth updates
- Priority-based scheduling via lanes
- Foundation for concurrent React features
- Separates render (interruptible) from commit (synchronous)
