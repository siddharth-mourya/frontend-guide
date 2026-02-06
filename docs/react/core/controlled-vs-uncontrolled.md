# Controlled vs Uncontrolled Components

## ⚡ Quick Revision

- Controlled: React state is the "single source of truth"
- Uncontrolled: DOM is the source of truth, accessed via refs
- Controlled: `value` prop + `onChange` handler
- Uncontrolled: `defaultValue` prop + ref to read value
- **Pitfall**: Controlled inputs must never have `value={undefined}`, use `""` instead
- **Pitfall**: Can't switch from uncontrolled to controlled after mounting
- Form validation easier with controlled, file inputs must be uncontrolled

```jsx
// Controlled input
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Uncontrolled input
function UncontrolledInput() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return (
    <>
      <input ref={inputRef} defaultValue="initial" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Controlled components:**
- Give React full control over form elements
- Enable instant validation and formatting
- Make testing easier (no DOM required)
- Support features like disabling submit until valid
- Provide single source of truth
- Better for dynamic forms

**Uncontrolled components:**
- Simpler for basic forms (less boilerplate)
- Better performance (no state update on every keystroke)
- Easier integration with non-React code
- Required for file inputs
- Useful for third-party libraries that expect DOM refs

**Trade-offs:**
- Controlled = More code, more control, React-friendly
- Uncontrolled = Less code, less control, DOM-dependent

</details>

<details>
<summary>How it works</summary>
**Controlled components:**
```jsx
function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: 0,
    acceptTerms: false,
    country: 'US'
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Instant validation
    validateField(name, value);
  };
  
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'email':
        if (!value.includes('@')) error = 'Invalid email';
        break;
      case 'age':
        if (value < 18) error = 'Must be 18+';
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // formData is already available, no DOM access needed
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
      />
      {errors.age && <span>{errors.age}</span>}
      
      <input
        name="acceptTerms"
        type="checkbox"
        checked={formData.acceptTerms}
        onChange={handleChange}
      />
      
      <select
        name="country"
        value={formData.country}
        onChange={handleChange}
      >
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
      
      <button
        type="submit"
        disabled={Object.values(errors).some(e => e)}
      >
        Submit
      </button>
    </form>
  );
}

// Formatted input (controlled only)
function PhoneInput() {
  const [phone, setPhone] = useState('');
  
  const handleChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format: (123) 456-7890
    if (value.length > 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    if (value.length > 9) {
      value = `${value.slice(0, 9)}-${value.slice(9, 13)}`;
    }
    
    setPhone(value);
  };
  
  return <input value={phone} onChange={handleChange} />;
}
```

**Uncontrolled components:**
```jsx
function UncontrolledForm() {
  const usernameRef = useRef();
  const emailRef = useRef();
  const ageRef = useRef();
  const termsRef = useRef();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Read values from DOM on submit
    const formData = {
      username: usernameRef.current.value,
      email: emailRef.current.value,
      age: parseInt(ageRef.current.value),
      acceptTerms: termsRef.current.checked
    };
    
    // Validation happens at submit time
    if (!formData.email.includes('@')) {
      alert('Invalid email');
      return;
    }
    
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={usernameRef}
        name="username"
        defaultValue=""
      />
      
      <input
        ref={emailRef}
        name="email"
        type="email"
        defaultValue=""
      />
      
      <input
        ref={ageRef}
        name="age"
        type="number"
        defaultValue="0"
      />
      
      <input
        ref={termsRef}
        name="acceptTerms"
        type="checkbox"
        defaultChecked={false}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}

