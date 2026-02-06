# DOM Manipulation

## ⚡ Quick Revision

- **DOM**: Document Object Model - tree representation of HTML
- **Selection**: `querySelector`, `querySelectorAll`, `getElementById`
- **Creation**: `createElement`, `createTextNode`, `cloneNode`
- **Modification**: `innerHTML`, `textContent`, `setAttribute`, `classList`
- **Insertion**: `appendChild`, `insertBefore`, `append`, `prepend`
- **Performance**: Minimize reflows, use DocumentFragment, batch updates

### Key Points

- DOM operations are expensive (trigger reflows/repaints)
- `textContent` safer than `innerHTML` (no XSS risk)
- `querySelectorAll` returns static NodeList, not live
- Modern methods: `append`, `prepend`, `before`, `after`, `replaceWith`
- Use `classList` instead of `className` manipulation
- Cache DOM references to avoid repeated queries

### Selection Methods

```javascript
// Modern selection (preferred)
const element = document.querySelector('.class');
const elements = document.querySelectorAll('.class');

// Classic selection
const byId = document.getElementById('id');
const byClass = document.getElementsByClassName('class'); // Live HTMLCollection
const byTag = document.getElementsByTagName('div'); // Live HTMLCollection

// Difference: Live vs Static
const live = document.getElementsByClassName('item');
const static = document.querySelectorAll('.item');

document.body.innerHTML += '<div class="item">New</div>';
console.log(live.length); // Updated (live)
console.log(static.length); // Not updated (static)

// Check existence
if (element) {
  // Element exists
}

// Descendant selection
const parent = document.querySelector('.parent');
const child = parent.querySelector('.child'); // Within parent only
```

### Creating Elements

```javascript
// Create element
const div = document.createElement('div');
div.className = 'container';
div.id = 'main';

// Set text content
div.textContent = 'Hello'; // Safe, escapes HTML

// Set HTML (use carefully - XSS risk)
div.innerHTML = '<span>Hello</span>';

// Create text node
const text = document.createTextNode('Hello');
div.appendChild(text);

// Set attributes
div.setAttribute('data-id', '123');
div.setAttribute('aria-label', 'Main container');

// Remove attribute
div.removeAttribute('data-id');

// Clone element
const clone = div.cloneNode(true); // true = deep clone (includes children)
```

### Modifying Elements

```javascript
// Content
element.textContent = 'Text only'; // Escapes HTML
element.innerHTML = '<b>HTML</b>'; // Parses HTML (XSS risk!)

// Attributes
element.id = 'new-id';
element.className = 'class1 class2';
element.setAttribute('data-value', '42');
const value = element.getAttribute('data-value');

// Classes (preferred over className)
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('expanded');
element.classList.contains('active'); // true/false
element.classList.replace('old', 'new');

// Style (use for dynamic changes)
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.display = 'none';

// Better: Use classes for styling
element.classList.add('highlighted'); // CSS: .highlighted { color: red; }

// Data attributes
element.dataset.userId = '123'; // data-user-id="123"
const userId = element.dataset.userId;
```

### Inserting Elements

```javascript
// Classic methods
parent.appendChild(child); // Add to end
parent.insertBefore(newChild, referenceChild); // Insert before
parent.removeChild(child); // Remove
parent.replaceChild(newChild, oldChild); // Replace

// Modern methods (more intuitive)
parent.append(child1, child2, 'text'); // Add multiple to end
parent.prepend(child); // Add to beginning
element.before(sibling); // Insert before element
element.after(sibling); // Insert after element
element.replaceWith(newElement); // Replace element
element.remove(); // Remove element

// Insert adjacent
element.insertAdjacentHTML('beforebegin', '<div>Before</div>');
// Positions: 'beforebegin', 'afterbegin', 'beforeend', 'afterend'

element.insertAdjacentElement('beforeend', newElement);
element.insertAdjacentText('afterbegin', 'Text');
```

### Performance Optimization

```javascript
// BAD: Multiple reflows
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div); // Reflow each iteration!
}

// GOOD: DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div); // No reflow
}
document.body.appendChild(fragment); // Single reflow

// GOOD: Build HTML string (careful with XSS)
const html = Array.from({ length: 1000 }, (_, i) => 
  `<div>Item ${i}</div>`
).join('');
container.innerHTML = html; // Single reflow

// Cache DOM references
// BAD
for (let i = 0; i < 100; i++) {
  document.querySelector('.container').appendChild(child); // Query every time!
}

// GOOD
const container = document.querySelector('.container'); // Query once
for (let i = 0; i < 100; i++) {
  container.appendChild(child);
}

// Batch style changes
// BAD: Multiple reflows
element.style.width = '100px'; // Reflow
element.style.height = '100px'; // Reflow
element.style.padding = '10px'; // Reflow

// GOOD: Use class
element.classList.add('sized'); // Single reflow

// GOOD: Use cssText
element.style.cssText = 'width: 100px; height: 100px; padding: 10px;';
```

