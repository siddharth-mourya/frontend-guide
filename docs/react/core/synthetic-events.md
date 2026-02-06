# Synthetic Events

## ⚡ Quick Revision

- React wraps native events in `SyntheticEvent` objects
- Cross-browser compatible with consistent API
- Event pooling removed in React 17+ (was performance optimization)
- Event delegation: React attaches single listener at root
- Access native event via `e.nativeEvent`
- **Pitfall**: Can't access event asynchronously (pre-React 17), must call `e.persist()`
- **Pitfall**: React events use camelCase: `onClick`, not `onclick`

```jsx
function Button() {
  const handleClick = (e) => {
    // e is SyntheticEvent (React wrapper)
    e.preventDefault();
    e.stopPropagation();
    
    console.log(e.type);        // 'click'
    console.log(e.target);      // DOM element
    console.log(e.currentTarget); // DOM element
    console.log(e.nativeEvent); // Native browser event
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// Event pooling (React 16)
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ❌ React 16: e is nullified after handler
    setTimeout(() => {
      console.log(e.type); // null (pooled)
    }, 0);
    
    // ✅ React 16: Call persist() to keep it
    e.persist();
    setTimeout(() => {
      console.log(e.type); // 'submit'
    }, 0);
    
    // ✅ React 17+: Event pooling removed, always works
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Cross-browser compatibility:**
- Different browsers have different event APIs
- React normalizes event properties and methods
- Consistent behavior across all browsers
- No need for polyfills or compatibility checks

**Performance (event delegation):**
- React attaches one listener at root, not every element
- Reduces memory usage (fewer event listeners)
- Faster initial render (fewer DOM operations)
- Efficient event handling for dynamic content

**Additional features:**
- Automatic preventDefault/stopPropagation support
- Consistent event properties (React normalizes them)
- Better debugging (React DevTools integration)

</details>

<details>
<summary>How it works</summary>
**Event delegation:**
```jsx
// What you write:
function App() {
  return (
    <div>
      <button onClick={() => console.log('Button 1')}>Button 1</button>
      <button onClick={() => console.log('Button 2')}>Button 2</button>
      <button onClick={() => console.log('Button 3')}>Button 3</button>
    </div>
  );
}

// What React does:
// - Attach ONE listener to root (not 3 to buttons)
// - When click happens, React determines which handler to call
// - Calls appropriate handler with SyntheticEvent

// Benefits:
// - Memory: 1 listener instead of 1000s
// - Dynamic content: Adding/removing elements doesn't add/remove listeners
```

**SyntheticEvent properties:**
```jsx
function EventDetails() {
  const handleEvent = (e) => {
    // Standard event properties (cross-browser)
    console.log(e.type);          // 'click', 'change', etc.
    console.log(e.target);        // Element that triggered event
    console.log(e.currentTarget); // Element with handler attached
    console.log(e.bubbles);       // Boolean: does event bubble?
    console.log(e.cancelable);    // Boolean: can be cancelled?
    console.log(e.defaultPrevented); // Boolean: was prevented?
    console.log(e.eventPhase);    // 1=capture, 2=target, 3=bubble
    console.log(e.isTrusted);     // Boolean: user-generated?
    console.log(e.timeStamp);     // When event occurred
    
    // Mouse events
    console.log(e.clientX, e.clientY); // Mouse position (viewport)
    console.log(e.pageX, e.pageY);     // Mouse position (document)
    console.log(e.screenX, e.screenY); // Mouse position (screen)
    console.log(e.button);             // Which button clicked
    console.log(e.buttons);            // Which buttons pressed
    console.log(e.altKey, e.ctrlKey);  // Modifier keys
    console.log(e.shiftKey, e.metaKey);
    
    // Keyboard events
    console.log(e.key);        // 'a', 'Enter', 'Escape', etc.
    console.log(e.keyCode);    // Deprecated numeric code
    console.log(e.code);       // Physical key: 'KeyA', 'Enter'
    console.log(e.charCode);   // Deprecated character code
    
    // Form events
    console.log(e.target.value);   // Input value
    console.log(e.target.checked); // Checkbox state
    
    // Native event access
    console.log(e.nativeEvent); // Original browser event
  };
  
  return <button onClick={handleEvent}>Click</button>;
}
```

**Event propagation:**
```jsx
function Propagation() {
  const handleGrandparent = () => console.log('Grandparent');
  const handleParent = () => console.log('Parent');
  const handleChild = (e) => {
    console.log('Child');
    // e.stopPropagation(); // Stops bubbling to parent/grandparent
  };
  
  return (
    <div onClick={handleGrandparent}>
      <div onClick={handleParent}>
        <button onClick={handleChild}>Click</button>
      </div>
    </div>
  );
  // Click button: logs "Child", "Parent", "Grandparent"
  // With stopPropagation: logs only "Child"
}

