# ARIA Attributes

## ⚡ Quick Revision
- **ARIA (Accessible Rich Internet Applications)**: Standard for making dynamic content accessible to screen readers
- **aria-label**: Provides accessible name when visible text isn't sufficient
- **aria-describedby**: Links to elements that provide additional description
- **aria-expanded**: Indicates if collapsible element is expanded or collapsed
- **aria-hidden**: Hides decorative elements from screen readers
- **Common pitfall**: Overusing ARIA instead of semantic HTML
- **Rule of thumb**: Semantic HTML first, ARIA only when necessary

```jsx
// Basic ARIA patterns
function AccessibleButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      <button
        aria-expanded={isExpanded}
        aria-controls="menu"
        aria-haspopup="true"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Options
      </button>
      <ul
        id="menu"
        role="menu"
        aria-hidden={!isExpanded}
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        <li role="menuitem">
          <a href="/profile">Profile</a>
        </li>
        <li role="menuitem">
          <a href="/settings">Settings</a>
        </li>
      </ul>
    </div>
  );
}

// Form accessibility
function AccessibleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <form>
      <label htmlFor="email">Email Address *</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : "email-help"}
      />
      <div id="email-help">We'll never share your email</div>
      {error && (
        <div id="email-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </form>
  );
}

// Complex widget with ARIA
function TabPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Profile', 'Settings', 'Notifications'];
  
  return (
    <div>
      <div role="tablist" aria-label="Account settings">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
        >
          Content for {tab}
        </div>
      ))}
    </div>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
ARIA exists to bridge the gap between **visual interfaces and screen readers**:

**The Accessibility Gap:**
```jsx
// ❌ Not accessible - screen reader doesn't understand the interaction
<div onClick={handleClick} className="button-like">
  Click me
</div>

// ✅ Accessible - proper semantics and ARIA
<button onClick={handleClick} aria-label="Submit form">
  Click me
</button>
```

**Problems ARIA Solves:**
1. **Dynamic content**: Screen readers miss content changes without ARIA live regions
2. **Custom controls**: Non-standard UI components need role definitions
3. **Missing context**: Visual cues need verbal equivalents
4. **State communication**: Interactive states must be programmatically available
5. **Relationships**: Connections between elements need explicit markup

**Who Benefits:**
- **Screen reader users**: Visual impairments
- **Voice control software**: People with motor disabilities
- **Cognitive disabilities**: Clear structure and relationships
- **Keyboard navigation**: Focus management and state indication
</details>

<details>
<summary>How it works</summary>
ARIA uses **roles, properties, and states** to create an accessibility tree:

**1. ARIA Roles - What Is It:**
```jsx
// Landmark roles for navigation
<nav role="navigation" aria-label="Main navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

// Widget roles for interactive elements
<div role="button" tabIndex={0} onClick={handleClick}>
<div role="slider" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
<ul role="listbox">
<li role="option" aria-selected={isSelected}>

// Document structure roles
<div role="article">
<div role="heading" aria-level="2">
<div role="list">
<div role="listitem">
```

**2. ARIA Properties - Describe Relationships:**
```jsx
// Labeling
<button aria-label="Close dialog">×</button>
<input aria-labelledby="billing-address">
<div id="billing-address">Billing Address</div>

// Descriptions
<input aria-describedby="password-help">
<div id="password-help">Password must be 8+ characters</div>

// Controls and ownership
<button aria-controls="menu" aria-haspopup="true">Menu</button>
<ul id="menu">...</ul>

// Flow and navigation
<div aria-flowto="step2">Step 1</div>
<div id="step2">Step 2</div>
```

**3. ARIA States - Current Status:**
```jsx
// Dynamic states that change with interaction
const [isExpanded, setIsExpanded] = useState(false);
const [isSelected, setIsSelected] = useState(false);
const [isChecked, setIsChecked] = useState(false);

<button aria-expanded={isExpanded}>
<option aria-selected={isSelected}>
<checkbox aria-checked={isChecked}>

// Invalid states with error messaging
const [isInvalid, setIsInvalid] = useState(false);
<input aria-invalid={isInvalid} aria-describedby="error">
{isInvalid && <div id="error" role="alert">Error message</div>}
```

**4. Live Regions - Dynamic Content:**
```jsx
// Announce important changes
function StatusMessage({ message, type }) {
  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

// Loading states
function LoadingIndicator({ isLoading }) {
  return (
    <div aria-live="polite" aria-busy={isLoading}>
      {isLoading ? 'Loading...' : 'Content loaded'}
    </div>
  );
}

// Progress indication
function ProgressBar({ value, max }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax={max}
      aria-label={`Progress: ${value} of ${max}`}
    >
      <div style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}
```

**5. Complex Widget Patterns:**
```jsx
// Modal dialog with proper focus management
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose} aria-label="Close modal">×</button>
    </div>
  );
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "More ARIA is always better"**
```jsx
// ❌ Over-ARIAing with redundant attributes
<button 
  role="button"           // Redundant - button already has button role
  aria-label="Click me"   // Redundant if button text is "Click me"
  tabIndex={0}            // Redundant - buttons are focusable by default
>
  Click me
</button>

// ✅ Use semantic HTML first
<button>Click me</button>

// ✅ Add ARIA only when needed
<button aria-label="Close dialog">×</button>
```

