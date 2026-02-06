# Advanced React Hooks

## ⚡ Quick Revision

### useReducer
```tsx
type State = { count: number; error: string | null };
type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'error'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1, error: null };
    case 'decrement':
      return { ...state, count: state.count - 1, error: null };
    case 'error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
```

### useLayoutEffect
```tsx
useLayoutEffect(() => {
  // Runs synchronously after DOM mutations
  // Before browser paint
  const rect = elementRef.current?.getBoundingClientRect();
  setPosition(rect);
}, [dependency]);
```

### useImperativeHandle
```tsx
interface InputHandle {
  focus: () => void;
  clear: () => void;
}

const CustomInput = forwardRef<InputHandle, Props>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = '';
    }
  }));
  
  return <input ref={inputRef} {...props} />;
});
```

**Critical Facts:**
- useReducer for complex state logic with multiple sub-values
- useLayoutEffect runs synchronously before browser paint
- useImperativeHandle breaks encapsulation - use sparingly

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**useReducer motivations:**
- useState becomes unwieldy with complex state objects
- Multiple related state updates need coordination
- State transitions follow predictable patterns
- Better testing through pure reducer functions
- Optimization through dispatch stability

**useLayoutEffect necessity:**
- DOM measurements must happen before paint
- Prevents visual flicker from layout thrashing
- Synchronous execution for imperative DOM manipulation

**useImperativeHandle use cases:**
- Third-party library integration
- Focus management in form libraries
- Exposing animation controls
- Breaking React's data flow when absolutely necessary
</details>

<details>
<summary>How it works</summary>
**useReducer implementation concept:**
```tsx
function useReducer(reducer, initialState, init) {
  const [state, setState] = useState(
    init ? init(initialState) : initialState
  );
  
  const dispatch = useCallback((action) => {
    setState(prevState => reducer(prevState, action));
  }, [reducer]);
  
  return [state, dispatch];
}
```

**useLayoutEffect timing:**
```
1. React renders virtual DOM
2. DOM mutations applied
3. useLayoutEffect runs (blocks paint)
4. Browser paints
5. useEffect runs (after paint)
```

**useImperativeHandle pattern:**
```tsx
// Replaces the ref value
useImperativeHandle(ref, () => ({
  // Custom API instead of DOM element
}), [deps]);
```
</details>

<details>
<summary>Common misconceptions</summary>
**"useReducer is always better than useState":**
- useState is simpler for independent state values
- useReducer adds complexity - use when state logic is complex
- No performance benefit by default

**"useLayoutEffect should replace useEffect":**
- useLayoutEffect blocks painting - use sparingly
- Only when you need measurements or synchronous DOM manipulation
- Most effects should remain in useEffect

**"useImperativeHandle is an escape hatch":**
- It IS an escape hatch - avoid when possible
- Prefer controlled components and data flow
- Use for library integration, not application logic

**"Reducers must be pure functions":**
- They absolutely must be pure for predictability
- No side effects, API calls, or mutations
- Should be testable in isolation
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "When would you choose useReducer over useState?"
2. "Explain the difference between useEffect and useLayoutEffect"
3. "Why is useImperativeHandle considered an escape hatch?"
4. "How would you test a component using useReducer?"

**Advanced scenarios:**

**Complex form state management:**
```tsx
type FormState = {
  values: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
};

type FormAction = 
  | { type: 'FIELD_CHANGE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
        isDirty: true
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      };
    // ... other cases
  }
};
```

**Layout measurement example:**
```tsx
function Tooltip({ children, content }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
    }
  }); // No deps - runs after every render
  
  return (
    <>
      <span ref={triggerRef}>{children}</span>
      <Portal>
        <div style={{ position: 'absolute', ...position }}>
          {content}
        </div>
      </Portal>
    </>
  );
}
```

**Custom input with imperative API:**
```tsx
interface SearchInputRef {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(
  ({ onSearch }, ref) => {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        setValue('');
        inputRef.current?.focus();
      },
      getValue: () => value
    }), [value]);
    
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch(value);
        }}
      />
    );
  }
);
```
</details>