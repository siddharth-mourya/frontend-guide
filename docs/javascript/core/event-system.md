# Event System

## ⚡ Quick Revision

- **Event Bubbling**: Events propagate from target to root (default)
- **Event Capturing**: Events propagate from root to target (rare)
- **Event Delegation**: Attach listener to parent, handle child events
- **preventDefault()**: Stop default browser action (e.g., form submit)
- **stopPropagation()**: Stop event from bubbling/capturing
- **Event object**: Contains info about event (target, type, coordinates, etc.)

### Key Points

- Events have 3 phases: capturing, target, bubbling
- `addEventListener` third parameter controls capturing (default: false/bubbling)
- Event delegation more efficient than multiple listeners
- `this` in event handler refers to element (unless arrow function)
- `event.target` is element that triggered event, `event.currentTarget` is element with listener
- Modern events: passive listeners for better scroll performance

### Event Basics

```javascript
// Add event listener
element.addEventListener('click', handler);

// With options
element.addEventListener('click', handler, {
  capture: false, // Use bubbling (default)
  once: true,     // Remove after first trigger
  passive: true   // Won't call preventDefault (better scroll perf)
});

// Remove event listener (must use same function reference)
element.removeEventListener('click', handler);

// Handler function
function handler(event) {
  console.log('Event type:', event.type);
  console.log('Target:', event.target);
  console.log('Current target:', event.currentTarget);
}

// Old way (avoid)
element.onclick = handler; // Only one handler allowed
```

### Event Bubbling

```javascript
<div id="outer">
  <div id="middle">
    <button id="inner">Click</button>
  </div>
</div>

// Add listeners to all three
document.getElementById('outer').addEventListener('click', () => {
  console.log('Outer clicked');
});

document.getElementById('middle').addEventListener('click', () => {
  console.log('Middle clicked');
});

document.getElementById('inner').addEventListener('click', () => {
  console.log('Inner clicked');
});

// Click button output:
// "Inner clicked"   (target phase)
// "Middle clicked"  (bubbling)
// "Outer clicked"   (bubbling)

// Stop bubbling
button.addEventListener('click', (event) => {
  console.log('Button clicked');
  event.stopPropagation(); // Stops here, doesn't bubble
});
```

### Event Capturing

```javascript
// Use capturing phase (root to target)
outer.addEventListener('click', () => {
  console.log('Outer (capturing)');
}, true); // true = capturing

middle.addEventListener('click', () => {
  console.log('Middle (capturing)');
}, true);

button.addEventListener('click', () => {
  console.log('Button (target)');
});

// Click button output:
// "Outer (capturing)"   (capturing phase)
// "Middle (capturing)"  (capturing phase)
// "Button (target)"     (target phase)
```

### Event Delegation

```javascript
// Instead of listener on each item
// BAD: Many listeners
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// GOOD: Single listener on parent
document.querySelector('.list').addEventListener('click', (event) => {
  // Check if clicked element matches selector
  if (event.target.matches('.item')) {
    handleClick(event);
  }
  
  // Or use closest to handle nested elements
  const item = event.target.closest('.item');
  if (item) {
    handleClick(event, item);
  }
});

// Benefits:
// 1. Fewer listeners = better performance
// 2. Works with dynamically added elements
// 3. Less memory usage

// Example: Dynamic todo list
todoList.addEventListener('click', (event) => {
  if (event.target.matches('.delete-btn')) {
    const todo = event.target.closest('.todo-item');
    todo.remove();
  }
  
  if (event.target.matches('.complete-checkbox')) {
    const todo = event.target.closest('.todo-item');
    todo.classList.toggle('completed');
  }
});
```

### preventDefault and stopPropagation

```javascript
// preventDefault - stop default browser action
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission
  
  // Custom handling
  const data = new FormData(event.target);
  fetch('/api', { method: 'POST', body: data });
});

link.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent navigation
  // Custom routing
});

// stopPropagation - stop event propagation
button.addEventListener('click', (event) => {
  event.stopPropagation(); // Don't bubble to parent
  console.log('Button clicked');
});

parent.addEventListener('click', () => {
  console.log('Parent clicked'); // Won't fire if button clicked
});

// stopImmediatePropagation - stop all handlers on this element
button.addEventListener('click', (event) => {
  event.stopImmediatePropagation();
  console.log('First handler');
});

button.addEventListener('click', () => {
  console.log('Second handler'); // Won't fire
});
```

