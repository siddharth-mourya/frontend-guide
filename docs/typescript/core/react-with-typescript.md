# React with TypeScript

## ⚡ Quick Revision
- **`React.FC<Props>`**: Function component type with children automatically included
- **`ReactNode`**: Type for anything renderable (JSX, string, number, null, etc.)
- **`ReactElement`**: Specific JSX element type
- **Props interfaces**: Define component prop types explicitly
- **Event types**: `MouseEvent<HTMLButtonElement>`, `ChangeEvent<HTMLInputElement>`
- **Ref types**: `RefObject<HTMLDivElement>`, `MutableRefObject<T>`
- **State types**: Inferred from `useState` initial value or explicit generics
- **Children types**: `PropsWithChildren<T>` or explicit `children: ReactNode`
- **Component generics**: `<T>` for reusable components
- **Hook typing**: Custom hooks with proper return types

```typescript
import React, { useState, useRef, ReactNode, MouseEvent, ChangeEvent } from 'react';

// Props interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
}

// Function component with explicit typing
const Button: React.FC<ButtonProps> = ({ variant, onClick, children, disabled }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Component with state and refs
interface User {
  name: string;
  email: string;
}

const UserForm: React.FC = () => {
  const [user, setUser] = useState<User>({ name: '', email: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('User:', user);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        name="name"
        value={user.name}
        onChange={handleChange}
        placeholder="Name"
      />
    </form>
  );
};

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
React with TypeScript provides compile-time safety for:

**Component contracts**: Ensuring props are passed correctly
```typescript
// Without TypeScript: runtime errors
<Button variant="danger" onClick={handleClick} /> // 'danger' not valid

// With TypeScript: compile-time errors
interface ButtonProps {
  variant: 'primary' | 'secondary'; // Only these values allowed
}
// Error: 'danger' not assignable to 'primary' | 'secondary'
```

**Event handling**: Correct event types for different elements
```typescript
// Prevents accessing wrong properties
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget; // HTMLButtonElement (correct)
  // event.target; // Element | null (generic)
};
```

**State management**: Type-safe state updates
```typescript
const [user, setUser] = useState<User>({ name: '', email: '' });
// setUser({ name: 'John' }); // Error: missing email
// setUser({ name: 'John', email: 'john@ex.com', age: 30 }); // Error: age not in User
```

**Ref management**: Correct DOM element types
```typescript
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current?.focus(); // Safe: focus exists on HTMLInputElement
// inputRef.current?.select(); // Safe: select exists on HTMLInputElement
```

</details>

<details>
<summary>How it works</summary>
**Component type inference**:
```typescript
// React.FC provides implicit children and displayName
const Component: React.FC<{ title: string }> = ({ title, children }) => {
  // children is ReactNode automatically
  // displayName is available
  return <div>{title}: {children}</div>;
};

// Alternative: explicit function declaration
interface Props {
  title: string;
  children?: ReactNode; // Must be explicit
}

function Component({ title, children }: Props) {
  return <div>{title}: {children}</div>;
}
```

**Event type mapping**:
```typescript
// TypeScript maps DOM events to React synthetic events
type ButtonEvent = MouseEvent<HTMLButtonElement>; // React.MouseEvent
type InputEvent = ChangeEvent<HTMLInputElement>; // React.ChangeEvent
type FormEvent = FormEvent<HTMLFormElement>; // React.FormEvent

// Event properties are properly typed
const handler = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget; // HTMLButtonElement
  event.target; // Element | null (bubbled target)
  event.clientX; // number (mouse position)
};
```

**Hook type inference and generics**:
```typescript
// useState infers from initial value
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// Explicit generic when needed
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// useRef variations
const inputRef = useRef<HTMLInputElement>(null); // RefObject (read-only .current)
const mutableRef = useRef<number>(0); // MutableRefObject (writable .current)
```

**Generic component mechanics**:
```typescript
// Generic props interface
interface TableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => ReactNode;
  }>;
}

// Generic component function  
function Table<T>({ data, columns }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={String(col.key)}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render ? col.render(item[col.key], item) : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage with type inference
const users = [{ name: 'John', age: 30 }];
<Table 
  data={users} // T inferred as { name: string; age: number }
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' }
  ]} 
