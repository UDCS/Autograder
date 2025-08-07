import clsx from "clsx";
import { HTMLAttributes, useState } from "react";

import "./FontSizeInput.css"

type FontSizeProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & 
{
    onChange?: (fontSize: number) => void;
    defaultFontSize?: number;
};

function FontSizeInput({className, defaultFontSize, onChange, ...props}: FontSizeProps) {

    const maxFontSize: number = 50;
    const [fontSize, setFontSize] = useState<number>(defaultFontSize ? defaultFontSize : 15);

    const changeFontSize = (newSize: number) => {
        if (newSize > maxFontSize) newSize = maxFontSize;
        else if (newSize <= 0) newSize = 1;
        setFontSize(newSize);
        onChange?.(newSize);
    }

    return (
        <div className={clsx("fontsize-input", className)} {...props}>
            Font Size
            <input value={fontSize} onChange={(event: React.ChangeEvent<HTMLInputElement>) => changeFontSize(Number(event.target.value))} min={1} max={50} type="number" className="fontsize-number" step={1}/>
        </div>
    )
}
export default FontSizeInput;