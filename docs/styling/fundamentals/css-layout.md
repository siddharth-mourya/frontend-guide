# CSS Layout: Flexbox & Grid

## ⚡ Quick Revision

**Flexbox** - One-dimensional layout (row or column)
**Grid** - Two-dimensional layout (rows and columns)

```css
/* Flexbox - align items in a row/column */
.flex-container {
  display: flex;
  justify-content: space-between; /* main axis */
  align-items: center; /* cross axis */
  gap: 1rem;
}

/* Grid - create 2D layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
```

**Key decision: Use Flexbox for linear layouts, Grid for 2D layouts**

**Flexbox use cases:**
- Navigation bars
- Centering content
- Distributing space between items
- Card layouts that wrap

**Grid use cases:**
- Page layouts (header, sidebar, content, footer)
- Photo galleries
- Complex responsive layouts
- Overlapping elements

---

## 🧠 Deep Understanding

<details>
<summary>Flexbox fundamentals</summary>
**Concept**: One-dimensional layout system for arranging items in rows or columns.

**Main concepts:**
- **Main axis**: Primary direction (row or column)
- **Cross axis**: Perpendicular to main axis
- **Flex container**: Parent with `display: flex`
- **Flex items**: Children of flex container

**Container properties:**
```css
.flex-container {
  display: flex; /* or inline-flex */
  
  /* Direction */
  flex-direction: row; /* row | column | row-reverse | column-reverse */
  
  /* Wrapping */
  flex-wrap: wrap; /* nowrap | wrap | wrap-reverse */
  
  /* Shorthand for direction + wrap */
  flex-flow: row wrap;
  
  /* Main axis alignment */
  justify-content: flex-start; 
  /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  
  /* Cross axis alignment */
  align-items: stretch;
  /* stretch | flex-start | flex-end | center | baseline */
  
  /* Multi-line cross axis alignment */
  align-content: flex-start;
  /* flex-start | flex-end | center | space-between | space-around | stretch */
  
  /* Gap between items */
  gap: 1rem; /* Modern, replaces margin tricks */
}
```

**Item properties:**
```css
.flex-item {
  /* Growth factor (how much to grow) */
  flex-grow: 0; /* Default: don't grow */
  
  /* Shrink factor (how much to shrink) */
  flex-shrink: 1; /* Default: can shrink */
  
  /* Base size before growing/shrinking */
  flex-basis: auto; /* auto | 0 | 200px | 50% */
  
  /* Shorthand: grow shrink basis */
  flex: 0 1 auto; /* Default */
  flex: 1; /* Same as: 1 1 0 */
  
  /* Individual cross-axis alignment */
  align-self: auto;
  /* auto | flex-start | flex-end | center | baseline | stretch */
  
  /* Order */
  order: 0; /* Default: source order */
}
```

**Common patterns:**

