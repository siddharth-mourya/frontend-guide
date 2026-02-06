# Virtualization

## ⚡ Quick Revision
- **Virtual scrolling**: Only renders visible items in large lists to maintain performance
- **React Window**: Lightweight virtualization library for fixed/variable sized lists
- **React Virtualized**: Feature-rich but heavier alternative with grids, tables, masonry
- **Windowing**: Technical term for rendering only visible portion of large datasets
- **Common pitfall**: Not accounting for dynamic heights or incorrect size calculations
- **When to use**: Lists with 1000+ items, or when scrolling performance is poor

```jsx
import { FixedSizeList, VariableSizeList } from 'react-window';

// Fixed height items
function FixedVirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <div>Item {index}: {items[index].name}</div>
    </div>
  );

  return (
    <FixedSizeList
      height={400}        // Container height
      itemCount={items.length}
      itemSize={50}       // Each item height
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// Variable height items
function VariableVirtualList({ items }) {
  const getItemSize = (index) => {
    // Calculate height based on content
    return items[index].content.length > 100 ? 80 : 50;
  };

  const Row = ({ index, style }) => (
    <div style={style}>
      <div>{items[index].content}</div>
    </div>
  );

  return (
    <VariableSizeList
      height={400}
      itemCount={items.length}
      itemSize={getItemSize}
      estimatedItemSize={60}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}

// Infinite loading with virtualization
function InfiniteVirtualList({ loadMore, hasMore, items }) {
  const loadedItemsRef = useRef(items);
  
  useEffect(() => {
    loadedItemsRef.current = items;
  }, [items]);

  const isItemLoaded = (index) => index < items.length;

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return <div style={style}>Loading...</div>;
    }
    
    return (
      <div style={style}>
        <div>Item {index}: {items[index]?.name}</div>
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasMore ? items.length + 1 : items.length}
      loadMoreItems={loadMore}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          ref={ref}
          height={400}
          itemCount={hasMore ? items.length + 1 : items.length}
          itemSize={50}
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
Virtualization exists to solve **DOM performance** issues with large datasets:

**The Problem:**
```jsx
// ❌ Rendering 10,000 items creates performance issues
function RegularList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{ height: 50 }}>
          Item {index}: {item.name}
        </div>
      ))}
    </div>
  );
}

