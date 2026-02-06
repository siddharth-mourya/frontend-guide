# Render and Commit Phases

## Overview

React's work is divided into two distinct phases:
1. **Render Phase**: Calculate what changes are needed (can be interrupted)
2. **Commit Phase**: Apply changes to DOM (synchronous and atomic)

Understanding these phases is crucial for performance optimization and avoiding bugs.

## Render Phase (Reconciliation)

### Characteristics

- **Interruptible**: Can be paused, aborted, or restarted
- **Pure**: Should have no side effects
- **Can run multiple times**: Same update might be processed repeatedly
- **Async in Concurrent Mode**: Work can be split across frames

### What Happens

```javascript
function renderPhase(fiber) {
  // 1. Call render methods/functions
  const element = Component(props);
  
  // 2. Reconcile children (diff algorithm)
  reconcileChildren(fiber, element);
  
  // 3. Mark effects
  fiber.flags |= Update;
  
  // 4. Process children
  return fiber.child;
}
```

### Render Phase Steps

```javascript
function performUnitOfWork(workInProgress) {
  const current = workInProgress.alternate;
  
  // Begin work - process this fiber
  let next = beginWork(current, workInProgress);
  
  // Update memoized props
  workInProgress.memoizedProps = workInProgress.pendingProps;
  
  if (next === null) {
    // No child, complete this unit
    completeUnitOfWork(workInProgress);
  } else {
    // Process child next
    return next;
  }
}

function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      const props = workInProgress.pendingProps;
      
      // Call the function component
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        props
      );
    }
    case ClassComponent: {
      const instance = workInProgress.stateNode;
      // Call render method
      const nextChildren = instance.render();
      reconcileChildren(current, workInProgress, nextChildren);
      return workInProgress.child;
    }
    // ... other component types
  }
}
```

### During Render Phase

```javascript
function MyComponent() {
  // ✅ Safe during render
  const [state, setState] = useState(0);
  const computed = useMemo(() => expensive(state), [state]);
  const memoizedCallback = useCallback(() => {}, []);
  
  // ❌ WRONG - Side effects during render
  document.title = 'New Title'; // Don't mutate
  localStorage.setItem('key', 'value'); // Don't perform side effects
  setState(state + 1); // Don't update state directly
  
  // ❌ WRONG - Non-deterministic
  const random = Math.random(); // Avoid non-pure operations
  
  // ✅ Correct - Pure computations
  const doubled = state * 2;
  const filtered = items.filter(item => item.active);
  
  return <div>{computed}</div>;
}
```

## Commit Phase

### Characteristics

- **Synchronous**: Cannot be interrupted
- **Single pass**: Runs once per update
- **Side effects allowed**: This is where mutations happen
- **Three sub-phases**: Before mutation, mutation, layout

### Commit Phase Structure

```javascript
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // Save before we start mutating
  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  
  // === Sub-phase 1: Before Mutation ===
  commitBeforeMutationEffects(finishedWork);
  // - getSnapshotBeforeUpdate (class components)
  // - Schedule useEffect cleanup
  
  // === Sub-phase 2: Mutation ===
  commitMutationEffects(finishedWork, root);
  // - DOM mutations (insertions, updates, deletions)
  // - Ref detachments
  
  // Switch current tree
  root.current = finishedWork;
  
  // === Sub-phase 3: Layout ===
  commitLayoutEffects(finishedWork, root);
  // - componentDidMount/componentDidUpdate
  // - useLayoutEffect
  // - Ref attachments
  
  // === Sub-phase 4: Passive Effects (scheduled) ===
  if (rootDidHavePassiveEffects) {
    scheduleCallback(NormalPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
}
```

### Sub-phase 1: Before Mutation

Called before DOM mutations:

```javascript
function commitBeforeMutationEffects(finishedWork) {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;
    
    if (nextEffect.flags & Snapshot) {
      // Call getSnapshotBeforeUpdate
      if (current !== null) {
        const snapshot = instance.getSnapshotBeforeUpdate(
          prevProps,
          prevState
        );
        instance.__reactInternalSnapshotBeforeUpdate = snapshot;
      }
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

// Example usage
class ScrollPosition extends React.Component {
  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Capture scroll position before DOM updates
    if (prevProps.list.length < this.props.list.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    // Restore scroll position after DOM updates
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }
}
```

### Sub-phase 2: Mutation

Perform DOM mutations:

```javascript
function commitMutationEffects(finishedWork, root) {
  while (nextEffect !== null) {
    const flags = nextEffect.flags;
    
    // Reset text content
    if (flags & ContentReset) {
      commitResetTextContent(nextEffect);
    }
    
    // Update refs (detach old)
    if (flags & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    
    // DOM mutations
    const primaryFlags = flags & (Placement | Update | Deletion);
    switch (primaryFlags) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.flags &= ~Placement;
        break;
      }
      case Update: {
        commitWork(current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect);
        break;
      }
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  const before = getHostSibling(finishedWork);
  
  // Insert into DOM
  if (before) {
    parent.insertBefore(finishedWork.stateNode, before);
  } else {
    parent.appendChild(finishedWork.stateNode);
  }
}
```