### Common Pitfalls

```javascript
// Pitfall 1: Removing listeners with different function references
// WON'T WORK
element.addEventListener('click', () => console.log('clicked'));
element.removeEventListener('click', () => console.log('clicked')); // Different function!

// FIX: Use same reference
const handler = () => console.log('clicked');
element.addEventListener('click', handler);
element.removeEventListener('click', handler); // Works!

// Pitfall 2: Event delegation with stopPropagation
child.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevents delegation from working!
});

parent.addEventListener('click', () => {
  console.log('Never fires when child clicked');
});

// Pitfall 3: `this` in arrow functions
element.addEventListener('click', function() {
  console.log(this); // element
});

element.addEventListener('click', () => {
  console.log(this); // window/undefined (lexical this)
});

// Pitfall 4: Memory leaks with listeners
function createComponent() {
  const button = document.createElement('button');
  button.addEventListener('click', () => {
    // Handler references outer scope, prevents GC
  });
  return button;
}

// FIX: Remove listeners on cleanup
function createComponent() {
  const button = document.createElement('button');
  const handler = () => { /* ... */ };
  button.addEventListener('click', handler);
  
  button.cleanup = () => {
    button.removeEventListener('click', handler);
  };
  
  return button;
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Early Web (1990s)

**No Event System**
```html
<!-- Inline event handlers -->
<button onclick="alert('Clicked')">Click</button>

<!-- Problems:
- Mixed HTML and JavaScript
- Hard to maintain
- Can't attach multiple handlers
- No way to prevent default action
-->
```

**DOM Level 0 Events (Late 1990s)**
```javascript
// Property-based handlers
button.onclick = function() {
  alert('Clicked');
};

// Problems:
// - Only one handler per event
// - No capturing/bubbling control
// - Limited event info
```

**DOM Level 2 Events (2000)**
```javascript
// Modern event system
button.addEventListener('click', handler, options);

// Benefits:
// - Multiple handlers per event
// - Capturing and bubbling control
// - Rich event object
// - Better memory management
```

### Why Event Delegation?

**Performance Problem**
```javascript
// 1000 list items, 1000 listeners
items.forEach(item => {
  item.addEventListener('click', handler);
});

// Issues:
// - Memory: 1000 function references
// - Attachment time: 1000 operations
// - Dynamic content: Need to add listeners to new items
```

**Event Delegation Solution**
```javascript
// 1 listener on parent
list.addEventListener('click', (event) => {
  if (event.target.matches('.item')) {
    handler(event);
  }
});

// Benefits:
// - Memory: 1 function reference
// - Performance: 1 operation
// - Dynamic: Works with new items automatically
```
</details>

<details>
<summary>How it works</summary>
### Event Phases

```javascript
// 3 phases of event propagation

<div id="outer">
  <div id="middle">
    <button id="button">Click</button>
  </div>
</div>

// 1. CAPTURING PHASE (root to target)
// window -> document -> html -> body -> outer -> middle -> button

// 2. TARGET PHASE
// button (target element)

// 3. BUBBLING PHASE (target to root)
// button -> middle -> outer -> body -> html -> document -> window

// Example with all phases
outer.addEventListener('click', () => {
  console.log('Outer (capturing)');
}, true); // Capturing

outer.addEventListener('click', () => {
  console.log('Outer (bubbling)');
}); // Bubbling

button.addEventListener('click', () => {
  console.log('Button (target)');
});

