# Custom React Hooks

## ⚡ Quick Revision

### Basic Custom Hook Pattern
```tsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}
```

### Data Fetching Hook
```tsx
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setError(error.message);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, [url]);
  
  return { data, loading, error };
}
```

### Local Storage Hook
```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}
```

**Best Practices:**
- Start with "use" prefix
- Return objects for multiple values, arrays for pairs
- Use useCallback for returned functions
- Handle cleanup in useEffect
- Type return values with `as const` for tuples

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Code reusability:**
- Extract stateful logic from components
- Share complex state management across components
- Reduce duplication of effect patterns
- Create domain-specific abstractions

**Separation of concerns:**
- Components focus on UI rendering
- Hooks handle business logic and side effects
- Easier testing of isolated logic
- Better code organization

**Composition over inheritance:**
- Functional composition vs class inheritance
- Mix and match multiple hooks
- More flexible than HOCs or render props
</details>

<details>
<summary>How it works</summary>
**Hook composition principles:**
```tsx
// Hooks can use other hooks
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Combine multiple hooks
function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const { data, loading, error } = useApi(`/search?q=${debouncedQuery}`);
  
  return { query, setQuery, results: data, loading, error };
}
```

**Return value patterns:**
```tsx
// Array for related pair (like useState)
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle] as const;
}

// Object for multiple unrelated values
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Custom hooks are just functions":**
- They're functions that use other hooks
- Must follow hook rules (top-level only, consistent order)
- Each usage creates independent state

**"All logic should be in custom hooks":**
- Simple state doesn't need extraction
- Balance between reusability and complexity
- Don't over-abstract early

**"Custom hooks make components pure":**
- Components still have side effects through hooks
- Hooks encapsulate side effects, don't eliminate them
- Testing still requires mocking hook dependencies

**"Return arrays are always better":**
- Arrays for pairs (value/setter pattern)
- Objects when returning multiple unrelated values
- Consider destructuring patterns in usage
</details>

<details>
<summary>Interview angle</summary>
**Key questions to expect:**
1. "How do you decide what to extract into a custom hook?"
2. "What are the trade-offs between custom hooks and higher-order components?"
3. "How do you test custom hooks?"
4. "When would you return an array vs object from a custom hook?"

**Advanced patterns:**

**Async operation hook with cleanup:**
```tsx
function useAsyncOperation<T>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: false, error: null });
  
  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
      throw error;
    }
  }, []);
  
  return { ...state, execute };
}
```

**Form hook with validation:**
```tsx
type ValidationRule<T> = (value: T) => string | undefined;

function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule<any>[]>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field
    const rules = validationRules[field] || [];
    const fieldErrors = rules
      .map(rule => rule(value))
      .filter(Boolean);
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[0] || undefined
    }));
  }, [validationRules]);
  
  const setTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const isValid = Object.values(errors).every(error => !error);
  
  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    reset: () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
  };
}
```

**Testing custom hooks:**
```tsx
// Using @testing-library/react-hooks
import { renderHook, act } from '@testing-library/react-hooks';

test('useCounter should increment', () => {
  const { result } = renderHook(() => useCounter(0));
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

test('useApi should handle loading states', async () => {
  const { result, waitForNextUpdate } = renderHook(() => 
    useApi('/test')
  );
  
  expect(result.current.loading).toBe(true);
  
  await waitForNextUpdate();
  
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toBeDefined();
});
```
</details>