**1. Center element:**
```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**2. Navbar with space between:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**3. Equal-width columns:**
```css
.columns {
  display: flex;
  gap: 1rem;
}
.column {
  flex: 1; /* Equal distribution */
}
```

**4. Sidebar layout:**
```css
.layout {
  display: flex;
}
.sidebar {
  flex: 0 0 250px; /* Don't grow, don't shrink, 250px wide */
}
.content {
  flex: 1; /* Take remaining space */
}
```

**5. Wrapping cards:**
```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card {
  flex: 1 1 300px; /* Grow, shrink, min 300px */
}
```
</details>

<details>
<summary>Grid fundamentals</summary>
**Concept**: Two-dimensional layout system for rows and columns simultaneously.

**Container properties:**
```css
.grid-container {
  display: grid; /* or inline-grid */
  
  /* Define columns */
  grid-template-columns: 200px 1fr 2fr;
  /* Fixed sizes, fr units, auto, min-content, max-content */
  
  /* Define rows */
  grid-template-rows: 100px auto 1fr;
  
  /* Repeat pattern */
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  
  /* Named grid areas */
  grid-template-areas:
    "header header header"
    "sidebar content content"
    "footer footer footer";
  
  /* Gap between items */
  gap: 1rem; /* or row-gap and column-gap */
  
  /* Alignment of entire grid */
  justify-content: start;
  /* start | end | center | stretch | space-around | space-between | space-evenly */
  
  align-content: start;
  /* start | end | center | stretch | space-around | space-between | space-evenly */
  
  /* Default alignment for items */
  justify-items: stretch; /* Horizontal alignment */
  align-items: stretch; /* Vertical alignment */
  
  /* Implicit grid (auto-created rows) */
  grid-auto-rows: 100px;
  grid-auto-columns: 200px;
  grid-auto-flow: row; /* row | column | dense */
}
```

**Item properties:**
```css
.grid-item {
  /* Position by line numbers */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  
  /* Shorthand */
  grid-column: 1 / 3; /* Start / End */
  grid-row: 1 / 2;
  
  /* Span notation */
  grid-column: span 2; /* Span 2 columns */
  grid-row: 1 / span 2; /* Start at 1, span 2 rows */
  
  /* Named areas */
  grid-area: header;
  
  /* Individual alignment */
  justify-self: center; /* Horizontal */
  align-self: center; /* Vertical */
  
  /* Z-index works with grid items */
  z-index: 1;
}
```

**fr unit**: Fraction of available space
```css
/* 1fr = 1 part, 2fr = 2 parts */
grid-template-columns: 1fr 2fr 1fr;
/* First column gets 25%, second 50%, third 25% */
```

**Common patterns:**

**1. Basic grid:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

**2. Responsive grid (auto-fit):**
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
/* Creates as many columns as fit, minimum 250px each */
```

**3. Page layout with named areas:**
```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar content aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

**4. Holy Grail layout:**
```css
.holy-grail {
  display: grid;
  grid-template: auto 1fr auto / 200px 1fr 200px;
  /* rows / columns shorthand */
  min-height: 100vh;
}

.header { grid-column: 1 / -1; } /* Span all columns */
.footer { grid-column: 1 / -1; }
```

**5. Overlapping items:**
```css
.card {
  display: grid;
  grid-template: 1fr / 1fr;
}

.card > * {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  /* All items in same cell = overlap */
}

.card-image { z-index: 1; }
.card-content { z-index: 2; align-self: end; }
```

**6. Asymmetric layout:**
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 1rem;
}

.featured {
  grid-column: span 2;
  grid-row: span 2;
}
```
</details>

<details>
<summary>When to use Flexbox vs Grid</summary>
**Use Flexbox when:**

1. **One-dimensional layout**: Items in a single row or column
```css
/* Navigation bar */
.nav { display: flex; gap: 2rem; }
```

2. **Content-driven sizing**: Let content determine layout
```css
/* Tags that wrap based on content */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

3. **Alignment in single direction**: Center or distribute items
```css
/* Center modal */
.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

4. **Dynamic number of items**: Unknown or changing item count
```css
/* Form actions - could be 1-4 buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
```

5. **Grow/shrink behavior**: Items should expand/contract
```css
/* Search bar - button fixed, input grows */
.search {
  display: flex;
}
.search-input { flex: 1; }
.search-button { flex: 0 0 auto; }
```

**Use Grid when:**

1. **Two-dimensional layout**: Rows AND columns matter
```css
/* Dashboard with specific row/column structure */
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
}
```

2. **Layout-driven sizing**: Define structure first, content fits in
```css
/* Gallery with specific pattern */
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 300px);
}
```

3. **Precise placement**: Items at specific rows/columns
```css
/* Calendar grid */
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.event { grid-column: 3 / 5; grid-row: 2; }
```

4. **Overlapping elements**: Stack items on z-axis
```css
/* Image with overlay text */
.hero {
  display: grid;
  grid-template: 1fr / 1fr;
}
.hero-image, .hero-text {
  grid-area: 1 / 1;
}
```

