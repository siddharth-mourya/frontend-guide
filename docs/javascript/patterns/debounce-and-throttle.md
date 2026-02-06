# Debounce and Throttle

## ⚡ Quick Revision

- **Debounce:** Delays execution until after inactivity period
- **Throttle:** Limits execution to once per time period
- Debounce waits for silence, throttle maintains steady rate

**Use cases:**

Debounce:
- Search input (wait for user to stop typing)
- Window resize (wait for resize to finish)
- Form validation
- Auto-save drafts

Throttle:
- Scroll handlers
- Mouse movement tracking
- API rate limiting
- Infinite scroll

```javascript
// Debounce implementation
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const searchAPI = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 300);

input.addEventListener('input', (e) => searchAPI(e.target.value));

// Throttle implementation
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
const trackScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', trackScroll);
```

**Advanced implementations:**

```javascript
// Debounce with immediate execution option
function debounce(func, delay, immediate = false) {
  let timeoutId;
  
  return function(...args) {
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    
    if (callNow) func.apply(this, args);
  };
}

// Throttle with trailing execution
function throttle(func, limit, options = {}) {
  let inThrottle, lastFunc, lastRan;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        if (options.trailing && lastFunc) {
          func.apply(this, lastFunc);
        }
        inThrottle = false;
      }, limit);
    } else {
      lastFunc = args;
    }
  };
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
User interactions (typing, scrolling, resizing) fire events rapidly—hundreds of times per second. Executing expensive operations on every event causes performance issues and unnecessary API calls.

Debounce and throttle provide control over execution frequency, improving performance and user experience.
</details>

<details>
<summary>How it works</summary>
**Debounce mechanism:**
1. Function called
2. Start timer
3. If called again before timer expires, reset timer
4. Execute when timer completes without interruption

**Visual representation (300ms debounce):**
```
Events:  |---|--|-|-------|
         0  50 70 80     300ms
         
Execution:                 ✓
(Only executes after 300ms of silence)
```

**Throttle mechanism:**
1. Function called, execute immediately
2. Set cooldown flag
3. Ignore calls during cooldown
4. Reset flag after time period

**Visual representation (100ms throttle):**
```
Events:    |---|--|-|------|--|
           0  50 70 80   150 180
           
Execution: ✓          ✓
(Executes max once per 100ms)
```

**React implementation:**
```javascript
// Debounce in React
function SearchBox() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      fetch(`/api/search?q=${value}`);
    }, 300),
    []
  );
  
  useEffect(() => {
    return () => debouncedSearch.cancel?.();  // Cleanup
  }, []);
  
  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };
  
  return <input value={query} onChange={handleChange} />;
}

// Throttle in React
function ScrollTracker() {
  const handleScroll = useMemo(
    () => throttle(() => {
      console.log('Scroll:', window.scrollY);
    }, 100),
    []
  );
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return <div>Scroll me</div>;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
- Debounce and throttle aren't interchangeable
- Debounce doesn't guarantee execution (user may never stop activity)
- Throttle doesn't delay execution (first call executes immediately)
- Both need cleanup in React to prevent memory leaks
- Leading vs trailing execution changes behavior significantly
- Not a substitute for proper pagination/virtualization
</details>

<details>
<summary>Interview angle</summary>
Interviewers test:
- Implementing debounce/throttle from scratch
- Choosing between debounce and throttle for scenarios
- Handling edge cases (immediate execution, cancellation)
- React integration and cleanup
- Performance implications
- Adding features (leading/trailing, maxWait)
- Lodash comparison and alternative libraries
</details>
