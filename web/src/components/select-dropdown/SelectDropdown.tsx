import clsx from "clsx";
import "./SelectDropdown.css"
import { SelectHTMLAttributes } from "react"

type SelectDropdownProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & 
{
    onChange?: (selected: string) => void;
    options: string[];
};

function SelectDropdown({onChange, className, options, ...props}: SelectDropdownProps) {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let chosen = e.target.value;
        onChange?.(chosen);
    };

    const parseOptions = () =>{
        if (!options) return [];
        return options.map((opt: string) => <option value={opt}>{opt}</option>);
    };

    return (
        <select className={clsx("select-dropdown", className)} {...props} onChange={handleChange}>
            {...parseOptions()}
        </select>
    )
}
export default SelectDropdown;