5. **Responsive without media queries**: Auto-fit/auto-fill
```css
/* Automatically responsive grid */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

**Comparison table:**

| Scenario | Flexbox | Grid |
|----------|---------|------|
| Navigation bar | ✅ Best | ❌ Overkill |
| Card grid | ✅ Works | ✅ Better |
| Page layout | ❌ Complex | ✅ Best |
| Centering | ✅ Best | ✅ Works |
| Form row | ✅ Best | ❌ Overkill |
| Dashboard | ❌ Hard | ✅ Best |
| Gallery | ✅ Works | ✅ Better |
| Sidebar layout | ✅ Works | ✅ Works |

**Hybrid approach** (common):
```css
/* Grid for page structure */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Flexbox for navbar content */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Grid for content cards */
.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Flexbox inside cards */
.card {
  display: flex;
  flex-direction: column;
}
.card-content {
  flex: 1;
}
```
</details>

<details>
<summary>Advanced Flexbox techniques</summary>
**1. Flex grow/shrink calculations:**
```css
/* Container: 900px width */
.container { display: flex; width: 900px; }

/* Items */
.item-1 { flex: 1 0 200px; } /* grow: 1, shrink: 0, basis: 200px */
.item-2 { flex: 2 0 200px; } /* grow: 2, shrink: 0, basis: 200px */
.item-3 { flex: 1 0 200px; } /* grow: 1, shrink: 0, basis: 200px */

/* Available space: 900 - (200 + 200 + 200) = 300px */
/* Total grow factors: 1 + 2 + 1 = 4 */
/* Item 1: 200 + (300 * 1/4) = 275px */
/* Item 2: 200 + (300 * 2/4) = 350px */
/* Item 3: 200 + (300 * 1/4) = 275px */
```

**2. Margin auto trick:**
```css
.navbar {
  display: flex;
}
.logo { /* Stays left */ }
.actions { margin-left: auto; } /* Pushes to right */
```

**3. Sticky footer with flexbox:**
```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1; /* Takes available space */
}
footer {
  flex-shrink: 0;
}
```

**4. Ordering with order property:**
```css
.navbar {
  display: flex;
}
.logo { order: 2; }
.menu { order: 1; }
.search { order: 3; }

/* Visual order: menu, logo, search */
/* ⚠️ Doesn't change tab order or screen readers */
```

**5. Multi-line alignment:**
```css
.tags {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start; /* Align wrapped lines */
  gap: 0.5rem;
}
```

**6. Aspect ratio boxes:**
```css
.video-container {
  display: flex;
  aspect-ratio: 16 / 9;
}
.video {
  flex: 1;
}
```

**7. Gap fallback for older browsers:**
```css
.flex-container {
  display: flex;
  gap: 1rem; /* Modern browsers */
  margin: -0.5rem; /* Fallback */
}
.flex-item {
  margin: 0.5rem; /* Fallback */
}
```
</details>

<details>
<summary>Advanced Grid techniques</summary>
**1. auto-fit vs auto-fill:**
```css
/* auto-fit: Collapses empty tracks */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 3 items = 3 columns taking full width */

/* auto-fill: Keeps empty tracks */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
/* 3 items might create 4 columns with last empty */
```

**2. minmax() for responsive sizing:**
```css
/* Minimum 250px, maximum 1fr */
grid-template-columns: repeat(3, minmax(250px, 1fr));

/* Prevents shrinking below min-content */
grid-template-columns: minmax(min-content, 300px) 1fr;
```

**3. Subgrid (modern browsers):**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.nested-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid; /* Inherit parent's columns */
}
```

**4. Dense packing:**
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: dense;
  /* Fills gaps with smaller items */
}

.large { grid-column: span 2; grid-row: span 2; }
```

**5. Implicit grid control:**
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
  /* Auto-created rows follow this pattern */
}
```

**6. Named lines:**
```css
.layout {
  display: grid;
  grid-template-columns:
    [sidebar-start] 250px
    [sidebar-end content-start] 1fr
    [content-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
}
```

