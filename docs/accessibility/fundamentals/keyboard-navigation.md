# Keyboard Navigation

## ⚡ Quick Revision
- **Tab order**: Sequential keyboard navigation through interactive elements
- **tabindex**: Controls whether element is focusable and its position in tab sequence
- **Focus indicators**: Visual cues showing which element has keyboard focus
- **Skip links**: Allow keyboard users to bypass repetitive navigation
- **Common pitfall**: Breaking logical tab order or missing focus indicators
- **Key patterns**: Tab (next), Shift+Tab (previous), Enter/Space (activate), Arrow keys (within widgets)

```jsx
// Proper tab order and focus management
function AccessibleNavigation() {
  return (
    <nav>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <ul>
        <li><a href="/" tabIndex={0}>Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  );
}

// Custom component with keyboard support
function CustomButton({ onClick, children, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onClick();
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`custom-button ${disabled ? 'disabled' : ''}`}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

// Focus management in modal
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  const previousFocusRef = useRef();

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        } else if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // Restore focus when modal closes
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="modal"
      >
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Keyboard navigation exists because many users **cannot use a mouse**:

**Who Needs Keyboard Navigation:**
1. **Motor disabilities**: Cannot control mouse precisely
2. **Visual impairments**: Screen reader users rely on keyboard
3. **Temporary limitations**: Broken arm, using laptop in tight space
4. **Power users**: Often prefer keyboard for efficiency
5. **Touch device limitations**: Some interactions easier with keyboard

**The Problem with Poor Keyboard Support:**
```jsx
// ❌ Inaccessible - no keyboard support
<div onClick={handleClick} className="clickable">
  Click me
</div>

// Problems:
// - Not focusable with Tab key
// - No keyboard activation
// - Screen readers don't announce it as interactive
```

**Impact of Good Keyboard Navigation:**
- **Faster interaction** for power users
- **Complete accessibility** for disabled users
- **Better SEO** (focusable elements are discoverable)
- **Touch device compatibility** (external keyboards)
</details>

<details>
<summary>How it works</summary>
Keyboard navigation follows **well-established patterns** and browser behavior:

**1. Tab Order Algorithm:**
```jsx
// Browser determines tab order based on:
// 1. tabindex > 0 (in numerical order) - AVOID
// 2. tabindex = 0 or implicit (document order)
// 3. tabindex = -1 (not in tab order, but focusable)

function TabOrderExample() {
  return (
    <div>
      <input /> {/* 1st in tab order */}
      <button tabIndex={5}>Skip ahead</button> {/* Actually 1st (avoid!) */}
      <select> {/* 2nd in tab order */}
        <option>Option 1</option>
      </select>
      <a href="#link">Link</a> {/* 3rd in tab order */}
      <div tabIndex={0}>Custom focusable</div> {/* 4th in tab order */}
      <span tabIndex={-1}>Not in tab order</span> {/* Focusable via JS only */}
    </div>
  );
}
```

**2. Focus Management Patterns:**
```jsx
// Focus restoration after dynamic content
function useRestoreFocus() {
  const previousFocusRef = useRef();
  
  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);
  
  return { storeFocus, restoreFocus };
}

