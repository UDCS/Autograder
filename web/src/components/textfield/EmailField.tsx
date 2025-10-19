import React, { useState, ChangeEvent, InputHTMLAttributes } from "react";
import "./Textfield.css";

export type EmailFieldInput = {
  value: string;
  isValid: boolean;
  error: string;
};

type EmailFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> & {
  initialValue?: string;
  label?: string;
  onChange?: (data: EmailFieldInput) => void;
};

const EmailField: React.FC<EmailFieldProps> = ({
  initialValue = "",
  label = "",
  onChange,
  className = "",
  ...props
}) => {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (emailValue: string): string => {
    if (!emailValue) {
      return "Email is required";
    }
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Validate email
    const validationError = validateEmail(newValue);
    setError(validationError);

    // Call onChange if it exists
    if (onChange) {
      onChange({
        value: newValue,
        isValid: !validationError,
        error: validationError,
      });
    }
  };

  return (
    <div className={`textfield-container ${className}`}>
      {label && <label className="textfield-label">{label}</label>}
      <input
        type="email"
        value={value}
        onChange={handleChange}
        className={`textfield-input ${error ? "error" : ""}`}
        placeholder={initialValue || "Email"}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default EmailField;