// Capture phase (rare)
function CapturePhase() {
  const handleCaptureParent = () => console.log('Parent (capture)');
  const handleBubbleParent = () => console.log('Parent (bubble)');
  const handleChild = () => console.log('Child');
  
  return (
    <div
      onClickCapture={handleCaptureParent} // Capture phase
      onClick={handleBubbleParent}         // Bubble phase
    >
      <button onClick={handleChild}>Click</button>
    </div>
  );
  // Logs: "Parent (capture)", "Child", "Parent (bubble)"
}
```

**Native event differences:**
```jsx
function NativeVsSynthetic() {
  useEffect(() => {
    // Native event listener
    const button = document.getElementById('native-btn');
    
    button.addEventListener('click', (e) => {
      console.log('Native:', e); // Native Event
      // Different API across browsers
      // No automatic cleanup
    });
    
    return () => {
      button.removeEventListener('click', ...); // Must cleanup
    };
  }, []);
  
  // React synthetic event
  const handleReactClick = (e) => {
    console.log('Synthetic:', e); // SyntheticEvent
    // Consistent API
    // Automatic cleanup
  };
  
  return (
    <>
      <button id="native-btn">Native</button>
      <button onClick={handleReactClick}>React</button>
    </>
  );
}
```

**Event pooling (React 16 vs 17+):**
```jsx
// React 16: Event pooling for performance
function OldPooling() {
  const handleClick = (e) => {
    console.log(e.type); // 'click'
    
    // ❌ Async access fails (event nullified)
    setTimeout(() => {
      console.log(e.type); // null
    }, 0);
    
    // ✅ persist() prevents pooling
    e.persist();
    setTimeout(() => {
      console.log(e.type); // 'click'
    }, 0);
    
    // ✅ Extract values immediately
    const eventType = e.type;
    setTimeout(() => {
      console.log(eventType); // 'click'
    }, 0);
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// React 17+: No pooling, always safe
function NewNoPooling() {
  const handleClick = (e) => {
    // ✅ Async access works
    setTimeout(() => {
      console.log(e.type); // 'click'
    }, 0);
    
    // persist() is now a no-op
    e.persist(); // Does nothing, but doesn't break
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

**Custom events:**
```jsx
function CustomEvent() {
  const handleCustom = (data) => {
    console.log('Custom event:', data);
  };
  
  return (
    <Child onCustomEvent={handleCustom} />
  );
}

function Child({ onCustomEvent }) {
  const handleClick = () => {
    // Call parent callback (not a real DOM event)
    onCustomEvent({ foo: 'bar' });
  };
  
  return <button onClick={handleClick}>Trigger</button>;
}
```

**Preventing defaults:**
```jsx
function PreventDefaults() {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Form submitted (prevented)');
  };
  
  const handleLink = (e) => {
    e.preventDefault(); // Prevent navigation
    console.log('Link clicked (prevented)');
  };
  
  const handleContext = (e) => {
    e.preventDefault(); // Prevent context menu
    console.log('Right-clicked (prevented)');
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
      
      <a href="https://example.com" onClick={handleLink}>
        Link
      </a>
      
      <div onContextMenu={handleContext}>
        Right-click me
      </div>
    </>
  );
}

// Return false doesn't work in React
function ReturnFalse() {
  const handleClick = () => {
    return false; // ❌ Doesn't prevent default in React
  };
  
  const handleClickCorrect = (e) => {
    e.preventDefault(); // ✅ Correct way
  };
  
  return <a href="#" onClick={handleClickCorrect}>Link</a>;
}
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"Synthetic events are slower"** - They're comparable, event delegation is faster
- **"You can't access native events"** - Use `e.nativeEvent`
- **"Event pooling still exists"** - Removed in React 17+
- **"Return false prevents default"** - Must use `e.preventDefault()` in React
- **"React adds listeners to every element"** - One listener at root (delegation)
- **"Synthetic events are different"** - They implement same interface as native

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **Why synthetic events**: Cross-browser consistency
- **Event delegation**: Performance benefits
- **Event pooling**: Changes between React versions
- **Differences from native**: API variations

Critical concepts to explain:
- **Event delegation**: Single listener at root
- **SyntheticEvent interface**: Normalized cross-browser API
- **Event pooling**: React 16 vs 17+ differences
- **Capture vs bubble**: Event propagation phases
- **Native event access**: When and why to use `nativeEvent`

Common questions:
- "What are synthetic events in React?"
- "Why does React use synthetic events instead of native?"
- "What is event pooling and has it changed?"
- "How do you access the native event?"
- "What's the difference between target and currentTarget?"
- "How does event delegation work in React?"
- "Can you use return false to prevent default?"

Key talking points:
- React wraps native events for consistency
- Event delegation improves performance
- Pooling removed in React 17 (simpler, no persist needed)
- Same API as native events (mostly)
- stopPropagation and preventDefault work as expected
- Access native event via `e.nativeEvent` when needed

</details>

---

## 📝 Code Examples

<details>
<summary>Event handling patterns</summary>
```jsx
// Debounced input
function DebouncedInput() {
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  const handleChange = (e) => {
    // Event is safe to use in React 17+
    setValue(e.target.value);
  };
  
  return (
    <div>
      <input value={value} onChange={handleChange} />
      <p>Debounced: {debouncedValue}</p>
    </div>
  );
}

// Keyboard shortcuts
function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search shortcut');
      }
      
      // Check for Escape
      if (e.key === 'Escape') {
        console.log('Close modal');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return <div>Press Cmd/Ctrl + K</div>;
}

// Mouse tracking
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    // Extract values immediately (good practice)
    const x = e.clientX;
    const y = e.clientY;
    
    // Safe to use in setState
    setPosition({ x, y });
  };
  
  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ height: '100vh' }}
    >
      Mouse at ({position.x}, {position.y})
    </div>
  );
}