### Common Pitfalls

```javascript
// Pitfall 1: innerHTML with user content (XSS)
const userInput = '<img src=x onerror=alert("XSS")>';
element.innerHTML = userInput; // XSS vulnerability!

// Fix: Use textContent
element.textContent = userInput; // Escaped, safe

// Or sanitize HTML
const sanitized = DOMPurify.sanitize(userInput);
element.innerHTML = sanitized;

// Pitfall 2: Modifying live collections while iterating
const items = document.getElementsByClassName('item');
for (let i = 0; i < items.length; i++) {
  items[i].remove(); // Changes items.length!
}

// Fix: Convert to array or iterate backwards
Array.from(items).forEach(item => item.remove());
// Or
for (let i = items.length - 1; i >= 0; i--) {
  items[i].remove();
}

// Pitfall 3: querySelector returns null
const element = document.querySelector('.nonexistent');
element.classList.add('active'); // TypeError!

// Fix: Check existence
const element = document.querySelector('.maybe');
if (element) {
  element.classList.add('active');
}

// Or optional chaining
element?.classList.add('active');

// Pitfall 4: Expensive operations in loops
// BAD
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = elements[i].offsetWidth + 10 + 'px'; // Forces reflow each time!
}

// GOOD
const widths = elements.map(el => el.offsetWidth); // Batch read
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = widths[i] + 10 + 'px'; // Batch write
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
### Before DOM

**Static HTML (Early Web)**
```html
<!-- Pages were static -->
<html>
  <body>
    <h1>Title</h1>
    <p>Content</p>
  </body>
</html>
<!-- No dynamic updates -->
<!-- Required page refresh for changes -->
```

**DOM Invention (1998)**
- W3C standardized DOM
- Programmatic access to document structure
- Dynamic page updates without refresh
- Foundation for modern web apps

### Why DOM Matters

1. **Dynamic Content**: Update pages without reload
2. **User Interaction**: Respond to events, update UI
3. **Single Page Apps**: Build app-like experiences
4. **API for HTML**: Structured, programmatic access
5. **Cross-platform**: Standard API across browsers

### Real-World Use Cases

```javascript
// 1. Form validation
form.addEventListener('submit', (e) => {
  const input = form.querySelector('input[name="email"]');
  if (!isValidEmail(input.value)) {
    e.preventDefault();
    showError(input, 'Invalid email');
  }
});

// 2. Dynamic lists
function addTodo(text) {
  const li = document.createElement('li');
  li.textContent = text;
  todoList.appendChild(li);
}

// 3. Conditional rendering
if (user.isLoggedIn) {
  navBar.querySelector('.login').style.display = 'none';
  navBar.querySelector('.profile').style.display = 'block';
}

// 4. Lazy loading
observer.observe(image, {
  root: null,
  threshold: 0.1
});
```
</details>

<details>
<summary>How it works</summary>
### DOM Tree Structure

```javascript
// HTML document
<html>
  <body>
    <div id="container">
      <p>Paragraph</p>
    </div>
  </body>
</html>

// DOM tree representation:
// Document
//   └─ html (Element)
//      └─ body (Element)
//         └─ div (Element) id="container"
//            └─ p (Element)
//               └─ "Paragraph" (Text)

// Accessing nodes
const html = document.documentElement;
const body = document.body;
const container = document.getElementById('container');
const p = container.firstElementChild;
const text = p.firstChild;
```

### Node Types

```javascript
// Common node types
console.log(document.ELEMENT_NODE); // 1
console.log(document.TEXT_NODE); // 3
console.log(document.COMMENT_NODE); // 8
console.log(document.DOCUMENT_NODE); // 9

const element = document.querySelector('div');
console.log(element.nodeType); // 1 (ELEMENT_NODE)
console.log(element.nodeName); // "DIV"

// Navigation
element.parentNode; // Parent
element.childNodes; // All children (including text nodes)
element.children; // Only element children
element.firstChild; // First child (any node type)
element.firstElementChild; // First element child
element.nextSibling; // Next sibling (any node type)
element.nextElementSibling; // Next element sibling
```

### Reflow and Repaint

```javascript
// REFLOW (Layout recalculation - expensive)
// Triggered by:
element.offsetWidth; // Reading layout properties
element.style.width = '100px'; // Changing layout properties
element.classList.add('wide'); // If class affects layout

