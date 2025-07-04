import React, { useState, ChangeEvent, InputHTMLAttributes, useEffect} from 'react';
import './Textfield.css';

// Define props interface
type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  initialValue?: string;
  label?: string;
  email?: boolean;
  password?: boolean;
  onChange?: (data: {
    value: string;
    isValid: boolean;
    error: string;
  }) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  initialValue = '',
  label = 'Input',
  email = false,
  onChange,
  password,
  ...props
}) => {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>('');

  const [startedChange, setStartedChange] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateInput = (newValue: string): string => {
    if (email) {
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

    if (!startedChange) {
      setStartedChange(true);
    }
    
    // Only call onChange if it exists
    if (onChange) {
      onChange({
        value: newValue,
        isValid: !validationError,
        error: validationError,
      });
    }
    //Add a check to see if a possword if being entered, and thus make the characters dots instead of the entered characters
  };

  useEffect(() => {
    if (!startedChange) {
      setValue(props.value && value == '' ? props.value.toString() : value);
    }
  })

  return (
    <div className={`textfield-container ${props.className}`} {...props}>
      {label && <label className="textfield-label">{label}</label>}
      <input
        type={email ? "email" : password ? "password" : "text"}
        value={value}
        onChange={handleChange}
        className={`textfield-input ${error ? 'error' : ''} ${props.className}`}
        placeholder={initialValue ? initialValue : email ? "Email" : password ? "Password" : "Enter Text Here"}
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
        email
        onChange={handleTextChange}
      />
      <TextField 
        initialValue="Regular text"
        label="Name"
        password
        onChange={handleTextChange}
      />
    </div>
  );
}
*/

export default TextField;