// Drag and drop
function DragDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, offset]);
  
  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      Drag me
    </div>
  );
}

// Focus management
function FocusManagement() {
  const inputRef = useRef();
  
  const handleFocus = (e) => {
    console.log('Focused:', e.target.name);
  };
  
  const handleBlur = (e) => {
    console.log('Blurred:', e.target.name);
  };
  
  const handleFormFocus = (e) => {
    // currentTarget = element with handler (form)
    // target = element that triggered event (input)
    console.log('Form focused (bubbled from:', e.target.name, ')');
  };
  
  return (
    <form onFocus={handleFormFocus}>
      <input
        ref={inputRef}
        name="email"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <input
        name="password"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </form>
  );
}

// Mixing React and native events
function MixedEvents() {
  const divRef = useRef();
  
  useEffect(() => {
    const div = divRef.current;
    
    // Native listener (capture phase)
    div.addEventListener('click', (e) => {
      console.log('Native capture');
    }, true);
    
    // Native listener (bubble phase)
    div.addEventListener('click', (e) => {
      console.log('Native bubble');
    });
    
    return () => {
      div.removeEventListener('click', ...);
    };
  }, []);
  
  const handleReactClick = () => {
    console.log('React click');
  };
  
  // Order: Native capture → React capture → React bubble → Native bubble
  return (
    <div ref={divRef} onClick={handleReactClick}>
      Click me
    </div>
  );
}
```

</details>

<details>
<summary>Event delegation patterns</summary>
```jsx
// List with single handler (efficient)
function ListWithDelegation({ items }) {
  const handleItemClick = (e) => {
    // Use event delegation to handle clicks on any item
    const itemId = e.target.closest('[data-id]')?.dataset.id;
    if (itemId) {
      console.log('Clicked item:', itemId);
    }
  };
  
  return (
    <ul onClick={handleItemClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// Dynamic content with delegation
function DynamicList() {
  const [items, setItems] = useState([]);
  
  const handleClick = (e) => {
    // Works for dynamically added items
    if (e.target.matches('.delete-btn')) {
      const id = e.target.dataset.id;
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  return (
    <div onClick={handleClick}>
      {items.map(item => (
        <div key={item.id}>
          {item.name}
          <button className="delete-btn" data-id={item.id}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

</details>