**7. Fractional units calculation:**
```css
grid-template-columns: 200px 1fr 2fr 100px;
/* Container: 1000px */
/* Fixed: 200 + 100 = 300px */
/* Available: 1000 - 300 = 700px */
/* fr total: 1 + 2 = 3 */
/* 1fr = 700/3 = 233px */
/* 2fr = 466px */
/* Result: 200px | 233px | 466px | 100px */
```

**8. Grid item spanning:**
```css
/* Span to end of grid */
.full-width { grid-column: 1 / -1; }

/* Span from current to 2 columns */
.wide { grid-column: span 2; }

/* Start at line 2, end at line 5 */
.specific { grid-column: 2 / 5; }
```

**9. Grid template areas responsive:**
```css
.page {
  display: grid;
  grid-template-areas:
    "header"
    "content"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .page {
    grid-template-areas:
      "header header"
      "sidebar content"
      "footer footer";
    grid-template-columns: 250px 1fr;
  }
}
```

**10. Alignment shortcuts:**
```css
/* Center item both ways */
.centered {
  display: grid;
  place-items: center;
  /* Shorthand for: align-items + justify-items */
}

/* Center grid itself */
.centered-grid {
  display: grid;
  place-content: center;
  /* Shorthand for: align-content + justify-content */
}
```
</details>

<details>
<summary>Common layout patterns</summary>
**1. Holy Grail Layout:**
```css
.holy-grail {
  display: grid;
  grid-template:
    "header header header" auto
    "nav content aside" 1fr
    "footer footer footer" auto
    / 200px 1fr 200px;
  min-height: 100vh;
}
```

**2. Sidebar Layout:**
```css
/* Flexbox version */
.sidebar-layout {
  display: flex;
}
.sidebar { flex: 0 0 250px; }
.content { flex: 1; }

/* Grid version */
.sidebar-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
}
```