// Managing focus in dynamic lists
function DynamicList({ items, onDelete }) {
  const listRef = useRef();
  
  const handleDelete = useCallback((index) => {
    onDelete(index);
    
    // Focus next item, or previous if deleting last item
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll('button');
      if (buttons) {
        const nextIndex = index < buttons.length ? index : index - 1;
        buttons[nextIndex]?.focus();
      }
    });
  }, [onDelete]);
  
  return (
    <ul ref={listRef}>
      {items.map((item, index) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(index)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**3. Keyboard Event Handling:**
```jsx
// Standard key mappings
const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
};

function MenuComponent({ items, onSelect }) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef([]);
  
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case KEYS.ARROW_DOWN:
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
        
      case KEYS.ARROW_UP:
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case KEYS.HOME:
        e.preventDefault();
        setFocusedIndex(0);
        break;
        
      case KEYS.END:
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
        
      case KEYS.ENTER:
      case KEYS.SPACE:
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(items[focusedIndex]);
        }
        break;
        
      case KEYS.ESCAPE:
        // Close menu or clear selection
        setFocusedIndex(-1);
        break;
    }
  }, [items, focusedIndex, onSelect]);
  
  // Focus the active item
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          ref={el => itemRefs.current[index] = el}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => onSelect(item)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**4. Focus Trapping:**
```jsx
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };
    
    const handleKeyDown = (e) => {
      if (e.key !== KEYS.TAB) return;
      
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef]);
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "tabindex='0' makes everything focusable"**
```jsx
// ❌ Adding tabindex to non-interactive elements
<div tabIndex={0} onClick={handleClick}>
  I'm focusable but not announced as interactive
</div>

// ✅ Use semantic elements or proper ARIA
<button onClick={handleClick}>
  I'm properly announced as a button
</button>

// ✅ Or add proper role
<div 
  role="button" 
  tabIndex={0} 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom button with proper keyboard support
</div>
```

**❌ "Positive tabindex values are helpful"**
```jsx
// ❌ Positive tabindex breaks logical order
<div>
  <input tabIndex={3} placeholder="Third" />
  <input tabIndex={1} placeholder="First" />  {/* Jumps to this first! */}
  <input tabIndex={2} placeholder="Second" />
  <input placeholder="Fourth" />              {/* Back to normal order */}
</div>

// ✅ Use document order and tabindex={0} or omit tabindex
<div>
  <input placeholder="First" />
  <input placeholder="Second" />
  <input placeholder="Third" />
  <input placeholder="Fourth" />
</div>
```

**❌ "Focus indicators are just styling"**
```jsx
// ❌ Removing focus indicators breaks accessibility
.button:focus {
  outline: none; /* Don't do this without replacement! */
}

// ✅ Provide custom focus indicators
.button:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}

// ✅ Or use focus-visible for better UX
.button:focus-visible {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}
```

**❌ "Enter and Space always do the same thing"**
```jsx
// ❌ Inconsistent button behavior
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') { // Missing Space key!
      handleClick();
    }
  }}
>
  Custom button
</div>

// ✅ Handle both Enter and Space for buttons
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent page scroll for Space
      handleClick();
    }
  }}
>
  Proper custom button
</div>
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"What's the difference between tabindex values?"**
   - `tabindex="-1"`: Focusable via JavaScript only
   - `tabindex="0"`: Normal tab order (use this!)
   - `tabindex="1+"`: Positive values jump ahead (avoid!)

2. **"How do you handle focus in single-page applications?"**
   - Focus management on route changes
   - Announce page changes to screen readers
   - Skip links for navigation

3. **"What keyboard patterns do different widgets use?"**
   - Buttons: Enter/Space to activate
   - Menus: Arrow keys to navigate, Enter to select
   - Tabs: Arrow keys between tabs, Tab to enter tab panel

**Real-world Implementation Patterns:**

**1. Accessible Route Focus Management:**
```jsx
function useRouteAnnouncement() {
  const location = useLocation();
  const announcementRef = useRef();
  
  useEffect(() => {
    // Announce page change and focus main content
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.focus();
      
      // Announce the page change
      if (announcementRef.current) {
        announcementRef.current.textContent = `Navigated to ${location.pathname}`;
      }
    }
  }, [location]);
  
  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live="polite"
      className="sr-only"
    />
  );
}
```

**2. Roving Tabindex for Widget Groups:**
```jsx
function useRovingTabindex(items, activeIndex) {
  const itemRefs = useRef([]);
  
  useEffect(() => {
    // Set tabindex for all items
    itemRefs.current.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [activeIndex]);
  
  useEffect(() => {
    // Focus the active item
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].focus();
    }
  }, [activeIndex]);
  
  return itemRefs;
}

function Toolbar({ tools }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const toolRefs = useRovingTabindex(tools, activeIndex);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : tools.length - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setActiveIndex(prev => prev < tools.length - 1 ? prev + 1 : 0);
        break;
    }
  };
  
  return (
    <div role="toolbar" onKeyDown={handleKeyDown}>
      {tools.map((tool, index) => (
        <button
          key={tool.id}
          ref={el => toolRefs.current[index] = el}
          onClick={() => tool.action()}
          tabIndex={index === activeIndex ? 0 : -1}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}
```

**3. Skip Links Implementation:**
```jsx
function SkipLinks() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' },
  ];
  
  return (
    <nav className="skip-links" aria-label="Skip links">
      {skipLinks.map(link => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.focus();
              target.scrollIntoView();
            }
          }}
        >
          {link.text}
        </a>
      ))}
    </nav>
  );
}

// CSS for skip links
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
  top: 6px;
}
```

**4. Focus Management Hook:**
```jsx
function useFocusManagement() {
  const previousFocusRef = useRef();
  
  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && 
        typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);
  
  const focusElement = useCallback((selector) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector)
      : selector;
    
    if (element && typeof element.focus === 'function') {
      // Some elements need to be focusable
      if (element.tabIndex === -1) {
        element.tabIndex = -1;
      }
      element.focus();
    }
  }, []);
  
  return { storeFocus, restoreFocus, focusElement };
}
```

**Testing Keyboard Navigation:**
```jsx
// Automated testing
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('modal traps focus correctly', async () => {
  const user = userEvent.setup();
  
  render(<ModalComponent isOpen={true} />);
  
  const firstButton = screen.getByRole('button', { name: /close/i });
  const lastButton = screen.getByRole('button', { name: /submit/i });
  
  // Focus should start on first element
  expect(firstButton).toHaveFocus();
  
  // Tab to last element
  await user.tab();
  expect(lastButton).toHaveFocus();
  
  // Tab should cycle back to first
  await user.tab();
  expect(firstButton).toHaveFocus();
  
  // Shift+Tab should go to last
  await user.tab({ shift: true });
  expect(lastButton).toHaveFocus();
});
```

**Best Practices:**
- **Test with keyboard only** - unplug your mouse
- **Provide visible focus indicators** for all interactive elements
- **Use semantic HTML** whenever possible
- **Follow ARIA authoring practices** for complex widgets
- **Test with screen readers** to verify experience
</details>