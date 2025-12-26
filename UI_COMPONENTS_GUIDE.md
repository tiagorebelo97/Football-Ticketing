# Quick Reference Guide: Premium UI Components

## Overview
This guide provides quick examples of how to use the new premium UI components after the UI/UX refactoring.

## Color Scheme

### CSS Variables
```css
/* Backgrounds */
--bg-space: #05070a         /* Deep space black */
--bg-deep: #0f111a          /* Dark background */
--bg-glass: rgba(15, 17, 26, 0.7)  /* Glass effect */
--bg-glass-light: rgba(255, 255, 255, 0.03)  /* Light glass */

/* Accents */
--accent-primary: #00f2fe   /* Cyan */
--accent-secondary: #4facfe /* Blue */
--accent-vibrant: #7000ff   /* Purple */

/* Text */
--text-main: #f8fafc        /* Primary text */
--text-muted: #94a3b8       /* Secondary text */
--text-dim: #64748b         /* Tertiary text */

/* Borders & Effects */
--border-glass: rgba(255, 255, 255, 0.08)
--border-focus: rgba(79, 172, 254, 0.5)
--shadow-premium: 0 8px 32px 0 rgba(0, 0, 0, 0.8)
--shadow-glow: 0 0 20px rgba(79, 172, 254, 0.2)
```

## Component Examples

### 1. Glass Cards

**Basic Card**:
```tsx
<div className="glass-card">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>
```

**Card with Hover Effect**:
```tsx
<div className="glass-card" style={{ cursor: 'pointer' }}>
  <h3>Clickable Card</h3>
  {/* Hover effect applied automatically */}
</div>
```

### 2. Premium Buttons

**Primary Button (Gradient)**:
```tsx
<button className="premium-btn premium-btn-primary">
  Save Changes
</button>
```

**Secondary Button (Glass Effect)**:
```tsx
<button className="premium-btn premium-btn-secondary">
  Cancel
</button>
```

**Button with Icon**:
```tsx
import { FaSave } from 'react-icons/fa';

<button className="premium-btn premium-btn-primary">
  <FaSave />
  Save
</button>
```

### 3. Form Elements

**Input Field**:
```tsx
<div className="form-group">
  <label>Email Address</label>
  <input
    type="email"
    placeholder="Enter your email"
    className="glass-effect"
  />
</div>
```

**Select Dropdown**:
```tsx
<div className="form-group">
  <label>Country</label>
  <select className="glass-effect">
    <option value="">Select Country</option>
    <option value="pt">Portugal</option>
    <option value="es">Spain</option>
  </select>
</div>
```

**Textarea**:
```tsx
<div className="form-group">
  <label>Description</label>
  <textarea
    className="glass-effect"
    rows={4}
    placeholder="Enter description"
  />
</div>
```

### 4. Status Badges

**Success Badge**:
```tsx
<span className="badge badge-success">Active</span>
```

**Warning Badge**:
```tsx
<span className="badge badge-warning">Pending</span>
```

**Custom Badge**:
```tsx
<span className="badge" style={{
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  border: '1px solid rgba(239, 68, 68, 0.2)'
}}>
  Error
</span>
```

### 5. Text Styling

**Gradient Text**:
```tsx
<h1 className="text-gradient">Welcome Back</h1>
```

**Premium Heading**:
```tsx
<h2 className="font-premium" style={{ fontSize: '24px', fontWeight: 700 }}>
  Dashboard
</h2>
```

### 6. Layout Components

**Page Header**:
```tsx
<div style={{ marginBottom: '32px' }}>
  <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800 }}>
    Page Title
  </h1>
  <p style={{ color: 'var(--text-muted)' }}>
    Page description goes here
  </p>
</div>
```

**Action Row**:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
  <div>
    <h1 className="text-gradient">Venues</h1>
    <p style={{ color: 'var(--text-muted)' }}>Manage your venues</p>
  </div>
  <button className="premium-btn premium-btn-primary">
    + Add Venue
  </button>
</div>
```

### 7. Tables

**Premium Table**:
```tsx
<div className="glass-card">
  <table className="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td><span className="badge badge-success">Active</span></td>
        <td>
          <button className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px' }}>
            Edit
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 8. Grid Layouts