### Sub-phase 3: Layout Effects

Run synchronous effects after DOM mutations:

```javascript
function commitLayoutEffects(finishedWork, root) {
  while (nextEffect !== null) {
    const flags = nextEffect.flags;
    
    // Lifecycle methods and layout effects
    if (flags & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLayoutEffectOnFiber(root, current, nextEffect);
    }
    
    // Attach refs
    if (flags & Ref) {
      commitAttachRef(nextEffect);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

function commitLayoutEffectOnFiber(root, current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // Call useLayoutEffect
      commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      break;
    }
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.flags & Update) {
        if (current === null) {
          // Mount
          instance.componentDidMount();
        } else {
          // Update
          const snapshot = instance.__reactInternalSnapshotBeforeUpdate;
          instance.componentDidUpdate(prevProps, prevState, snapshot);
        }
      }
      break;
    }
  }
}
```

### Sub-phase 4: Passive Effects (useEffect)

Scheduled to run asynchronously after paint:

```javascript
function flushPassiveEffects() {
  // Cleanup phase
  while (nextEffect !== null) {
    const destroy = effect.destroy;
    if (destroy !== undefined) {
      destroy(); // Call cleanup functions
    }
    nextEffect = nextEffect.nextEffect;
  }
  
  // Effect phase
  nextEffect = firstEffect;
  while (nextEffect !== null) {
    const create = effect.create;
    effect.destroy = create(); // Call effect and store cleanup
    nextEffect = nextEffect.nextEffect;
  }
}
```

## Effect Timing Diagram

```
Render Phase (Interruptible)
├── Component functions called
├── Hooks processed
├── Children reconciled
└── Virtual tree updated

Commit Phase (Synchronous)
├── Before Mutation
│   └── getSnapshotBeforeUpdate
├── Mutation
│   ├── DOM insertions
│   ├── DOM updates
│   └── DOM deletions
├── Layout
│   ├── useLayoutEffect cleanup
│   ├── useLayoutEffect
│   ├── componentDidMount/Update
│   └── Ref updates
└── (After paint) Passive
    ├── useEffect cleanup
    └── useEffect
```

## Hook Execution Order

```javascript
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // Executed during RENDER phase
  console.log('1. Render phase');
  
  useLayoutEffect(() => {
    // Executed during COMMIT phase (layout sub-phase)
    // BEFORE browser paint
    console.log('2. useLayoutEffect');
    
    return () => {
      // Cleanup before next layout effect or unmount
      console.log('2a. useLayoutEffect cleanup');
    };
  });
  
  useEffect(() => {
    // Executed AFTER browser paint (passive sub-phase)
    console.log('3. useEffect');
    
    return () => {
      // Cleanup before next effect or unmount
      console.log('3a. useEffect cleanup');
    };
  });
  
  return <div>{count}</div>;
}

// On initial mount:
// 1. Render phase
// 2. useLayoutEffect
// 3. useEffect

// On update:
// 1. Render phase
// 2a. useLayoutEffect cleanup
// 2. useLayoutEffect
// 3a. useEffect cleanup
// 3. useEffect

// On unmount:
// 2a. useLayoutEffect cleanup
// 3a. useEffect cleanup
```

## Practical Examples

### Measuring DOM After Update

```javascript
function ResizablePanel() {
  const ref = useRef();
  const [height, setHeight] = useState(0);
  
  // ❌ Wrong - height will be stale
  useEffect(() => {
    setHeight(ref.current.scrollHeight);
  }, []);
  
  // ✅ Correct - measure before paint
  useLayoutEffect(() => {
    setHeight(ref.current.scrollHeight);
  }, []);
  
  return <div ref={ref} style={{ height }}>Content</div>;
}
```

### Coordinating Multiple Effects

```javascript
function AnimatedComponent() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Layout effect - setup before paint
  useLayoutEffect(() => {
    if (isVisible) {
      // Measure and position element
      element.style.transform = 'translateX(0)';
    }
  }, [isVisible]);
  
  // Passive effect - trigger animation after paint
  useEffect(() => {
    if (isVisible) {
      // Start animation
      element.classList.add('animate');
    }
  }, [isVisible]);
}
```

### Snapshot Before Update