// Output when clicking button:
// "Outer (capturing)"  - Capturing phase
// "Button (target)"    - Target phase
// "Outer (bubbling)"   - Bubbling phase
```

### Event Object Properties

```javascript
element.addEventListener('click', (event) => {
  // Target vs CurrentTarget
  event.target;        // Element that triggered event
  event.currentTarget; // Element with listener (same as 'this')
  
  // Event details
  event.type;          // 'click'
  event.timeStamp;     // When event occurred
  event.isTrusted;     // true if user-initiated
  
  // Mouse events
  event.clientX, event.clientY;   // Viewport coordinates
  event.pageX, event.pageY;       // Document coordinates
  event.screenX, event.screenY;   // Screen coordinates
  event.button;                   // Which mouse button
  
  // Keyboard events
  event.key;           // 'a', 'Enter', 'ArrowUp'
  event.code;          // 'KeyA', 'Enter', 'ArrowUp'
  event.ctrlKey;       // Ctrl pressed?
  event.shiftKey;      // Shift pressed?
  event.altKey;        // Alt pressed?
  event.metaKey;       // Cmd/Win pressed?
  
  // Methods
  event.preventDefault();           // Prevent default action
  event.stopPropagation();          // Stop bubbling/capturing
  event.stopImmediatePropagation(); // Stop all handlers
});
```

### Event Loop Integration

```javascript
// Events are processed via event loop

// 1. User clicks button
// 2. Browser creates event object
// 3. Event placed in task queue
// 4. Event loop picks up event
// 5. Event goes through propagation phases
// 6. Handlers execute

// Events are asynchronous
console.log('1');

button.addEventListener('click', () => {
  console.log('2'); // Executes when clicked
});

console.log('3');

// Output immediately: 1, 3
// Output when clicked: 2
```

### Custom Events

```javascript
// Create custom event
const customEvent = new CustomEvent('myevent', {
  detail: { message: 'Hello' },
  bubbles: true,
  cancelable: true
});

// Listen for custom event
element.addEventListener('myevent', (event) => {
  console.log(event.detail.message); // 'Hello'
});

// Dispatch event
element.dispatchEvent(customEvent);

// Real-world example: Component communication
class Component {
  constructor(element) {
    this.element = element;
  }
  
  emit(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }
}

// Usage
const component = new Component(document.querySelector('.component'));
component.element.addEventListener('dataChanged', (e) => {
  console.log('New data:', e.detail);
});

component.emit('dataChanged', { value: 42 });
```

### Passive Event Listeners

```javascript
// Problem: Scroll listeners can block scrolling
element.addEventListener('scroll', (event) => {
  // Browser doesn't know if preventDefault() will be called
  // Must wait for handler to finish before scrolling
  // Causes jank
});

// Solution: Passive listeners
element.addEventListener('scroll', (event) => {
  // Browser knows preventDefault() won't be called
  // Can scroll immediately
  // Smoother scrolling
}, { passive: true });

// Note: Can't call preventDefault in passive listener
element.addEventListener('touchmove', (event) => {
  event.preventDefault(); // Warning! Won't work with passive: true
}, { passive: true });

// Default behavior varies:
// - touch/wheel events: passive: true (by default in modern browsers)
// - other events: passive: false
```

### Event Delegation Pattern

```javascript
// How event delegation works internally

// When child element clicked:
// 1. Event created at target
// 2. Bubbles up to parent
// 3. Parent's listener receives event
// 4. event.target points to clicked child
// 5. Check if target matches selector
// 6. Execute handler if match

// Implementation
function delegate(selector, eventType, handler) {
  return function(event) {
    const target = event.target.closest(selector);
    if (target && this.contains(target)) {
      handler.call(target, event);
    }
  };
}

// Usage
parent.addEventListener(
  'click',
  delegate('.item', 'click', function(event) {
    console.log('Item clicked:', this);
  })
);
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "Events only bubble"

**Reality**: Events also capture (and can use both)

```javascript
// Both phases can be used
element.addEventListener('click', capturingHandler, true); // Capturing
element.addEventListener('click', bubblingHandler); // Bubbling

// Capturing happens first
outer.addEventListener('click', () => {
  console.log('Outer capturing');
}, true);

inner.addEventListener('click', () => {
  console.log('Inner bubbling');
});

// Output: "Outer capturing", then "Inner bubbling"
```

### Misconception 2: "stopPropagation stops all handlers"

**Reality**: Only stops propagation, not same-element handlers