**❌ "aria-label and aria-labelledby are interchangeable"**
```jsx
// ❌ Using both causes confusion
<input 
  aria-label="Email address"           // This will be ignored
  aria-labelledby="email-label"       // This takes precedence
>
<label id="email-label">Email</label>

// ✅ Use one or the other
<input aria-labelledby="email-label">
<label id="email-label">Email address</label>

// ✅ Or just use proper label association
<label htmlFor="email">Email address</label>
<input id="email">
```

**❌ "aria-hidden hides content completely"**
```jsx
// ❌ aria-hidden doesn't affect visual display
<div aria-hidden="true">
  This is still visible but hidden from screen readers
</div>

// ✅ Hide decorative content appropriately
<div aria-hidden="true" className="decorative-icon">🎉</div>
<span>Congratulations!</span>

// ❌ Don't hide interactive content
<button aria-hidden="true">Submit</button> // Button still focusable!

// ✅ Properly hide interactive content
<button style={{ display: 'none' }}>Submit</button>
```

**❌ "Role changes the element's behavior"**
```jsx
// ❌ Role doesn't add keyboard behavior
<div role="button" onClick={handleClick}>
  Click me // Not keyboard accessible
</div>

// ✅ Add proper keyboard support
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
  Click me
</div>

// ✅ Or just use semantic HTML
<button onClick={handleClick}>Click me</button>
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"When should you use ARIA vs semantic HTML?"**
   - Semantic HTML first (button, nav, main, etc.)
   - ARIA when semantic HTML doesn't exist (tabs, accordions)
   - ARIA to enhance existing semantics (aria-expanded, aria-current)

2. **"What's the difference between aria-label and aria-labelledby?"**
   - aria-label: Direct text label
   - aria-labelledby: References other element's text
   - aria-labelledby takes precedence over aria-label

3. **"How do you make dynamic content accessible?"**
   - Use aria-live regions for announcements
   - Update aria-expanded, aria-selected states
   - Manage focus for appearing/disappearing content

**Common ARIA Patterns:**

**1. Accordion/Collapsible Content:**
```jsx
function Accordion({ items }) {
  const [expanded, setExpanded] = useState({});
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <h3>
            <button
              aria-expanded={expanded[index] || false}
              aria-controls={`panel-${index}`}
              onClick={() => setExpanded(prev => ({
                ...prev,
                [index]: !prev[index]
              }))}
            >
              {item.title}
            </button>
          </h3>
          <div
            id={`panel-${index}`}
            role="region"
            aria-labelledby={`button-${index}`}
            hidden={!expanded[index]}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**2. Combobox/Autocomplete:**
```jsx
function AutoComplete({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  return (
    <div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setFilteredOptions(
            options.filter(opt => 
              opt.toLowerCase().includes(e.target.value.toLowerCase())
            )
          );
        }}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-controls="listbox"
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
      />
      {isOpen && (
        <ul id="listbox" role="listbox">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              id={`option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => onChange(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**3. Data Table with Sorting:**
```jsx
function SortableTable({ data, columns }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  return (
    <table role="table" aria-label="Sortable data table">
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.key}
              role="columnheader"
              aria-sort={
                sortConfig.key === column.key
                  ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'
              }
            >
              <button onClick={() => handleSort(column.key)}>
                {column.label}
                <span aria-hidden="true">
                  {sortConfig.key === column.key && 
                    (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')
                  }
                </span>
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            {columns.map(column => (
              <td key={column.key} role="gridcell">
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**4. Form Validation:**
```jsx
function ValidatedForm() {
  const [errors, setErrors] = useState({});
  
  return (
    <form noValidate>
      <div>
        <label htmlFor="username" className={errors.username ? 'error' : ''}>
          Username *
        </label>
        <input
          id="username"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : 'username-help'}
        />
        <div id="username-help">3-20 characters, letters and numbers only</div>
        {errors.username && (
          <div id="username-error" role="alert" aria-live="polite">
            {errors.username}
          </div>
        )}
      </div>
    </form>
  );
}
```

**Testing ARIA:**
```jsx
// Test with screen readers
// Check with accessibility testing tools
import { render, screen } from '@testing-library/react';

test('button has proper ARIA attributes', () => {
  render(<ExpandableSection />);
  
  const button = screen.getByRole('button', { name: /toggle section/i });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveAttribute('aria-controls');
});
```

**Best Practices:**
- **Test with actual screen readers** (NVDA, JAWS, VoiceOver)
- **Use automated testing tools** (axe-core, Pa11y)
- **Follow WCAG guidelines** for accessibility compliance
- **Keep ARIA simple** - complex patterns are error-prone
- **Update ARIA states** dynamically as UI changes
</details>