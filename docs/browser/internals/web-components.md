# Web Components

## ⚡ Quick Revision
- **Custom Elements**: Define new HTML tags with custom behavior
- **Shadow DOM**: Encapsulated DOM and CSS, isolated from main document
- **HTML Templates**: Reusable markup with `<template>` and `<slot>`
- **Lifecycle callbacks**: `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`
- **Framework-agnostic**: Work with any JavaScript framework or vanilla JS

```javascript
// Basic custom element
class MyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        button { background: blue; color: white; }
      </style>
      <button><slot></slot></button>
    `;
  }
}
customElements.define('my-button', MyButton);

// Usage
<my-button>Click me</my-button>
```

**Key benefits:**
- True CSS encapsulation
- Reusable across frameworks
- Native browser performance
- Standard web API

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Web Components solve fundamental problems in web development:

**Component reusability:**
- Create truly reusable components across different projects
- Work with any framework (React, Vue, Angular) or vanilla JS
- Avoid framework lock-in and component rewrites

**Style encapsulation:**
- CSS scoping without build tools or naming conventions
- Prevent style leaks and conflicts
- True component isolation like native HTML elements

**Standards-based approach:**
- Native browser APIs, no framework dependency
- Progressive enhancement and graceful degradation
- Future-proof with web standards

**Complexity management:**
- Encapsulate complex functionality into simple tags
- Hide implementation details from consumers
- Compose larger applications from smaller components

</details>

<details>
<summary>How it works</summary>
**1. Custom Elements API:**
```javascript
class ProgressBar extends HTMLElement {
  constructor() {
    super();
    this._value = 0;
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  // Lifecycle callbacks
  connectedCallback() {
    console.log('Element added to DOM');
    this.addEventListener('click', this.handleClick);
  }
  
  disconnectedCallback() {
    console.log('Element removed from DOM');
    this.removeEventListener('click', this.handleClick);
  }
  
  static get observedAttributes() {
    return ['value', 'max'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') {
      this._value = parseInt(newValue) || 0;
      this.render();
    }
  }
  
  // Custom getter/setter
  get value() {
    return this._value;
  }
  
  set value(val) {
    this.setAttribute('value', val);
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 200px;
          height: 20px;
          background: #eee;
          border-radius: 10px;
          overflow: hidden;
        }
        .bar {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          width: ${this._value}%;
          transition: width 0.3s ease;
        }
      </style>
      <div class="bar"></div>
    `;
  }
  
  handleClick = () => {
    this.dispatchEvent(new CustomEvent('progress-click', {
      detail: { value: this._value },
      bubbles: true
    }));
  }
}

customElements.define('progress-bar', ProgressBar);
```

**2. Shadow DOM Encapsulation:**
```javascript
// Open shadow root (accessible via element.shadowRoot)
const shadowOpen = element.attachShadow({ mode: 'open' });

// Closed shadow root (not accessible from outside)
const shadowClosed = element.attachShadow({ mode: 'closed' });

// CSS encapsulation
class StyledButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        /* :host targets the custom element itself */
        :host {
          display: inline-block;
        }
        
        /* :host() with selector */
        :host(.primary) button {
          background: blue;
        }
        
        /* :host-context() for parent context */
        :host-context(.dark-theme) button {
          background: #333;
          color: white;
        }
        
        /* ::slotted() targets slotted content */
        ::slotted(span) {
          font-weight: bold;
        }
        
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
      <button>
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }
}
```

**3. Templates and Slots:**
```html
<!-- Template definition -->
<template id="card-template">
  <style>
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin: 8px;
    }
    .header { font-weight: bold; }
    .content { margin-top: 8px; }
  </style>
  <div class="card">
    <div class="header">
      <slot name="header">Default Header</slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
class CardElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Clone template
    const template = document.getElementById('card-template');
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}
customElements.define('card-element', CardElement);
</script>

<!-- Usage with slots -->
<card-element>
  <span slot="header">Custom Title</span>
  <p>This is the card content</p>
</card-element>
```

**4. Advanced Patterns:**
```javascript
// Form-associated custom elements
class CustomInput extends HTMLElement {
  static formAssociated = true;
  
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  // Form integration
  get form() { return this.internals.form; }
  get name() { return this.getAttribute('name'); }
  get type() { return this.localName; }
  get value() { return this._value; }
  
  set value(v) {
    this._value = v;
    this.internals.setFormValue(v);
  }
  
  // Validation
  checkValidity() {
    return this.internals.checkValidity();
  }
  
  setCustomValidity(message) {
    this.internals.setValidity({ customError: true }, message);
  }
}
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Web Components replace React/Vue/Angular"**
- Web Components are low-level primitives
- Frameworks provide higher-level abstractions, state management, etc.
- They can complement frameworks, not necessarily replace them

**❌ "Shadow DOM provides complete isolation"**
```javascript
// ❌ Events still bubble through shadow boundaries
// ❌ Some CSS properties inherit (color, font-family)
// ✅ Only styling and DOM queries are encapsulated

// Event handling across shadow boundaries
shadowRoot.addEventListener('click', (e) => {
  console.log(e.target); // Element inside shadow DOM
  console.log(e.composedPath()); // Full path including shadow DOM
});
```

**❌ "Custom elements must extend HTMLElement"**
```javascript
// Can extend built-in elements (customized built-in elements)
class FancyButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener('click', this.handleClick);
  }
}

