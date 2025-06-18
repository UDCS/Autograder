import React, {ButtonHTMLAttributes, FC} from "react";
import "./BlueButton.css"

type BlueButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
}

const BlueButton: FC<BlueButtonProps> = ({children, ...props}) => {
    return (
        <button className={`blueButton ${props.className}`}
            {...props}>
            {children}
        </button>
    );
}

export default BlueButton;