// REPAINT (Visual update - cheaper)
// Triggered by:
element.style.color = 'red'; // Changing visual properties
element.style.background = 'blue';

// Browser optimization: Batches reflows
element.style.width = '100px';
element.style.height = '100px';
element.style.padding = '10px';
// Only one reflow!

// Force immediate reflow
element.style.width = '100px';
const width = element.offsetWidth; // Forces reflow!
element.style.height = '100px'; // New reflow
```

### Critical Rendering Path

```javascript
// 1. Parse HTML -> DOM tree
// 2. Parse CSS -> CSSOM tree
// 3. Combine DOM + CSSOM -> Render tree
// 4. Layout (calculate positions)
// 5. Paint (draw pixels)

// JavaScript blocks parsing
<script src="blocking.js"></script>
// HTML parsing stops until script loads and executes

// Solutions:
<script src="async.js" async></script> // Load in parallel, execute when ready
<script src="defer.js" defer></script> // Load in parallel, execute after DOM

// Modern approach: type="module" (defer by default)
<script type="module" src="module.js"></script>
```

### Virtual DOM Concept

```javascript
// Problem: Direct DOM manipulation is slow

// Solution: Virtual DOM (used by React, Vue)
// 1. Keep virtual representation in memory
// 2. Apply changes to virtual DOM (fast)
// 3. Diff virtual DOM with real DOM
// 4. Batch and apply minimal changes

// Conceptual example
const vdom = {
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'p', props: {}, children: ['Text'] }
  ]
};

// When updating:
// 1. Create new vdom
// 2. Diff with old vdom
// 3. Apply only differences to real DOM
```
</details>

<details>
<summary>Common misconceptions</summary>
### Misconception 1: "innerHTML is faster than DOM methods"

**Reality**: Depends on use case

```javascript
// innerHTML faster for large HTML strings
container.innerHTML = `
  <div>Item 1</div>
  <div>Item 2</div>
  ...
  <div>Item 1000</div>
`;

// DOM methods faster for small changes
const div = document.createElement('div');
div.textContent = 'Single item';
container.appendChild(div);

// innerHTML risks:
// 1. XSS vulnerabilities
// 2. Destroys existing event listeners
// 3. Parses entire HTML string
```

### Misconception 2: "Accessing DOM is always slow"

**Reality**: Reading is usually fast, writing triggers reflow

```javascript
// Fast (reading)
const width = element.offsetWidth;
const height = element.offsetHeight;

// Slow (writing - forces reflow)
element.style.width = '100px';

// Thrashing (read-write-read-write)
// BAD: Forces multiple reflows
element.style.width = element.offsetWidth + 10 + 'px'; // Read, write, reflow
element.style.height = element.offsetHeight + 10 + 'px'; // Read, write, reflow

// GOOD: Batch reads, then writes
const width = element.offsetWidth;
const height = element.offsetHeight;
element.style.width = width + 10 + 'px';
element.style.height = height + 10 + 'px';
```

### Misconception 3: "querySelectorAll returns array"

**Reality**: Returns NodeList (array-like object)

```javascript
const elements = document.querySelectorAll('.item');

// Has length and indexing
console.log(elements.length);
console.log(elements[0]);

// Has forEach
elements.forEach(el => console.log(el));

// But NOT other array methods
elements.map(el => el.textContent); // TypeError!

// Convert to array
const array = Array.from(elements);
const array2 = [...elements];
```

### Misconception 4: "Removing element removes event listeners"

**Reality**: Listeners remain if element is still referenced

```javascript
let button = document.querySelector('button');

button.addEventListener('click', handler);

button.remove(); // Removed from DOM

// But button is still referenced!
// Event listener still attached
// Memory leak if button is kept

// Fix: Remove listener or set to null
button.removeEventListener('click', handler);
button = null;
```

### Misconception 5: "Display none removes element from DOM"

**Reality**: Element stays in DOM, just hidden

```javascript
element.style.display = 'none';

// Element still in DOM
document.querySelector('#hidden'); // Found!

// Still accessible to JavaScript
element.textContent = 'Updated'; // Works

// Doesn't trigger reflow for hidden element
// But does trigger reflow when showing

// To remove from DOM:
element.remove();
```
</details>

<details>
<summary>Interview angle</summary>
### Essential Interview Questions

**Q1: "What's the difference between innerHTML and textContent?"**

```javascript
const div = document.createElement('div');

// textContent - plain text
div.textContent = '<b>Bold</b>';
console.log(div.textContent); // '<b>Bold</b>' (literal text)
// DOM: Text node with content '<b>Bold</b>'

// innerHTML - parses HTML
div.innerHTML = '<b>Bold</b>';
console.log(div.innerHTML); // '<b>Bold</b>'
// DOM: Element node <b> with text 'Bold'