// Different registration syntax
customElements.define('fancy-button', FancyButton, { extends: 'button' });

// Usage
<button is="fancy-button">Enhanced button</button>
```

**❌ "Template elements are required"**
- Templates are helpful but not mandatory
- Can create DOM structure programmatically
- Templates provide better performance for repeated use

**❌ "Web Components work the same across all browsers"**
- Need polyfills for older browsers
- Some features have limited support (form-associated elements)
- Progressive enhancement approach recommended

</details>

<details>
<summary>Interview angle</summary>
**Common questions:**

**Q: "How do Web Components compare to React components?"**
```javascript
// Web Component
class TodoItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>/* encapsulated styles */</style>
      <div class="todo">${this.getAttribute('text')}</div>
    `;
  }
}

// React Component
function TodoItem({ text, onComplete }) {
  return <div className="todo">{text}</div>;
}

// Key differences:
// - Web Components: Browser native, framework agnostic
// - React: Library-specific, better ecosystem and tooling
// - Web Components: True encapsulation
// - React: Virtual DOM, better performance for dynamic UIs
```

**Q: "How would you handle state management in Web Components?"**
```javascript
// Local state
class Counter extends HTMLElement {
  constructor() {
    super();
    this._count = 0;
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  increment() {
    this._count++;
    this.render();
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this._count }
    }));
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <button>Count: ${this._count}</button>
    `;
    this.shadowRoot.querySelector('button').onclick = () => this.increment();
  }
}

// Global state (Redux-like)
class StateConnectedElement extends HTMLElement {
  connectedCallback() {
    store.subscribe(() => this.render());
    this.render();
  }
  
  disconnectedCallback() {
    store.unsubscribe(this.render);
  }
}
```

**Q: "How do you test Web Components?"**
```javascript
// Testing custom elements
describe('ProgressBar', () => {
  let element;
  
  beforeEach(() => {
    element = document.createElement('progress-bar');
    document.body.appendChild(element);
  });
  
  afterEach(() => {
    document.body.removeChild(element);
  });
  
  it('should update value attribute', () => {
    element.setAttribute('value', '50');
    expect(element.value).toBe(50);
  });
  
  it('should dispatch custom events', () => {
    const spy = jest.fn();
    element.addEventListener('progress-click', spy);
    element.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: 0 }
      })
    );
  });
});
```

**Q: "When would you use Web Components vs a framework?"**

**Use Web Components when:**
- Building design systems or component libraries
- Need framework-agnostic components
- Want true style encapsulation
- Building simple, reusable widgets
- Progressive enhancement of existing sites

**Use frameworks when:**
- Building complex applications
- Need rich state management
- Want extensive tooling and ecosystem
- Working with dynamic, data-driven UIs
- Team is already familiar with the framework

**Performance considerations:**
- Web Components have faster initial load (no framework)
- Frameworks better for frequent updates (virtual DOM)
- Web Components better for static/simple components
- Consider bundle size vs feature requirements

</details>