// Problems:
// - 10,000 DOM nodes created immediately
// - Memory usage scales linearly with item count
// - Initial render time increases dramatically
// - Scrolling becomes janky due to layout thrashing
```

**Performance Impact:**
- **DOM nodes**: Each item creates multiple DOM elements
- **Memory**: Grows linearly with dataset size
- **Rendering time**: O(n) complexity for initial render
- **Layout calculations**: Browser must position all items

**Real-world Scenarios:**
- Social media feeds (thousands of posts)
- Data tables with large datasets
- File explorers with many files
- Chat applications with message history
- E-commerce product lists
</details>

<details>
<summary>How it works</summary>
Virtualization implements **windowing algorithm** to render only visible items:

**1. Core Algorithm:**
```jsx
// Simplified virtualization logic
function useVirtualization({ itemCount, itemSize, containerHeight, scrollTop }) {
  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemSize)
  );
  
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      style: {
        position: 'absolute',
        top: i * itemSize,
        height: itemSize,
        width: '100%',
      },
    });
  }
  
  return {
    visibleItems,
    totalHeight: itemCount * itemSize,
  };
}
```

**2. React Window Implementation:**
```jsx
// Simplified React Window component
function VirtualList({ 
  height, 
  itemCount, 
  itemSize, 
  children: ItemComponent 
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const { visibleItems, totalHeight } = useVirtualization({
    itemCount,
    itemSize,
    containerHeight: height,
    scrollTop,
  });

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, style }) => (
          <ItemComponent key={index} index={index} style={style} />
        ))}
      </div>
    </div>
  );
}
```

**3. Variable Size Virtualization:**
```jsx
function useVariableVirtualization({ itemCount, getItemSize, containerHeight, scrollTop }) {
  // Build cumulative size cache for fast lookups
  const sizeCache = useMemo(() => {
    const cache = [0];
    for (let i = 0; i < itemCount; i++) {
      cache[i + 1] = cache[i] + getItemSize(i);
    }
    return cache;
  }, [itemCount, getItemSize]);

  // Binary search for start index
  const startIndex = useMemo(() => {
    let low = 0, high = itemCount - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (sizeCache[mid] <= scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return Math.max(0, high);
  }, [scrollTop, sizeCache, itemCount]);

  // Calculate end index
  const endIndex = useMemo(() => {
    let index = startIndex;
    let currentHeight = sizeCache[startIndex];
    while (index < itemCount && currentHeight < scrollTop + containerHeight) {
      currentHeight += getItemSize(index);
      index++;
    }
    return Math.min(index, itemCount - 1);
  }, [startIndex, scrollTop, containerHeight, itemCount, sizeCache]);

  return { startIndex, endIndex, totalHeight: sizeCache[itemCount] };
}
```

**4. Advanced Features:**

**Overscan (Buffer):**
```jsx
// Render extra items outside viewport for smoother scrolling
const overscanCount = 5;
const startIndex = Math.max(0, calculatedStartIndex - overscanCount);
const endIndex = Math.min(itemCount - 1, calculatedEndIndex + overscanCount);
```

**Dynamic Height Measurement:**
```jsx
function useDynamicHeight() {
  const [heights, setHeights] = useState({});
  const measureRef = useCallback((index, element) => {
    if (element) {
      const height = element.getBoundingClientRect().height;
      setHeights(prev => ({ ...prev, [index]: height }));
    }
  }, []);

  const getItemSize = useCallback((index) => {
    return heights[index] || 50; // Estimated height fallback
  }, [heights]);

  return { getItemSize, measureRef };
}
```
</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Virtualization works for any list"**
```jsx
// ❌ Small lists don't benefit from virtualization
function SmallList({ items }) { // 20 items
  return (
    <FixedSizeList itemCount={items.length}> {/* Unnecessary overhead */}
      {Row}
    </FixedSizeList>
  );
}

// ✅ Use regular rendering for small lists
function SmallList({ items }) { // < 1000 items
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{item.name}</div>
      ))}
    </div>
  );
}
```

**❌ "Item keys don't matter with virtualization"**
```jsx
// ❌ Using index as key causes issues when items change
const Row = ({ index, style }) => (
  <div key={index} style={style}> {/* Wrong key! */}
    {items[index].name}
  </div>
);

// ✅ Use stable, unique keys
const Row = ({ index, style }) => (
  <div key={items[index].id} style={style}>
    {items[index].name}
  </div>
);
```

**❌ "All items must have same height"**
```jsx
// ❌ Using FixedSizeList for variable content
<FixedSizeList itemSize={50}> {/* Content might overflow! */}
  {({ index, style }) => (
    <div style={style}>
      {items[index].longDescription} {/* Variable length */}
    </div>
  )}
</FixedSizeList>

// ✅ Use VariableSizeList for dynamic content
<VariableSizeList
  itemSize={index => calculateHeight(items[index])}
  estimatedItemSize={60}
>
  {Row}
</VariableSizeList>
```

**❌ "Virtualization automatically handles infinite loading"**
```jsx
// ❌ Basic virtualization doesn't load more data
<FixedSizeList itemCount={items.length}>
  {Row}
</FixedSizeList>

// ✅ Combine with infinite loading patterns
<InfiniteLoader
  isItemLoaded={index => index < items.length}
  loadMoreItems={loadMoreItems}
  itemCount={hasMore ? items.length + 1 : items.length}
>
  {({ onItemsRendered, ref }) => (
    <FixedSizeList
      ref={ref}
      onItemsRendered={onItemsRendered}
    >
      {Row}
    </FixedSizeList>
  )}