// File input (must be uncontrolled)
function FileUpload() {
  const fileRef = useRef();
  
  const handleUpload = () => {
    const file = fileRef.current.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      // Upload...
    }
  };
  
  return (
    <>
      {/* File inputs can't be controlled */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
      />
      <button onClick={handleUpload}>Upload</button>
    </>
  );
}
```

**Hybrid approach:**
```jsx
function HybridForm() {
  // Controlled for fields that need instant feedback
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Uncontrolled for simple fields
  const nameRef = useRef();
  const messageRef = useRef();
  
  const validateEmail = (value) => {
    const error = !value.includes('@') ? 'Invalid email' : '';
    setEmailError(error);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      name: nameRef.current.value,
      email: email,
      message: messageRef.current.value
    };
    
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={nameRef}
        name="name"
        defaultValue=""
      />
      
      <input
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
      />
      {emailError && <span>{emailError}</span>}
      
      <textarea
        ref={messageRef}
        name="message"
        defaultValue=""
      />
      
      <button
        type="submit"
        disabled={!!emailError}
      >
        Submit
      </button>
    </form>
  );
}
```

**Controlled to uncontrolled error:**
```jsx
function ProblematicInput() {
  const [value, setValue] = useState(); // undefined initially
  
  // ❌ Error: Input switching from uncontrolled to controlled
  return (
    <input
      value={value} // undefined → string causes error
      onChange={(e) => setValue(e.target.value)}
    />
  );
  
  // ✅ Fix: Initialize with empty string
  // const [value, setValue] = useState('');
  
  // ✅ Or use controlled with nullish coalescing
  // value={value ?? ''}
}

function ConditionalValue({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  
  // ❌ Error if initialValue is undefined
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
  
  // ✅ Fix options:
  // 1. Default prop: initialValue = ''
  // 2. Fallback: value={value ?? ''}
  // 3. Initialize: useState(initialValue ?? '')
}
```

</details>

<details>
<summary>Common misconceptions</summary>
- **"Uncontrolled is bad"** - It's simpler for basic forms and required for files
- **"Controlled is always better"** - More boilerplate, potential performance cost
- **"You can't validate uncontrolled inputs"** - You can, just at submit time
- **"Refs are only for uncontrolled"** - Refs have many uses beyond forms
- **"Controlled means no refs"** - You can use both together
- **"File inputs can be controlled"** - File inputs must always be uncontrolled

</details>

<details>
<summary>Interview angle</summary>
Interviewers evaluate understanding of:
- **When to use which**: Can you choose the right pattern?
- **Trade-offs**: Understanding performance vs control
- **Form handling**: Proper validation and submission
- **Common errors**: Controlled/uncontrolled switching

Critical concepts to explain:
- **Source of truth**: React state vs DOM
- **value vs defaultValue**: Controlled vs uncontrolled syntax
- **Performance**: Controlled = re-render on every keystroke
- **Use cases**: When each pattern makes sense
- **File inputs**: Why they must be uncontrolled

Common questions:
- "What's the difference between controlled and uncontrolled components?"
- "When would you use uncontrolled over controlled?"
- "How do you handle file uploads in React?"
- "Why can't you switch from uncontrolled to controlled?"
- "How do you validate forms with each approach?"
- "What happens if value is undefined?"

Key talking points:
- Controlled = React owns state, instant validation possible
- Uncontrolled = DOM owns state, simpler code
- File inputs require uncontrolled approach
- Choose based on needs: simple form vs complex validation
- Can mix both in same form (hybrid approach)

</details>

---

## 📝 Code Examples

<details>
<summary>Real-world form examples</summary>
```jsx
// Controlled: Complex form with validation
function SignupForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validate = (name, value) => {
    switch(name) {
      case 'username':
        return value.length < 3 ? 'Username must be 3+ characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : '';
      case 'password':
        return value.length < 8 ? 'Password must be 8+ characters' : '';
      case 'confirmPassword':
        return value !== formData.password ? 'Passwords must match' : '';
      default:
        return '';
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validate(key, formData[key]);
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (Object.values(newErrors).every(e => !e)) {
      console.log('Form valid:', formData);
    }
  };
  
  const isFormValid = Object.values(errors).every(e => !e) &&
                      Object.keys(formData).every(k => formData[k]);
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Username"
        />
        {touched.username && errors.username && (
          <span className="error">{errors.username}</span>
        )}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email"
        />
        {touched.email && errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Password"
        />
        {touched.password && errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Confirm Password"
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>
      
      <button type="submit" disabled={!isFormValid}>
        Sign Up
      </button>
    </form>
  );
}

// Uncontrolled: Quick form
function QuickContactForm() {
  const formRef = useRef();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use FormData API
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    
    console.log(data);
    
    // Reset form
    formRef.current.reset();
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="name" defaultValue="" required />
      <input name="email" type="email" defaultValue="" required />
      <textarea name="message" defaultValue="" />
      <button type="submit">Send</button>
    </form>
  );
}

// File upload with preview
function ImageUpload() {
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = () => {
    const file = fileRef.current.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  };
  
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="Preview" />}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
```

</details>
