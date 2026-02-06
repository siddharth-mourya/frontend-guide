# Focus Management

## ⚡ Quick Revision
- **Focus trapping**: Constraining keyboard navigation within modal dialogs and overlays
- **Focus restoration**: Returning focus to previous element when closing modals/menus
- **Skip links**: Allow users to bypass repetitive content and jump to main areas
- **Initial focus**: Setting appropriate focus when dynamic content appears
- **Common pitfall**: Losing focus context or trapping focus incorrectly
- **Key principle**: Focus should always be predictable and logical

```jsx
// Focus trap implementation
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element initially
    firstElement?.focus();
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
}

// Modal with focus management
function Modal({ isOpen, onClose, children, title }) {
  const modalRef = useRef();
  const previousFocusRef = useRef();
  
  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);
  
  // Focus trap
  useFocusTrap(modalRef, isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" aria-hidden={!isOpen}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Skip links component
function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <a href="#nav" className="skip-link">
        Skip to navigation
      </a>
      <a href="#footer" className="skip-link">
        Skip to footer
      </a>
    </div>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Focus management exists to create **predictable navigation** for keyboard and screen reader users:

**Problems Without Proper Focus Management:**
1. **Lost focus**: User doesn't know where they are after interactions
2. **Focus leaks**: Tab navigation escapes modal dialogs
3. **Unpredictable jumps**: Focus moves to unexpected locations
4. **Inaccessible content**: No way to reach important page sections quickly

**Real-world Impact:**
```jsx
// ❌ Poor focus management
function BadModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Modal Title</h2>
        <p>Modal content here</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
  
  // Problems:
  // - Focus stays on trigger button (behind overlay)
  // - Tab can navigate to elements behind modal
  // - Closing modal doesn't restore focus
  // - No way to escape with keyboard
}
```

**Who Benefits:**
- **Keyboard users**: Clear navigation path
- **Screen reader users**: Logical content flow
- **Motor disability users**: Reduced navigation burden
- **Power users**: Efficient interaction patterns
</details>

<details>
<summary>How it works</summary>
Focus management uses **DOM APIs and event handling** to control focus flow:

**1. Focus API Methods:**
```jsx
// Basic focus operations
element.focus();                    // Move focus to element
element.blur();                     // Remove focus from element
document.activeElement;             // Get currently focused element
element.matches(':focus');          // Check if element has focus

// Advanced focus options
element.focus({
  preventScroll: true,              // Don't scroll to element
  focusVisible: true                // Force visible focus indicator
});