```javascript
class ChatThread extends React.Component {
  getSnapshotBeforeUpdate(prevProps) {
    // Capture whether user was scrolled to bottom
    if (prevProps.messages.length < this.props.messages.length) {
      const list = this.listRef.current;
      const isAtBottom = 
        list.scrollHeight - list.scrollTop === list.clientHeight;
      return isAtBottom;
    }
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    // Auto-scroll if was at bottom
    if (snapshot === true) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight;
    }
  }
  
  render() {
    return (
      <div ref={this.listRef}>
        {this.props.messages.map(msg => (
          <Message key={msg.id} {...msg} />
        ))}
      </div>
    );
  }
}
```

## Common Pitfalls

### 1. Side Effects in Render Phase

```javascript
// ❌ WRONG
function BadComponent() {
  // This runs during render phase
  // Can execute multiple times!
  fetch('/api/data'); // Side effect during render
  localStorage.setItem('key', 'value'); // Mutation during render
  
  return <div>Bad</div>;
}

// ✅ CORRECT
function GoodComponent() {
  useEffect(() => {
    // Side effects belong in effects
    fetch('/api/data');
    localStorage.setItem('key', 'value');
  }, []);
  
  return <div>Good</div>;
}
```

### 2. Wrong Effect Hook Choice

```javascript
// ❌ Causes flash - effect runs after paint
function FlashyComponent({ color }) {
  const [bgColor, setBgColor] = useState('white');
  
  useEffect(() => {
    // User sees white, then color
    setBgColor(color);
  }, [color]);
  
  return <div style={{ backgroundColor: bgColor }}>Content</div>;
}

// ✅ No flash - layout effect runs before paint
function SmoothComponent({ color }) {
  const [bgColor, setBgColor] = useState('white');
  
  useLayoutEffect(() => {
    // User sees color immediately
    setBgColor(color);
  }, [color]);
  
  return <div style={{ backgroundColor: bgColor }}>Content</div>;
}
```

### 3. Reading Layout in useEffect

```javascript
// ❌ Race condition - DOM might not be updated yet
function BadMeasure() {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Might read old width
    setWidth(ref.current.offsetWidth);
  }, []);
  
  return <div ref={ref}>Content</div>;
}

// ✅ Correct - read layout synchronously
function GoodMeasure() {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  
  useLayoutEffect(() => {
    // Guaranteed to read new width
    setWidth(ref.current.offsetWidth);
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

## Interview Questions

### Q: What's the difference between render and commit phases?

**A**: The render phase is where React calculates what changes are needed by calling component functions and reconciling children. It's interruptible and can run multiple times. The commit phase is where React applies changes to the DOM - it's synchronous, runs once, and is where side effects are allowed.

### Q: Why are there separate phases?

**A**: Separation allows React to:
1. Optimize by batching DOM updates
2. Interrupt low-priority renders for high-priority updates
3. Ensure DOM updates are atomic (commit phase is synchronous)
4. Keep render phase pure for better predictability
5. Enable concurrent features

### Q: When should you use useLayoutEffect vs useEffect?

**A**: Use `useLayoutEffect` when you need to:
- Read layout from the DOM (measurements)
- Make DOM mutations that should be visible immediately
- Prevent visual inconsistencies

Use `useEffect` for everything else (data fetching, subscriptions, etc.) as it doesn't block the browser paint.

### Q: Can the render phase have side effects?

**A**: No. The render phase should be pure because:
1. It can be called multiple times for the same update
2. React might abort and restart it
3. In concurrent mode, multiple versions might be rendered
Keep side effects in useEffect, useLayoutEffect, or event handlers.

### Q: What happens during each commit sub-phase?

**A**:
1. **Before Mutation**: `getSnapshotBeforeUpdate` - capture info before DOM changes
2. **Mutation**: Actual DOM insertions, updates, deletions
3. **Layout**: `useLayoutEffect`, `componentDidMount/Update`, ref updates - runs synchronously before paint
4. **Passive**: `useEffect` - runs asynchronously after paint

## Performance Considerations

```javascript
// Heavy layout effect blocks paint
function BlockingComponent() {
  useLayoutEffect(() => {
    // This blocks the browser paint
    for (let i = 0; i < 1000000; i++) {
      heavyComputation();
    }
  }, []);
  
  return <div>Blocked</div>;
}

// Better - defer non-critical work
function NonBlockingComponent() {
  useLayoutEffect(() => {
    // Critical layout work only
    measureElement();
  }, []);
  
  useEffect(() => {
    // Heavy work after paint
    for (let i = 0; i < 1000000; i++) {
      heavyComputation();
    }
  }, []);
  
  return <div>Smooth</div>;
}
```

## Key Takeaways

- Render phase: Pure, interruptible, calculates changes
- Commit phase: Synchronous, applies changes, allows side effects
- Commit has 4 sub-phases: before mutation, mutation, layout, passive
- `useLayoutEffect` runs synchronously before paint
- `useEffect` runs asynchronously after paint
- Choose the right hook for the job to optimize performance
- Never put side effects in render phase
