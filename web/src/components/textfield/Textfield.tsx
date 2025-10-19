import React, {
  useState,
  ChangeEvent,
  InputHTMLAttributes,
  useEffect,
} from "react";
import "./Textfield.css";

export type TextFieldInput = {
  value: string;
};
// Define props interface
type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  initialValue?: string;
  label?: string;
  onChange?: (data: TextFieldInput) => void;
};

const TextField: React.FC<TextFieldProps> = ({
  initialValue = "",
  label = "Input",
  type,
  onChange,
  className,
  maxLength,
  ...props
}) => {
  const [value, setValue] = useState<string>("");

  const [startedChange, setStartedChange] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (maxLength && newValue.length > maxLength)
      newValue = newValue.substring(0, maxLength);
    setValue(newValue);

    if (!startedChange) {
      setStartedChange(true);
    }

    // Only call onChange if it exists
    if (onChange) {
      onChange({
        value: newValue,
      });
    }
    //Add a check to see if a possword if being entered, and thus make the characters dots instead of the entered characters
  };

  useEffect(() => {
    if (!startedChange) {
      setValue(props.value && value == "" ? props.value.toString() : value);
    }
  }, [startedChange, props.value, value]);

  return (
    <div className={`textfield-container ${className}`} {...props}>
      {label && <label className="textfield-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={`textfield-input ${className}`}
        placeholder={initialValue ?? "Enter Text Here"}
      />
    </div>
  );
};

export default TextField;