```javascript
element.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('First');
});

element.addEventListener('click', () => {
  console.log('Second'); // Still fires!
});

parent.addEventListener('click', () => {
  console.log('Parent'); // Doesn't fire
});

// Use stopImmediatePropagation to stop all
element.addEventListener('click', (e) => {
  e.stopImmediatePropagation(); // Stops everything
  console.log('First');
});
```

### Misconception 3: "Event delegation works for all events"

**Reality**: Some events don't bubble

```javascript
// These DON'T bubble:
// - focus, blur (use focusin, focusout instead)
// - mouseenter, mouseleave (use mouseover, mouseout instead)
// - load, unload
// - scroll (in some cases)

// WON'T WORK
parent.addEventListener('focus', handler); // Won't catch child focus

// WORKS
parent.addEventListener('focusin', handler); // Bubbles!

// Check if event bubbles
console.log(new Event('click').bubbles); // true
console.log(new Event('focus').bubbles); // false
```

### Misconception 4: "preventDefault stops bubbling"

**Reality**: preventDefault and stopPropagation are independent

```javascript
link.addEventListener('click', (event) => {
  event.preventDefault(); // Stops navigation
  // But event still bubbles!
});

parent.addEventListener('click', () => {
  console.log('Parent clicked'); // Still fires!
});

// To stop both:
link.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
});
```

### Misconception 5: "Removing element removes listeners"

**Reality**: Listeners remain if element is still referenced

```javascript
let button = document.querySelector('button');
button.addEventListener('click', handler);

button.remove(); // Removed from DOM

// But button variable still references element!
// Listener still attached
// Memory leak if button is kept

// Proper cleanup:
button.removeEventListener('click', handler);
button = null;
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "Explain event bubbling and capturing"**

```javascript
// Event propagation has 3 phases:

<div id="outer">
  <button id="button">Click</button>
</div>

// 1. CAPTURING (root to target)
outer.addEventListener('click', () => {
  console.log('Capturing');
}, true); // true = capturing phase

// 2. TARGET (at target element)
button.addEventListener('click', () => {
  console.log('Target');
});

// 3. BUBBLING (target to root)
outer.addEventListener('click', () => {
  console.log('Bubbling');
}); // Default = bubbling

// Click button output:
// "Capturing"  (outer, capturing phase)
// "Target"     (button, target phase)
// "Bubbling"   (outer, bubbling phase)

// Most developers use bubbling (default)
// Capturing useful for early interception
```

**Q2: "What is event delegation and when would you use it?"**

```javascript
// Event delegation: Handle child events on parent

// WITHOUT delegation (inefficient)
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick); // 100 listeners!
});

// WITH delegation (efficient)
document.querySelector('.list').addEventListener('click', (event) => {
  if (event.target.matches('.item')) {
    handleClick(event);
  }
});

// Benefits:
// 1. Performance: Fewer listeners
// 2. Memory: Less memory usage
// 3. Dynamic content: Works with elements added later

// Real-world example:
todoList.addEventListener('click', (event) => {
  // Delete button
  if (event.target.matches('.delete')) {
    event.target.closest('.todo').remove();
  }
  
  // Complete checkbox
  if (event.target.matches('.complete')) {
    event.target.closest('.todo').classList.toggle('done');
  }
});

// Works for:
// - Lists with many items
// - Dynamically added elements
// - Similar elements with same handler
```

**Q3: "Difference between preventDefault and stopPropagation?"**

```javascript
// preventDefault - stops default browser action
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission
  // Event still bubbles to parent!
});

link.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent navigation
  // Custom routing instead
});

// stopPropagation - stops event propagation
button.addEventListener('click', (event) => {
  event.stopPropagation(); // Stop bubbling
  // Default action still happens (if any)
});

// Example: Stop bubbling but allow default
<a href="/page">Link</a>

link.addEventListener('click', (event) => {
  event.stopPropagation(); // Stop event bubbling
  // Link still navigates (default action)
});

parent.addEventListener('click', () => {
  console.log('Never called'); // Stopped by stopPropagation
});

// stopImmediatePropagation - stops all handlers
element.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('First');
});