**3. Responsive Card Grid:**
```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

**4. Media Object:**
```css
.media {
  display: flex;
  gap: 1rem;
}
.media-image { flex-shrink: 0; }
.media-content { flex: 1; }
```

**5. Centered Container:**
```css
.centered {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

**6. Pancake Stack:**
```css
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
/* Header, content, footer stack */
```

**7. 12-Column Grid System:**
```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}
.col-6 { grid-column: span 6; }
.col-4 { grid-column: span 4; }
.col-3 { grid-column: span 3; }
```

**8. RAM (Repeat, Auto, Minmax) Pattern:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
/* Automatically responsive, no media queries */
```

**9. Flexbox Navigation:**
```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-links {
  display: flex;
  gap: 2rem;
}
```

**10. Overlapping Card:**
```css
.overlap-card {
  display: grid;
  grid-template: 300px / 1fr;
}
.card-image, .card-content {
  grid-area: 1 / 1;
}
.card-content {
  align-self: end;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}
```
</details>

---

## 💡 Interview Questions

<details>
<summary>Explain the difference between Flexbox and Grid</summary>
**Flexbox**: One-dimensional layout system
- Arranges items in a single direction (row OR column)
- Content-driven (size determined by content)
- Best for components and small-scale layouts
- Items flow and wrap naturally

**Grid**: Two-dimensional layout system
- Arranges items in rows AND columns simultaneously
- Layout-driven (define structure, content fits in)
- Best for page layouts and large-scale structures
- Precise placement and overlapping

**Example comparison:**
```css
/* Flexbox - items in a row */
.flex {
  display: flex;
  gap: 1rem;
}
/* Items determine their size and wrap if needed */

/* Grid - defined grid structure */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
/* Structure defined first, items fill cells */
```

**Key differences:**

| Aspect | Flexbox | Grid |
|--------|---------|------|
| Dimensions | 1D (row or column) | 2D (rows and columns) |
| Sizing | Content-out | Layout-in |
| Use case | Components | Page layouts |
| Overlap | Difficult | Easy |
| Responsive | Manual wrapping | Auto-placement |

**When to use:**
- Flexbox: Navigation bars, form rows, centering, lists
- Grid: Page layouts, dashboards, galleries, complex structures

**They complement each other:**
```css
/* Grid for page structure */
.page { display: grid; grid-template-columns: 250px 1fr; }

/* Flexbox for navigation */
.nav { display: flex; justify-content: space-between; }

/* Grid for content cards */
.content { display: grid; grid-template-columns: repeat(3, 1fr); }

/* Flexbox inside cards */
.card { display: flex; flex-direction: column; }
```
</details>

<details>
<summary>How does flex-grow, flex-shrink, and flex-basis work?</summary>
**flex-basis**: Initial size before growing or shrinking
**flex-grow**: How much item grows relative to others
**flex-shrink**: How much item shrinks relative to others

**Shorthand:** `flex: grow shrink basis`
```css
flex: 1 1 0; /* Common: equal distribution */
flex: 1; /* Same as: 1 1 0 */
flex: 0 0 200px; /* Fixed size, no grow/shrink */
```

**flex-basis examples:**
```css
.item { flex-basis: 200px; } /* Start at 200px */
.item { flex-basis: 0; } /* Start at 0, grow fills space */
.item { flex-basis: auto; } /* Start at content size */
.item { flex-basis: 50%; } /* Start at 50% of container */
```

**flex-grow calculation:**
```css
.container { display: flex; width: 800px; }

.item-1 { flex: 1 0 200px; } /* basis: 200px, grow: 1 */
.item-2 { flex: 2 0 200px; } /* basis: 200px, grow: 2 */

/* Used space: 200 + 200 = 400px */
/* Available space: 800 - 400 = 400px */
/* Total grow factors: 1 + 2 = 3 */
/* Item 1 grows: 400 * (1/3) = 133px → Final: 333px */
/* Item 2 grows: 400 * (2/3) = 267px → Final: 467px */
```

**flex-shrink calculation:**
```css
.container { display: flex; width: 400px; }

.item-1 { flex: 0 1 300px; } /* basis: 300px, shrink: 1 */
.item-2 { flex: 0 2 300px; } /* basis: 300px, shrink: 2 */

/* Desired space: 300 + 300 = 600px */
/* Container: 400px */
/* Overflow: 600 - 400 = 200px needs to shrink */
/* Total shrink factors: 1 + 2 = 3 */
/* Item 1 shrinks: 200 * (1/3) = 67px → Final: 233px */
/* Item 2 shrinks: 200 * (2/3) = 133px → Final: 167px */
```

**Common patterns:**

**1. Equal distribution:**
```css
.item { flex: 1; }
/* Same as: flex: 1 1 0 */
/* All items get equal space */
```

**2. Fixed sidebar, flexible content:**
```css
.sidebar { flex: 0 0 250px; } /* Don't grow, don't shrink, 250px */
.content { flex: 1; } /* Take remaining space */
```

**3. Minimum size with growth:**
```css
.item { flex: 1 0 200px; }
/* Grow equally, don't shrink, minimum 200px */
```

**4. Content-based size:**
```css
.item { flex: 0 0 auto; }
/* No grow, no shrink, size based on content */
```

**Edge cases:**

```css
/* min-width/max-width override flex basis */
.item {
  flex: 1 1 0;
  min-width: 200px; /* Won't shrink below 200px */
  max-width: 500px; /* Won't grow beyond 500px */
}

/* content width can prevent shrinking */
.item {
  flex: 0 1 100px;
  /* Won't shrink below content width */
}

/* Set min-width: 0 to allow shrinking below content */
.item {
  flex: 1;
  min-width: 0; /* Allows shrinking */
  overflow: hidden; /* Needed for text truncation */
}
```
</details>

<details>
<summary>Explain CSS Grid's auto-fit vs auto-fill</summary>
Both create responsive columns without media queries, but handle empty space differently.

**auto-fill**: Creates as many columns as fit, keeps empty tracks
**auto-fit**: Creates as many columns as fit, collapses empty tracks

**auto-fill example:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* Container: 1000px, 3 items */
/* Creates: 200px | 200px | 200px | 200px | 200px (5 columns) */
/* Items occupy first 3, last 2 are empty but exist */
```

**auto-fit example:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Container: 1000px, 3 items */
/* Creates: ~333px | ~333px | ~333px (3 columns) */
/* No empty tracks, items expand to fill space */
```

**Visual comparison:**

```
Container: 1000px, 3 items

auto-fill:
┌─────┬─────┬─────┬─────┬─────┐
│ 1   │ 2   │ 3   │     │     │
└─────┴─────┴─────┴─────┴─────┘
200px each, empty tracks exist

auto-fit:
┌──────────┬──────────┬──────────┐
│    1     │    2     │    3     │
└──────────┴──────────┴──────────┘
~333px each, no empty tracks
```

**When to use:**

**auto-fill** when:
- Want consistent column width regardless of item count
- Don't want items expanding to fill empty space
- Creating uniform grid galleries

```css
/* Photo gallery - keep photos same size */
.gallery {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

**auto-fit** when:
- Want items to expand and fill available space
- Creating responsive card layouts
- Dynamic number of items

```css
/* Card layout - cards expand to fill space */
.cards {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

**Complete responsive pattern:**
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: 2rem;
}
/* min(250px, 100%) prevents overflow on narrow screens */
```

**With max columns:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(max(250px, 100%/4), 1fr));
  /* Maximum 4 columns */
}
```
</details>

<details>
<summary>How to center an element vertically and horizontally?</summary>
**Multiple methods depending on layout system:**

**1. Flexbox (most common):**
```css
.container {
  display: flex;
  justify-content: center; /* Horizontal */
  align-items: center; /* Vertical */
  min-height: 100vh; /* Full viewport height */
}
```

**2. Grid (modern):**
```css
.container {
  display: grid;
  place-items: center; /* Both axes */
  min-height: 100vh;
}
```

**3. Absolute positioning + transform:**
```css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**4. Margin auto (horizontal only):**
```css
.element {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  /* Or: margin: 0 auto; */
}
```