/>
```

</details>

<details>
<summary>Common misconceptions</summary>
**❌ "Always use React.FC"**
```typescript
// React.FC has downsides
const Component: React.FC<Props> = (props) => {
  // Can't use generics easily
  // Children are always included (might not want that)
  // Return type is too restrictive
};

// Often better: plain function
function Component<T>(props: Props<T>) {
  // Full control over generics
  // Explicit about children
  // Better for component libraries
}
```

**❌ "event.target and event.currentTarget are the same"**
```typescript
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget; // HTMLButtonElement (the element with the handler)
  event.target; // Element | null (the actual clicked element, could be child)
  
  // Important for event delegation
  if (event.target === event.currentTarget) {
    // Direct click, not bubbled
  }
};
```

**❌ "All refs should be RefObject"**
```typescript
// RefObject for DOM elements (read-only)
const inputRef = useRef<HTMLInputElement>(null);

// MutableRefObject for values (writable)
const countRef = useRef(0);
countRef.current += 1; // OK

// inputRef.current = someInput; // Error: read-only
```

**❌ "State always needs explicit types"**
```typescript
// TypeScript infers these correctly
const [count, setCount] = useState(0); // number
const [name, setName] = useState('John'); // string
const [isLoading, setIsLoading] = useState(false); // boolean

// Only need explicit types for complex scenarios
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

**❌ "You can't type children props"**
```typescript
// Multiple ways to type children
interface Props1 {
  children: ReactNode; // Most flexible
}

interface Props2 {
  children: ReactElement; // Only single JSX element
}

interface Props3 {
  children: ReactElement<typeof SomeComponent>; // Specific component
}

interface Props4 {
  children: (data: string) => ReactNode; // Render prop
}
```

</details>

<details>
<summary>Interview angle</summary>
**Common questions**:

1. **"Create a type-safe form component"**
```typescript
interface FormField<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'number' | 'password';
  validation?: (value: any) => string | null;
}

interface FormProps<T> {
  fields: FormField<T>[];
  initialValues: T;
  onSubmit: (values: T) => void;
}

function Form<T extends Record<string, any>>({ 
  fields, 
  initialValues, 
  onSubmit 
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T) => 
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.type === 'number' 
        ? Number(event.target.value) 
        : event.target.value;
      
      setValues(prev => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    // Validate
    const newErrors: Partial<Record<keyof T, string>> = {};
    fields.forEach(field => {
      if (field.validation) {
        const error = field.validation(values[field.name]);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => (
        <div key={String(field.name)}>
          <label>{field.label}</label>
          <input
            type={field.type}
            value={values[field.name] || ''}
            onChange={handleChange(field.name)}
          />
          {errors[field.name] && (
            <span className="error">{errors[field.name]}</span>
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

// Usage
interface User {
  name: string;
  email: string;
  age: number;
}

const userFields: FormField<User>[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'age', label: 'Age', type: 'number' }
];

<Form<User>
  fields={userFields}
  initialValues={{ name: '', email: '', age: 0 }}
  onSubmit={(user) => console.log(user)} // user is typed as User
/>
```

2. **"Implement a generic data table component"**
```typescript
interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    if (!columns.find(col => col.key === column)?.sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return -1 * modifier;
      if (aVal > bVal) return 1 * modifier;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th 
              key={String(column.key)}
              style={{ width: column.width }}
              onClick={() => handleSort(column.key)}
              className={column.sortable ? 'sortable' : ''}
            >
              {column.header}
              {sortColumn === column.key && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr 
            key={keyExtractor(item, index)}
            onClick={() => onRowClick?.(item, index)}
            className={onRowClick ? 'clickable' : ''}
          >
            {columns.map(column => (
              <td key={String(column.key)}>
                {column.render 
                  ? column.render(item[column.key], item, index)
                  : String(item[column.key])
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

3. **"Create a custom hook with proper TypeScript"**
```typescript
interface UseFetchOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(
  url: string, 
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Usage with automatic type inference
const { data, loading, error } = useFetch<User[]>('/api/users');
// data is User[] | null, properly typed
```

**Red flags to avoid**:
- Using `any` for event handlers instead of proper event types
- Not understanding the difference between ReactNode and ReactElement
- Using React.FC everywhere without considering alternatives
- Overusing explicit generics when TypeScript can infer
- Not properly typing custom hooks
- Forgetting to handle null refs in useRef
- Using wrong event types (like Event instead of MouseEvent)
</details>