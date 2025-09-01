import clsx from "clsx";
import React, { TextareaHTMLAttributes, useEffect, useRef, useState } from "react";
import "./TextArea.css";

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  onChange?: (newText: string) => void;
  autoResize?: boolean;
};

function TextArea({ className, onChange, value, autoResize, ...props }: TextAreaProps) {

  const [text, setText] = useState(value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height first
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // Set to scrollHeight
    }
  }

  useEffect(() => {
    if (autoResize) resize();
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    onChange?.(value);

    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height first
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // Set to scrollHeight
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={clsx("textarea", className)}
      onChange={handleChange}
      value={text}
      {...props}
    />
  );
}

export default TextArea;