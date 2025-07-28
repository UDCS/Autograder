import clsx from "clsx";
import { TextareaHTMLAttributes } from "react"
import "./TextArea.css"

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & 
{
    onChange?: (newText: string) => void;
};

function TextArea({className, onChange, ...props}: TextAreaProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let chosen = e.target.value;
        onChange?.(chosen);
    };
    return <textarea className={clsx("textarea", className)} onChange={handleChange} {...props}></textarea>
}

export default TextArea;