</InfiniteLoader>
```
</details>

<details>
<summary>Interview angle</summary>
**Key Interview Questions:**

1. **"When would you use virtualization?"**
   - Lists with 1000+ items
   - Performance issues with scrolling
   - Limited device memory (mobile)
   - Real-time data feeds

2. **"What's the difference between React Window and React Virtualized?"**
   - React Window: Lightweight, focused on lists
   - React Virtualized: Feature-rich, includes grids, tables, masonry

3. **"How do you handle dynamic item heights?"**
   - Use VariableSizeList with estimated sizes
   - Measure actual heights after render
   - Implement size caching for performance

**Real-world Implementation:**

**1. Chat Message Virtualization:**
```jsx
function ChatMessages({ messages }) {
  const [heights, setHeights] = useState({});
  const listRef = useRef();

  const getItemSize = useCallback((index) => {
    return heights[index] || 60; // Estimated height
  }, [heights]);

  const setItemHeight = useCallback((index, height) => {
    setHeights(prev => {
      if (prev[index] !== height) {
        // Reset cache when height changes
        listRef.current?.resetAfterIndex(index);
        return { ...prev, [index]: height };
      }
      return prev;
    });
  }, []);

  const Message = useCallback(({ index, style }) => {
    const message = messages[index];
    const measureRef = useCallback((element) => {
      if (element) {
        const height = element.getBoundingClientRect().height;
        setItemHeight(index, height);
      }
    }, [index]);

    return (
      <div style={style}>
        <div ref={measureRef} className="message">
          <div className="message-header">
            <span>{message.author}</span>
            <span>{message.timestamp}</span>
          </div>
          <div className="message-content">{message.content}</div>
        </div>
      </div>
    );
  }, [messages, setItemHeight]);

  return (
    <VariableSizeList
      ref={listRef}
      height={400}
      itemCount={messages.length}
      itemSize={getItemSize}
      estimatedItemSize={60}
    >
      {Message}
    </VariableSizeList>
  );
}
```

**2. Data Table Virtualization:**
```jsx
function VirtualDataTable({ columns, data }) {
  const Row = useCallback(({ index, style }) => {
    const row = data[index];
    
    return (
      <div style={style} className="table-row">
        {columns.map(column => (
          <div key={column.key} className="table-cell">
            {column.render ? column.render(row[column.key], row) : row[column.key]}
          </div>
        ))}
      </div>
    );
  }, [columns, data]);

  return (
    <div className="virtual-table">
      <div className="table-header">
        {columns.map(column => (
          <div key={column.key} className="table-cell">
            {column.title}
          </div>
        ))}
      </div>
      <FixedSizeList
        height={400}
        itemCount={data.length}
        itemSize={40}
        itemData={{ columns, data }}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

**3. Grid Virtualization:**
```jsx
import { FixedSizeGrid as Grid } from 'react-window';

function VirtualGrid({ items, columns }) {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * columns + columnIndex;
    const item = items[itemIndex];
    
    if (!item) return null;
    
    return (
      <div style={style} className="grid-item">
        <img src={item.thumbnail} alt={item.name} />
        <div>{item.name}</div>
      </div>
    );
  };

  const rowCount = Math.ceil(items.length / columns);
  
  return (
    <Grid
      columnCount={columns}
      columnWidth={200}
      height={400}
      rowCount={rowCount}
      rowHeight={200}
      width={800}
    >
      {Cell}
    </Grid>
  );
}
```

**Performance Considerations:**
- **Overscan**: Add buffer items for smoother scrolling
- **Key stability**: Use stable keys to prevent re-mounting
- **Size estimation**: Provide accurate estimated sizes
- **Memory management**: Clear caches when data changes
- **Scroll restoration**: Maintain scroll position during updates

**Alternative Solutions:**
- **CSS-only virtualization**: `content-visibility: auto`
- **Intersection Observer**: For simpler infinite scrolling
- **Pagination**: When virtualization complexity isn't worth it
- **Server-side pagination**: For truly massive datasets
</details>