**5. Flexbox with margin auto:**
```css
.container {
  display: flex;
  min-height: 100vh;
}
.element {
  margin: auto;
}
```

**6. Grid with margins:**
```css
.container {
  display: grid;
  min-height: 100vh;
}
.element {
  margin: auto;
}
```

**7. Table cell (legacy):**
```css
.container {
  display: table;
  width: 100%;
  height: 100vh;
}
.element {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

**Comparison:**

| Method | Horizontal | Vertical | Best for |
|--------|-----------|----------|----------|
| Flexbox | ✅ | ✅ | Most cases |
| Grid | ✅ | ✅ | Simple centering |
| Absolute + transform | ✅ | ✅ | Overlays |
| Margin auto | ✅ | ❌ | Horizontal only |
| Table cell | ✅ | ✅ | Legacy support |

**Modern recommendation**: Use Flexbox or Grid

**Responsive centering:**
```css
.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem; /* Prevents edge touching */
}

.modal {
  max-width: 500px;
  width: 100%;
}
```

**Text centering:**
```css
/* Horizontal */
.text { text-align: center; }

/* Vertical single line */
.text { line-height: 100px; height: 100px; }

/* Vertical flex */
.container {
  display: flex;
  align-items: center;
  min-height: 100px;
}
```
</details>

<details>
<summary>What are common pitfalls with Flexbox and Grid?</summary>
**Flexbox pitfalls:**

**1. Min-width: auto prevents shrinking:**
```css
/* Problem: Item won't shrink below content width */
.item {
  flex: 1;
  /* Has implicit min-width: auto */
}

/* Solution: Override min-width */
.item {
  flex: 1;
  min-width: 0; /* Allows shrinking */
  overflow: hidden; /* For text truncation */
}
```

**2. Flex shorthand gotcha:**
```css
/* Not the same! */
flex: 1; /* = flex: 1 1 0 */
flex: auto; /* = flex: 1 1 auto */

