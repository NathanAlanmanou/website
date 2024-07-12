import React from 'react';

export const Card = ({ children, style, ...props }) => (
  <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', ...style }} {...props}>
    {children}
  </div>
);

export const Input = ({ style, ...props }) => (
  <input style={{ border: '1px solid #ccc', padding: '5px', margin: '5px 0', ...style }} {...props} />
);

export const Label = ({ children, style, ...props }) => (
  <label style={{ display: 'block', marginRight: '10px', ...style }} {...props}>
    {children}
  </label>
);

export const Select = ({ children, onValueChange, style, ...props }) => (
  <select 
    style={{ border: '1px solid #ccc', padding: '5px', margin: '5px 0', ...style }} 
    onChange={(e) => onValueChange(e.target.value)}
    {...props}
  >
    {children}
  </select>
);

export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

export const Tabs = ({ children }) => (
  <div style={{ marginBottom: '10px' }}>{children}</div>
);

export const TabsList = ({ children }) => (
  <div style={{ display: 'flex', gap: '5px' }}>{children}</div>
);

export const TabsTrigger = ({ children, isActive, onClick, ...props }) => (
  <button 
    style={{ 
      padding: '5px 10px', 
      border: '1px solid #ccc', 
      background: isActive ? '#e0e0e0' : 'white',
      cursor: 'pointer'
    }} 
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export default {
  Card,
  Input,
  Label,
  Select,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
};