// Focus restoration pattern
function useFocusRestore() {
  const restoreFocusRef = useRef();
  
  const storeFocus = useCallback(() => {
    restoreFocusRef.current = document.activeElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus();
    }
  }, []);
  
  return { storeFocus, restoreFocus };
}
```

**2. Focus Trapping Implementation:**
```jsx
function createFocusTrap(container) {
  let isActive = false;
  let firstFocusableElement = null;
  let lastFocusableElement = null;
  
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    'details',
    'summary',
  ].join(', ');
  
  function updateFocusableElements() {
    const elements = container.querySelectorAll(focusableSelector);
    firstFocusableElement = elements[0] || null;
    lastFocusableElement = elements[elements.length - 1] || null;
  }
  
  function handleTabKey(event) {
    if (event.key !== 'Tab' || !isActive) return;
    
    updateFocusableElements();
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement?.focus();
      }
    }
  }
  
  return {
    activate() {
      isActive = true;
      updateFocusableElements();
      firstFocusableElement?.focus();
      document.addEventListener('keydown', handleTabKey);
    },
    
    deactivate() {
      isActive = false;
      document.removeEventListener('keydown', handleTabKey);
    }
  };
}
```

**3. Route Focus Management:**
```jsx
// Focus management for SPA route changes
function useRouteAnnouncement() {
  const location = useLocation();
  const titleRef = useRef();
  
  useEffect(() => {
    // Find and focus the main heading
    const mainHeading = document.querySelector('h1');
    if (mainHeading) {
      // Make heading focusable and focus it
      mainHeading.tabIndex = -1;
      mainHeading.focus();
    }
    
    // Announce route change to screen readers
    if (titleRef.current) {
      titleRef.current.textContent = document.title;
    }
    
    // Scroll to top for visual users
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div
      ref={titleRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
```

**4. Advanced Focus Patterns:**

**Roving Tabindex:**
```jsx
function useRovingFocus(items) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  
  // Update tabindex values
  useEffect(() => {
    itemRefs.current.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [activeIndex]);
  
  // Focus active item
  useEffect(() => {
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex]);
  
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  }, [items.length]);
  
  return {
    itemRefs,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}
```

**Focus Within Detection:**
```jsx
function useFocusWithin(containerRef) {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleFocusIn = (e) => {
      if (container.contains(e.target)) {
        setIsFocusWithin(true);
      }
    };
    
    const handleFocusOut = (e) => {
      if (!container.contains(e.relatedTarget)) {
        setIsFocusWithin(false);
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [containerRef]);
  
  return isFocusWithin;
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Focus management is only for modals"**
```jsx
// Focus management is needed in many scenarios:

// ❌ Missing focus after deletion
function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => onDelete(todo.id)}>Delete</button>
          {/* Focus lost after deletion! */}
        </li>
      ))}
    </ul>
  );
}

// ✅ Focus management for dynamic content
function TodoList({ todos, onDelete }) {
  const handleDelete = useCallback((id, index) => {
    onDelete(id);
    
    // Focus next item or previous if deleting last
    requestAnimationFrame(() => {
      const nextIndex = index < todos.length - 1 ? index : index - 1;
      const nextButton = document.querySelector(
        `[data-todo-index="${nextIndex}"] button`
      );
      nextButton?.focus();
    });
  }, [onDelete, todos.length]);
  
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={todo.id} data-todo-index={index}>
          {todo.text}
          <button onClick={() => handleDelete(todo.id, index)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**❌ "document.activeElement is always accurate"**
```jsx
// ❌ activeElement can be unreliable
function BadFocusCheck() {
  const [hasFocus, setHasFocus] = useState(false);
  
  useEffect(() => {
    const checkFocus = () => {
      setHasFocus(document.activeElement === buttonRef.current);
    };
    
    // This might not work reliably
    document.addEventListener('focus', checkFocus, true);
    document.addEventListener('blur', checkFocus, true);
  }, []);
}

// ✅ Use focus events directly on elements
function ProperFocusCheck() {
  const [hasFocus, setHasFocus] = useState(false);
  const buttonRef = useRef();
  
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    const handleFocus = () => setHasFocus(true);
    const handleBlur = () => setHasFocus(false);
    
    button.addEventListener('focus', handleFocus);
    button.addEventListener('blur', handleBlur);
    
    return () => {
      button.removeEventListener('focus', handleFocus);
      button.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  return <button ref={buttonRef}>Button</button>;
}
```

**❌ "Focus trap should prevent all Tab navigation"**
```jsx
// ❌ Blocking all Tab navigation
function BadFocusTrap() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault(); // Breaks all tab navigation!
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
  }, []);
}

// ✅ Only redirect focus at boundaries
function ProperFocusTrap() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        
        // Only prevent default at boundaries
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
  }, []);
}
```

**❌ "Skip links are just for screen readers"**
```jsx
// ❌ Skip links help ALL keyboard users
.skip-link {
  position: absolute;
  left: -9999px; /* Hidden from everyone */
}

// ✅ Make skip links available on focus
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px; /* Visible when focused */
}
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"How do you implement focus trapping in a modal?"**
   - Identify focusable elements within modal
   - Handle Tab/Shift+Tab at boundaries to cycle focus
   - Restore focus to trigger element when closed

2. **"What's the difference between focus and focusin events?"**
   - `focus`: Doesn't bubble, fires only on target element
   - `focusin`: Bubbles, can be captured by parent elements

3. **"How do you manage focus in single-page applications?"**
   - Focus main heading on route changes
   - Announce route changes to screen readers
   - Implement skip links for efficient navigation

**Real-world Implementation Patterns:**

