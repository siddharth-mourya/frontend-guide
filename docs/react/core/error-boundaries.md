# Error Boundaries

## ⚡ Quick Revision
- Class components that catch JavaScript errors in component tree
- Only catch errors during render, lifecycle methods, and constructors
- **Pitfall**: Don't catch errors in event handlers, async code, or SSR
- **Pitfall**: Must be class components - no hooks equivalent yet
- Two lifecycle methods: `getDerivedStateFromError` and `componentDidCatch`

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Before Error Boundaries, a JavaScript error anywhere in the component tree would:
- Crash the entire React app
- Show blank white screen to users
- Provide poor debugging information
- Make apps fragile and unreliable

Error Boundaries provide:
1. **Graceful degradation**: Show fallback UI instead of crashing
2. **Error isolation**: Contain errors to specific UI sections
3. **Better UX**: Users see meaningful error messages
4. **Debugging**: Capture error info for monitoring/logging
5. **Resilience**: App continues working outside error boundary

</details>

<details>
<summary>How it works</summary>
**Error catching scope:**
- ✅ **Render errors**: JSX compilation, component logic
- ✅ **Lifecycle errors**: componentDidMount, useEffect, etc.
- ✅ **Constructor errors**: Component initialization
- ❌ **Event handler errors**: onClick, onSubmit, etc.
- ❌ **Async errors**: setTimeout, fetch, promises
- ❌ **SSR errors**: Server-side rendering issues

**Lifecycle methods:**

1. **`getDerivedStateFromError(error)`**:
   - Static method called during render phase
   - Must return state object to update state
   - Used to show fallback UI
   - Should not cause side effects

2. **`componentDidCatch(error, errorInfo)`**:
   - Called during commit phase
   - Can cause side effects (logging, reporting)
   - Receives error details and component stack trace
   - Should not update state (use getDerivedStateFromError)

**Error propagation:**
- Errors bubble up to nearest Error Boundary
- Multiple boundaries can create isolated error zones
- No boundary = app crashes with white screen

</details>

<details>
<summary>Common misconceptions</summary>
- **"Error Boundaries catch all errors"** - Only catch render/lifecycle errors, not events or async
- **"You need Error Boundaries everywhere"** - Strategic placement is better than wrapping everything  
- **"Error Boundaries work with hooks"** - Only class components; no useState equivalent
- **"componentDidCatch updates state"** - Use getDerivedStateFromError for state updates
- **"One Error Boundary per app"** - Multiple boundaries enable better error isolation
- **"Error Boundaries prevent all crashes"** - Event handler errors still need try/catch

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **Error handling strategy**: Where and how to place boundaries
- **Limitations**: What errors are NOT caught
- **Production considerations**: Error reporting and monitoring integration
- **Architecture**: Building resilient React applications

Key scenarios to discuss:

**Strategic placement:**
```jsx
// App-level boundary (last resort)
<ErrorBoundary fallback={<AppCrashFallback />}>
  <App />
</ErrorBoundary>

// Feature-level boundaries (isolated failures)
<ErrorBoundary fallback={<FeatureFallback />}>
  <UserProfile />
</ErrorBoundary>

// Component-level (granular isolation)
<ErrorBoundary fallback={<WidgetFallback />}>
  <ComplexWidget />
</ErrorBoundary>
```

**Production patterns:**
- Error reporting integration (Sentry, Bugsnag)
- Retry mechanisms and error recovery
- Fallback UI design and UX considerations

Common questions:
- "What types of errors do Error Boundaries NOT catch?"
- "How would you structure Error Boundaries in a large app?"
- "How do you handle errors in event handlers?"
- "What's the difference between the two error lifecycle methods?"
- "How would you implement error reporting in production?"

</details>