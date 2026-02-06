# Fragments and Portals

## ⚡ Quick Revision

- Fragments: Group elements without adding extra DOM nodes
- Syntax: `<React.Fragment>`, `<>...</>` (short syntax), or `<Fragment>`
- Short syntax doesn't support keys or attributes
- Portals: Render children outside parent DOM hierarchy
- `ReactDOM.createPortal(children, domNode)`
- Events bubble through React tree, not DOM tree
- **Pitfall**: Short fragments (`<>`) can't have keys (use `<Fragment key={...}>`)
- **Pitfall**: Portal DOM node must exist before rendering

```jsx
// Fragment: Avoid wrapper div
function Table() {
  return (
    <table>
      <tbody>
        <tr>
          <Columns /> {/* Returns multiple <td> without wrapper */}
        </tr>
      </tbody>
    </table>
  );
}

function Columns() {
  return (
    <>
      <td>Column 1</td>
      <td>Column 2</td>
    </>
  );
}

// Portal: Modal outside root
function Modal({ children, isOpen }) {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root')
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Fragments:**
- Avoid unnecessary wrapper divs that break CSS layouts
- Keep HTML semantic (e.g., `<tr>` directly in `<table>`)
- Reduce DOM node count (better performance)
- Prevent CSS issues from wrapper elements
- Satisfy React's single root requirement without side effects

**Portals:**
- Render modals/tooltips at document root (avoid z-index battles)
- Escape overflow: hidden containers
- Render components in different DOM locations
- Maintain React tree structure for events/context
- Enable proper focus management and accessibility

</details>

<details>
<summary>How it works</summary>
**Fragments:**
```jsx
// Problem: Extra div breaks table structure
function TableRow() {
  return (
    <div> {/* ❌ Invalid HTML: div in tbody */}
      <td>Cell 1</td>
      <td>Cell 2</td>
    </div>
  );
}

