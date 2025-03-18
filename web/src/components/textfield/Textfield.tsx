import React, { useState, ChangeEvent } from 'react';
import './TextField.css';

// Define props interface
interface TextFieldProps {
  initialValue?: string;
  label?: string;
  checkEmail?: boolean;
  onChange?: (data: {
    value: string;
    isValid: boolean;
    error: string;
  }) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  initialValue = '',
  label = 'Input',
  checkEmail = false,
  onChange,
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState<string>('');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateInput = (newValue: string): string => {
    if (checkEmail) {
      if (!newValue) {
        return 'Email is required';
      }
      if (!emailRegex.test(newValue)) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Validate input if email checking is enabled
    const validationError = validateInput(newValue);
    setError(validationError);
    
    // Only call onChange if it exists
    if (onChange) {
      onChange({
        value: newValue,
        isValid: !validationError,
        error: validationError,
      });
    }
  };

  return (
    <div className="textfield-container">
      {label && <label className="textfield-label">{label}</label>}
      <input
        type={checkEmail ? "email" : "text"}
        value={value}
        onChange={handleChange}
        className={`textfield-input ${error ? 'error' : ''}`}
        placeholder={checkEmail ? "Enter email" : "Enter text"}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

/*

// Example usage with TypeScript:
interface FormData {
  value: string;
  isValid: boolean;
  error: string;
}

function App() {
  const handleTextChange = (data: FormData) => {
    console.log('Value:', data.value);
    console.log('Is Valid:', data.isValid);
    console.log('Error:', data.error);
  };

  return (
    <div>
      <TextField 
        initialValue="john@example.com"
        label="Email"
        checkEmail={true}
        onChange={handleTextChange}
      />
      <TextField 
        initialValue="Regular text"
        label="Name"
        checkEmail={false}
        onChange={handleTextChange}
      />
    </div>
  );
}
*/

export default TextField;

// All of the code below is for the old textfield that does not work as desired
// import { ChangeEvent, FC } from 'react' 

// interface InputProps {
//   type: 'text' | 'number' | 'email' | 'password'
//   label: string
//   value: string | number
//   name: string
//   placeholder: string
//   error: boolean
//   disabled?: boolean
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void
// }

// const Input: FC<InputProps> = ({
//   type,
//   label,
//   value,
//   name,
//   placeholder,
//   error,
//   disabled,
//   onChange,
// }) => {
//   return (
//     <div className="input-wrapper">
//       <label htmlFor={label}>{label}</label>
//       <input
//         type={type}
//         id={label}
//         value={value}
//         name={name}
//         placeholder={placeholder}
//         onChange={onChange}
//         disabled={disabled}
//       />
//       {error && <p className="error">Input filed can't be empty!</p>}
//     </div>
//   )
// }

// export default Input