**Card Grid**:
```tsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '24px' 
}}>
  <div className="glass-card">Card 1</div>
  <div className="glass-card">Card 2</div>
  <div className="glass-card">Card 3</div>
</div>
```

### 9. Loading States

**Loading Spinner**:
```tsx
<div style={{ textAlign: 'center', padding: '50px' }}>
  <div style={{ 
    fontSize: '48px', 
    animation: 'spin 1s linear infinite' 
  }}>
    ⚡
  </div>
  <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
    Loading...
  </p>
</div>
```

### 10. Empty States

**No Data State**:
```tsx
<div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
  <div style={{ fontSize: '64px', marginBottom: '24px' }}>📋</div>
  <h3 style={{ marginBottom: '8px' }}>No Items Found</h3>
  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
    Get started by creating your first item
  </p>
  <button className="premium-btn premium-btn-primary">
    + Create Item
  </button>
</div>
```

## Navigation Components

### Sidebar Link (Active State)

```tsx
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const location = useLocation();
const isActive = location.pathname === '/dashboard';

<Link
  to="/dashboard"
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    textDecoration: 'none',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
    background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
    marginBottom: '8px',
    transition: 'var(--transition-smooth)',
    position: 'relative'
  }}
>
  {isActive && (
    <div style={{
      position: 'absolute',
      left: 0,
      height: '20px',
      width: '3px',
      background: 'var(--accent-primary)',
      borderRadius: '0 4px 4px 0'
    }} />
  )}
  <span style={{ marginRight: '16px', fontSize: '18px', display: 'flex' }}>
    <FaHome />
  </span>
  <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '15px' }}>
    Dashboard
  </span>
</Link>
```

## Common Patterns

### Search Bar

```tsx
<div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
  <input
    type="text"
    placeholder="Search..."
    style={{
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-main)'
    }}
  />
</div>
```

### Filter Row

```tsx
<div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px' }}>
    <input
      type="text"
      placeholder="Search..."
      style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-main)'
      }}
    />
    <select style={{
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-main)'
    }}>
      <option value="">All Categories</option>
    </select>
    <button className="premium-btn premium-btn-primary">
      Apply
    </button>
  </div>
</div>
```

### Modal/Dialog Container

```tsx
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(5, 7, 10, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}}>
  <div className="glass-card" style={{ 
    maxWidth: '500px', 
    width: '100%', 
    margin: '20px',
    padding: '32px' 
  }}>
    <h2 style={{ marginBottom: '24px' }}>Dialog Title</h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
      Dialog content goes here
    </p>
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <button className="premium-btn premium-btn-secondary">Cancel</button>
      <button className="premium-btn premium-btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

## Animation Examples

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

```tsx
<div style={{ animation: 'fadeIn 0.4s ease-out' }}>
  {/* Content */}
</div>
```

### Hover Glow

```tsx
<button 
  className="premium-btn premium-btn-primary"
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  Hover Me
</button>
```

## Responsive Utilities

### Mobile-First Breakpoints

```tsx
// Mobile
<div style={{ padding: '16px' }}>
  {/* Content */}
</div>

// Tablet and up
@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}

// Desktop
@media (min-width: 1024px) {
  .container {
    padding: 40px;
  }
}
```

## Best Practices

1. **Always use CSS variables** for colors instead of hardcoded values
2. **Use glass-card** for container components
3. **Apply premium-btn classes** for all buttons
4. **Use text-gradient** for important headings
5. **Maintain consistent spacing** using multiples of 8px (8, 16, 24, 32, 40)
6. **Use transition-smooth** for animations
7. **Test on multiple browsers**, especially Safari for backdrop-filter support
8. **Keep accessibility in mind** - ensure sufficient contrast ratios

## Tips

- Use `backdrop-filter: blur(20px)` for glass effects
- Combine glass effects with subtle borders for depth
- Use gradient text sparingly for emphasis
- Maintain consistent border radius using CSS variables
- Test hover states on all interactive elements
- Use appropriate font weights (500 for normal, 600 for medium, 700-800 for bold)

## Support

For questions or issues with the new UI components, refer to:
- `UI_UX_REFACTOR_SUMMARY.md` - Complete refactoring documentation
- `apps/super-admin-dashboard/src/` - Reference implementation
- Individual app `index.css` files - CSS variable definitions