**1. Comprehensive Modal Hook:**
```jsx
function useModal(isOpen) {
  const modalRef = useRef();
  const triggerRef = useRef();
  const focusTrapRef = useRef();
  
  // Store trigger element when modal opens
  useEffect(() => {
    if (isOpen && !triggerRef.current) {
      triggerRef.current = document.activeElement;
    }
  }, [isOpen]);
  
  // Focus management
  useEffect(() => {
    if (!isOpen) {
      // Restore focus and clean up
      if (triggerRef.current?.focus) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
      focusTrapRef.current?.deactivate();
      return;
    }
    
    const modal = modalRef.current;
    if (!modal) return;
    
    // Create and activate focus trap
    focusTrapRef.current = createFocusTrap(modal);
    focusTrapRef.current.activate();
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      focusTrapRef.current?.deactivate();
    };
  }, [isOpen]);
  
  return modalRef;
}
```

**2. Dropdown with Focus Management:**
```jsx
function Dropdown({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const triggerRef = useRef();
  
  const handleToggle = () => setIsOpen(!isOpen);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus first item when opened
    const firstItem = dropdownRef.current?.querySelector('[role="menuitem"]');
    firstItem?.focus();
    
    // Close on outside click
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target) && 
          !triggerRef.current?.contains(e.target)) {
        handleClose();
      }
    };
    
    // Close on escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);
  
  return (
    <div className="dropdown">
      <button
        ref={triggerRef}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          id="dropdown-menu"
          role="menu"
          className="dropdown-menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}
```

**3. Focus Management for Data Tables:**
```jsx
function FocusableTable({ data, columns }) {
  const tableRef = useRef();
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  
  const handleKeyDown = (e) => {
    const { row, col } = focusedCell;
    const maxRow = data.length - 1;
    const maxCol = columns.length - 1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCell(prev => ({
          ...prev,
          row: Math.min(prev.row + 1, maxRow)
        }));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCell(prev => ({
          ...prev,
          row: Math.max(prev.row - 1, 0)
        }));
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        setFocusedCell(prev => ({
          ...prev,
          col: Math.min(prev.col + 1, maxCol)
        }));
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedCell(prev => ({
          ...prev,
          col: Math.max(prev.col - 1, 0)
        }));
        break;
        
      case 'Home':
        e.preventDefault();
        if (e.ctrlKey) {
          setFocusedCell({ row: 0, col: 0 });
        } else {
          setFocusedCell(prev => ({ ...prev, col: 0 }));
        }
        break;
        
      case 'End':
        e.preventDefault();
        if (e.ctrlKey) {
          setFocusedCell({ row: maxRow, col: maxCol });
        } else {
          setFocusedCell(prev => ({ ...prev, col: maxCol }));
        }
        break;
    }
  };
  
  // Focus the active cell
  useEffect(() => {
    const cell = tableRef.current?.querySelector(
      `[data-row="${focusedCell.row}"][data-col="${focusedCell.col}"]`
    );
    cell?.focus();
  }, [focusedCell]);
  
  return (
    <table ref={tableRef} role="grid" onKeyDown={handleKeyDown}>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} role="row">
            {columns.map((col, colIndex) => (
              <td
                key={colIndex}
                role="gridcell"
                data-row={rowIndex}
                data-col={colIndex}
                tabIndex={
                  rowIndex === focusedCell.row && colIndex === focusedCell.col 
                    ? 0 
                    : -1
                }
                onClick={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Testing Focus Management:**
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('modal manages focus correctly', async () => {
  const user = userEvent.setup();
  
  const { rerender } = render(
    <div>
      <button>Trigger</button>
      <Modal isOpen={false} onClose={() => {}} />
    </div>
  );
  
  const trigger = screen.getByRole('button', { name: /trigger/i });
  trigger.focus();
  
  // Open modal
  rerender(
    <div>
      <button>Trigger</button>
      <Modal isOpen={true} onClose={() => {}} />
    </div>
  );
  
  // First focusable element in modal should be focused
  const firstModalElement = screen.getByRole('button', { name: /close/i });
  expect(firstModalElement).toHaveFocus();
  
  // Tab should cycle within modal
  await user.tab();
  const lastModalElement = screen.getByRole('button', { name: /submit/i });
  expect(lastModalElement).toHaveFocus();
  
  await user.tab();
  expect(firstModalElement).toHaveFocus();
});
```

**Best Practices:**
- **Always test with keyboard only** navigation
- **Provide clear focus indicators** for all interactive elements
- **Announce important changes** to screen reader users
- **Follow established patterns** for common widgets
- **Test focus restoration** after dynamic content changes
</details>