/* flex: 1 often better for equal distribution */
```

**3. Percentage padding/margin with flex:**
```css
/* Problem: Percentages calculated on parent width, not flex basis */
.item {
  flex: 1;
  padding: 10%; /* 10% of parent, not 10% of flex width */
}
```

**4. Flex items ignoring max-width:**
```css
/* Problem: flex-basis overrides max-width */
.item {
  flex: 1 1 500px;
  max-width: 300px; /* Ignored! */
}

/* Solution: Use flex-basis instead */
.item {
  flex: 1 1 300px;
}
```

**5. Nested flex container height:**
```css
/* Problem: Inner flex doesn't stretch */
.outer { display: flex; height: 400px; }
.inner { display: flex; flex-direction: column; }
/* .inner has no explicit height */

/* Solution: */
.inner {
  display: flex;
  flex-direction: column;
  flex: 1; /* Stretches to fill outer */
}
```

**Grid pitfalls:**

**1. Implicit vs explicit grid:**
```css
/* Problem: Only 3 rows defined, 4th item creates implicit row */
.grid {
  display: grid;
  grid-template-rows: 100px 100px 100px;
}
/* 4th item uses auto height */

/* Solution: Define implicit grid */
.grid {
  grid-template-rows: 100px 100px 100px;
  grid-auto-rows: 100px; /* For additional rows */
}
```

**2. fr units don't account for min-content:**
```css
/* Problem: fr doesn't shrink below min-content */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
/* Long word in column prevents shrinking */

/* Solution: Use minmax */
.grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
```

**3. Grid item overflow:**
```css
/* Problem: Content overflows grid item */
.grid-item {
  /* Default: min-width: auto */
}

/* Solution: */
.grid-item {
  min-width: 0; /* Allows shrinking */
  overflow: hidden; /* or auto */
}
```

**4. Gap not working:**
```css
/* Problem: Old browser or wrong property */
grid-gap: 1rem; /* Deprecated */

/* Solution: */
gap: 1rem; /* Standard */
```

**5. Fractional units with auto:**
```css
/* Problem: Unexpected sizing */
grid-template-columns: auto 1fr 2fr;
/* auto takes as much as needed, fr shares remaining */

/* Be explicit about intent: */
grid-template-columns: min-content 1fr 2fr;
```

**6. Subgrid support:**
```css
/* Problem: subgrid not widely supported yet */
.nested {
  grid-template-columns: subgrid;
}

/* Fallback: */
@supports (grid-template-columns: subgrid) {
  .nested { grid-template-columns: subgrid; }
}
@supports not (grid-template-columns: subgrid) {
  .nested { grid-template-columns: repeat(3, 1fr); }
}
```

**Common to both:**

**1. Browser prefixes (older browsers):**
```css
.flex {
  display: -webkit-flex; /* Safari */
  display: flex;
}
```

**2. Z-index not working:**
```css
/* Both flex and grid items can use z-index */
/* But need relative positioning in some browsers */
.item {
  position: relative; /* For z-index */
  z-index: 1;
}
```

**3. Aspect ratio issues:**
```css
/* Modern: */
.item { aspect-ratio: 16 / 9; }

/* Fallback: */
.item {
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  height: 0;
}
```
</details>

---

## 🎯 Key Takeaways

1. **Flexbox** = One-dimensional (row OR column), **Grid** = Two-dimensional (rows AND columns)
2. **Use Flexbox for**: Navigation, alignment, form rows, card wrapping
3. **Use Grid for**: Page layouts, galleries, dashboards, complex structures
4. **Flexbox shorthand**: `flex: grow shrink basis` (e.g., `flex: 1` = `1 1 0`)
5. **Grid responsive**: `repeat(auto-fit, minmax(250px, 1fr))` for auto-responsive layouts
6. **auto-fit** collapses empty tracks, **auto-fill** keeps them
7. **fr unit**: Fraction of available space after fixed sizes calculated
8. **Centering**: Flexbox or Grid with `place-items: center` (modern)
9. **Common pitfall**: `min-width: auto` prevents shrinking (set `min-width: 0`)
10. **Modern best practice**: Grid for structure, Flexbox for components within
