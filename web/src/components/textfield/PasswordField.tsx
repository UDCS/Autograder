import React, { useState, ChangeEvent, InputHTMLAttributes } from "react";
import "./Textfield.css";

export type PasswordFieldInput = {
  value: string;
  isValid: boolean;
  error: string;
};

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> & {
  initialValue?: string;
  label?: string;
  onChange?: (data: PasswordFieldInput) => void;
};

const PasswordField: React.FC<PasswordFieldProps> = ({
  initialValue = "",
  label = "",
  onChange,
  className = "",
  ...props
}) => {
  const [value, setValue] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Call onChange if it exists
    if (onChange) {
      onChange({
        value: newValue,
        isValid: true, // Passwords don't have validation requirements here
        error: "",
      });
    }
  };

  return (
    <div className={`textfield-container ${className}`}>
      {label && <label className="textfield-label">{label}</label>}
      <input
        type="password"
        value={value}
        onChange={handleChange}
        className="textfield-input"
        placeholder={initialValue || "Password"}
        {...props}
      />
    </div>
  );
};

export default PasswordField;