// Solution 1: Long form (supports keys)
function TableRow({ items }) {
  return (
    <React.Fragment>
      {items.map(item => (
        <React.Fragment key={item.id}>
          <td>{item.name}</td>
          <td>{item.value}</td>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

// Solution 2: Short form (no keys)
function TableRow() {
  return (
    <>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </>
  );
}

// Fragment with key (for lists)
function Glossary({ items }) {
  return (
    <dl>
      {items.map(item => (
        // ✅ Must use long form for key
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

// Fragments don't create DOM nodes
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
// Renders: <Header /><Main /><Footer /> directly, no wrapper
```

**Portals:**
```jsx
// Setup: HTML has portal target
// <div id="root"></div>
// <div id="modal-root"></div>

function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;
  
  // Render into #modal-root, not parent's DOM
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ overflow: 'hidden' }}> {/* Portal escapes this */}
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {/* Rendered in #modal-root, not inside this div */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>Content</p>
      </Modal>
    </div>
  );
}

// Event bubbling through React tree (not DOM tree)
function Parent() {
  const handleClick = () => {
    console.log('Parent clicked'); // ✅ This fires even though...
  };
  
  return (
    <div onClick={handleClick}>
      <Modal>
        <button>Click me</button> {/* ...button is in different DOM tree */}
      </Modal>
    </div>
  );
}

// Portal event bubbling diagram:
// React tree:      <App> → <Modal> → <button>
// DOM tree:        <div id="root"><App /></div>
//                  <div id="modal-root"><Modal /></div>
// Click bubbles through React tree, not DOM tree
```

**Portal use cases:**
```jsx
// 1. Modal dialog
function ModalPortal({ children }) {
  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root')
  );
}

// 2. Tooltip
function Tooltip({ text, children, position }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  
  const handleMouseEnter = (e) => {
    const rect = e.target.getBoundingClientRect();
    setCoords({ x: rect.left, y: rect.bottom });
    setShow(true);
  };
  
  return (
    <>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
        {children}
      </span>
      {show && ReactDOM.createPortal(
        <div
          className="tooltip"
          style={{ position: 'absolute', left: coords.x, top: coords.y }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
}

// 3. Notification system
function NotificationPortal({ notifications }) {
  return ReactDOM.createPortal(
    <div className="notification-container">
      {notifications.map(notif => (
        <div key={notif.id} className="notification">
          {notif.message}
        </div>
      ))}
    </div>,
    document.body
  );
}

// 4. Full-screen overlay
function FullScreenOverlay({ children, isOpen }) {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="fullscreen-overlay">
      {children}
    </div>,
    document.body
  );
}
```

**Fragments vs Arrays:**
```jsx
// Before Fragments: Array with keys
function List() {
  return [
    <li key="1">Item 1</li>,
    <li key="2">Item 2</li>,
    <li key="3">Item 3</li>
  ];
}

// After Fragments: Cleaner, keys only where needed
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  );
}

// When you need keys
function List({ items }) {
  return (
    <>
      {items.map(item => (
        <Fragment key={item.id}> {/* Key needed for list items */}
          <dt>{item.term}</dt>
          <dd>{item.def}</dd>
        </Fragment>
      ))}
    </>
  );
}
```

**Portal cleanup:**
```jsx
function Portal({ children, target }) {
  const [container] = useState(() => {
    // Create container on mount
    const el = document.createElement('div');
    return el;
  });
  
  useEffect(() => {
    // Append to target
    const targetEl = document.getElementById(target);
    targetEl.appendChild(container);
    
    // Cleanup on unmount
    return () => {
      targetEl.removeChild(container);
    };
  }, [container, target]);
  
  return ReactDOM.createPortal(children, container);
}
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"Fragments add a wrapper"** - They add no DOM nodes
- **"Short syntax supports keys"** - Must use `<Fragment key={...}>`
- **"Portals break event handling"** - Events bubble through React tree
- **"Portals break context"** - Context works normally through portals
- **"Portals must render to body"** - Can render to any DOM node
- **"Fragments are just for lists"** - Useful anywhere you'd return multiple elements

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **When to use**: Can you identify appropriate use cases?
- **Event handling**: Understanding portal event bubbling
- **DOM structure**: How portals affect the DOM tree
- **Fragment syntax**: Knowing when to use each form

Critical concepts to explain:
- **Fragment purpose**: Avoiding unnecessary wrapper elements
- **Key requirement**: When Fragment needs key attribute
- **Portal rendering**: Rendering outside parent DOM hierarchy
- **Event bubbling**: How events work with portals
- **Context preservation**: React tree vs DOM tree

Common questions:
- "What are React Fragments and why use them?"
- "When do you need the long form Fragment vs short syntax?"
- "What problem do portals solve?"
- "How do events work with portals?"
- "Does context work through portals?"
- "When would you use a portal?"

Key talking points:
- Fragments group elements without DOM nodes
- Short syntax (`<>`) is convenient but can't take keys
- Portals render in different DOM location but same React tree
- Events bubble through React tree, not DOM tree
- Common portal uses: modals, tooltips, notifications
- Portals preserve context and event handling

</details>

---

## 📝 Code Examples

<details>
<summary>Advanced portal patterns</summary>
```jsx
// Reusable portal hook
function usePortal(id) {
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.id = id;
    return el;
  });
  
  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  return container;
}

// Usage
function Modal({ children, isOpen }) {
  const portalContainer = usePortal('modal-root');
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    portalContainer
  );
}

// Modal with focus trap
function AccessibleModal({ children, isOpen, onClose }) {
  const modalRef = useRef();
  const previousFocus = useRef();
  
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocus.current = document.activeElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          const focusables = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleTab);
      
      return () => {
        document.removeEventListener('keydown', handleTab);
        previousFocus.current?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div
      ref={modalRef}
      className="modal"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <button onClick={onClose} aria-label="Close">×</button>
      {children}
    </div>,
    document.body
  );
}

// Notification system with portals
function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);
  
  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
      {ReactDOM.createPortal(
        <div className="notification-container">
          {notifications.map(({ id, message, type }) => (
            <div key={id} className={`notification notification-${type}`}>
              {message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
}

// Tooltip with portal and positioning
function TooltipPortal({ content, children, position = 'top' }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef();
  
  const calculatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    
    const positions = {
      top: { x: rect.left + rect.width / 2, y: rect.top },
      bottom: { x: rect.left + rect.width / 2, y: rect.bottom },
      left: { x: rect.left, y: rect.top + rect.height / 2 },
      right: { x: rect.right, y: rect.top + rect.height / 2 }
    };
    
    setCoords(positions[position] || positions.top);
  };
  
  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => {
          calculatePosition();
          setShow(true);
        }}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>
      {show && ReactDOM.createPortal(
        <div
          className={`tooltip tooltip-${position}`}
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y,
            transform: position === 'top' || position === 'bottom'
              ? 'translateX(-50%)'
              : 'translateY(-50%)'
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

// Drawer/Sidebar with portal
function Drawer({ isOpen, onClose, side = 'right', children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`drawer drawer-${side}`}>
        <button onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </>,
    document.body
  );
}
```

</details>

<details>
<summary>Fragment patterns</summary>
```jsx
// Description list with fragments
function DescriptionList({ items }) {
  return (
    <dl>
      {items.map(item => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

// Table rows with fragments
function TableData({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>City</th>
        </tr>
      </thead>
      <tbody>
        {data.map(person => (
          <Fragment key={person.id}>
            <tr>
              <td>{person.name}</td>
              <td>{person.age}</td>
              <td>{person.city}</td>
            </tr>
            {person.details && (
              <tr>
                <td colSpan={3}>{person.details}</td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

// Conditional fragments
function ConditionalContent({ showTitle, showContent }) {
  return (
    <>
      {showTitle && <h1>Title</h1>}
      {showContent && (
        <>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </>
      )}
    </>
  );
}
```

</details>
