import { useState, useRef, useEffect, TextareaHTMLAttributes } from "react";
import "./TitleInput.css"; // styles below
import clsx from "clsx";

type TitleInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'ref' | 'value'> & {
    onChange?: (newText: string) => void;
};
function TitleInput({onChange, className, ...props}: TitleInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;
        setValue(newValue);
        onChange?.(newValue);
    };

    useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; 
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; 
    }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className={clsx("title-input", className)}
            value={value}
            onChange={handleChange}
            rows={1}
            {...props}
        />
    );
}

export default TitleInput;