element.addEventListener('click', () => {
  console.log('Never runs'); // Stopped
});
```

**Q4: "Difference between event.target and event.currentTarget?"**

```javascript
<div id="parent">
  <button id="child">Click</button>
</div>

parent.addEventListener('click', function(event) {
  // event.target - element that triggered event
  console.log(event.target); // <button> (what you clicked)
  
  // event.currentTarget - element with listener
  console.log(event.currentTarget); // <div> (where listener is)
  
  // 'this' - same as currentTarget
  console.log(this); // <div>
  console.log(this === event.currentTarget); // true
});

// When clicking button:
// - target: button (clicked element)
// - currentTarget: parent (element with listener)

// Practical use in delegation:
list.addEventListener('click', function(event) {
  const clickedItem = event.target.closest('.item');
  const list = event.currentTarget; // this list element
  
  if (clickedItem) {
    // Handle item click
    clickedItem.classList.toggle('selected');
  }
});
```

**Q5: "How do you properly remove event listeners?"**

```javascript
// Problem: Must use same function reference

// WON'T WORK
element.addEventListener('click', () => console.log('clicked'));
element.removeEventListener('click', () => console.log('clicked'));
// Different function references!

// SOLUTION 1: Named function
function handleClick() {
  console.log('clicked');
}

element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick); // Works!

// SOLUTION 2: Store reference
const handler = () => console.log('clicked');
element.addEventListener('click', handler);
element.removeEventListener('click', handler); // Works!

// SOLUTION 3: Use { once: true }
element.addEventListener('click', () => {
  console.log('clicked');
}, { once: true }); // Auto-removes after first trigger

// Component pattern with cleanup:
class Component {
  constructor(element) {
    this.element = element;
    this.handlers = new Map();
  }
  
  on(event, handler) {
    this.element.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }
  
  off(event) {
    const handler = this.handlers.get(event);
    if (handler) {
      this.element.removeEventListener(event, handler);
      this.handlers.delete(event);
    }
  }
  
  destroy() {
    this.handlers.forEach((handler, event) => {
      this.element.removeEventListener(event, handler);
    });
    this.handlers.clear();
  }
}
```

### Advanced Interview Questions

**Q6: "Implement event delegation utility"**

```javascript
function delegate(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (event) => {
    // Find matching element
    const target = event.target.closest(selector);
    
    // Check if found and is child of parent
    if (target && parent.contains(target)) {
      // Call handler with matched element as context
      handler.call(target, event);
    }
  });
}

// Usage
delegate(document.body, '.btn', 'click', function(event) {
  console.log('Button clicked:', this); // 'this' is clicked button
});

// Advanced: Return function to remove listener
function delegate(parent, selector, eventType, handler) {
  const wrappedHandler = (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event);
    }
  };
  
  parent.addEventListener(eventType, wrappedHandler);
  
  // Return cleanup function
  return () => {
    parent.removeEventListener(eventType, wrappedHandler);
  };
}

// Usage with cleanup
const removeListener = delegate(body, '.btn', 'click', handler);
// Later:
removeListener(); // Clean up
```

**Q7: "Create custom event system"**

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }
  
  off(event, handler) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
  
  emit(event, data) {
    if (!this.events.has(event)) return;
    
    this.events.get(event).forEach(handler => {
      handler(data);
    });
  }
  
  once(event, handler) {
    const onceHandler = (data) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}

// Usage
const emitter = new EventEmitter();

const handler = (data) => console.log('Event:', data);
emitter.on('test', handler);
emitter.emit('test', { value: 42 }); // Logs: "Event: { value: 42 }"

emitter.once('temp', (data) => console.log('Once:', data));
emitter.emit('temp', 1); // Logs: "Once: 1"
emitter.emit('temp', 2); // Nothing (removed after first)
```

### Pro Tips for Interviews

1. **Know all phases**: Capturing, target, bubbling
2. **Event delegation**: When and why to use it
3. **Memory management**: Remove listeners on cleanup
4. **preventDefault vs stopPropagation**: Different purposes
5. **target vs currentTarget**: Common interview question
6. **Custom events**: Show advanced knowledge
7. **Performance**: Passive listeners, delegation benefits
</details>
