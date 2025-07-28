import { InputHTMLAttributes } from "react";
import "./CalendarInput.css"
import clsx from "clsx";

type CalendarInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onChange?: (newDate: string) => void;
}
function CalendarInput({onChange, className, ...props}: CalendarInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let dateString: string = e.target.value;
        onChange?.(dateString);
    };

    return <input className={clsx("calendar-input", className)} type="date" onChange={handleChange}  {...props} />
}
export default CalendarInput;