// Security:
const userInput = '<img src=x onerror=alert("XSS")>';
div.textContent = userInput; // Safe (escaped)
div.innerHTML = userInput; // Unsafe (XSS!)

// Performance:
// textContent faster (no parsing)
// innerHTML convenient for complex HTML
```

**Q2: "How do you optimize DOM manipulation?"**

```javascript
// 1. Batch updates with DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
container.appendChild(fragment); // Single reflow

// 2. Cache DOM references
const container = document.querySelector('.container');
for (let i = 0; i < 100; i++) {
  container.appendChild(child); // No repeated query
}

// 3. Use classes instead of inline styles
// BAD
element.style.width = '100px';
element.style.height = '100px';
element.style.color = 'red';

// GOOD
element.classList.add('styled'); // CSS: .styled { ... }

// 4. Minimize reflows
// Read all, then write all
const widths = elements.map(el => el.offsetWidth); // Batch read
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'; // Batch write
});

// 5. Remove from DOM for major changes
const parent = element.parentNode;
const next = element.nextSibling;
parent.removeChild(element);

// Make changes (no reflow)
for (let i = 0; i < 100; i++) {
  element.appendChild(child);
}

// Reinsert (single reflow)
parent.insertBefore(element, next);

// 6. Use event delegation
// Instead of listeners on each item
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    // Handle click
  }
});
```

**Q3: "Explain the difference between NodeList and HTMLCollection"**

```javascript
// NodeList (querySelectorAll)
const nodeList = document.querySelectorAll('.item');
// - Static (doesn't update)
// - Can contain any node type
// - Has forEach method

// HTMLCollection (getElementsByClassName, etc.)
const htmlCollection = document.getElementsByClassName('item');
// - Live (auto-updates)
// - Only element nodes
// - No forEach method

// Demonstration:
const nl = document.querySelectorAll('.item'); // 3 items
const hc = document.getElementsByClassName('item'); // 3 items

document.body.innerHTML += '<div class="item">New</div>';

console.log(nl.length); // 3 (static, not updated)
console.log(hc.length); // 4 (live, updated)

// Live collection pitfall:
for (let i = 0; i < hc.length; i++) {
  hc[i].remove(); // Modifies collection while iterating!
}

// Fix: Convert to array
Array.from(hc).forEach(item => item.remove());
```

**Q4: "How do you create and insert multiple elements efficiently?"**

```javascript
// Method 1: DocumentFragment
function createList(items) {
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    fragment.appendChild(li);
  });
  
  return fragment;
}

const list = document.querySelector('ul');
list.appendChild(createList(['A', 'B', 'C']));

// Method 2: Template literals (watch for XSS)
function createListHTML(items) {
  const html = items
    .map(item => `<li>${escapeHTML(item)}</li>`)
    .join('');
  list.innerHTML = html;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Method 3: Template element
<template id="item-template">
  <li class="item">
    <span class="name"></span>
  </li>
</template>

function createFromTemplate(name) {
  const template = document.getElementById('item-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.name').textContent = name;
  return clone;
}

list.appendChild(createFromTemplate('Item 1'));
```

**Q5: "What triggers reflows and how do you minimize them?"**

```javascript
// Triggers reflow (reading):
element.offsetWidth, offsetHeight
element.clientWidth, clientHeight
element.scrollWidth, scrollHeight
element.getBoundingClientRect()
window.getComputedStyle()

// Triggers reflow (writing):
element.style.width = '100px'
element.classList.add('wide') // If affects layout
element.textContent = 'text' // If changes size

// Minimize reflows:

// 1. Batch reads and writes
// BAD
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px'; // Read-write per element
});

// GOOD
const widths = elements.map(el => el.offsetWidth); // Batch read
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'; // Batch write
});

// 2. Use transform instead of position changes
// BAD (triggers reflow)
element.style.left = '100px';

// GOOD (doesn't trigger reflow, only repaint)
element.style.transform = 'translateX(100px)';

// 3. Use visibility instead of display for animations
// display: none/block triggers reflow
// visibility: hidden/visible only repaints

// 4. Use requestAnimationFrame for animations
function animate() {
  element.style.transform = `translateX(${x}px)`;
  x += 1;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### Pro Tips for Interviews

1. **Know performance implications**: Reflow vs repaint
2. **Security awareness**: XSS risks with innerHTML
3. **Modern methods**: append, prepend, before, after
4. **Optimization techniques**: DocumentFragment, batching
5. **NodeList vs HTMLCollection**: Static vs live
6. **Event delegation**: Better than many listeners
7. **Mention frameworks**: How React/Vue optimize DOM
</details>
