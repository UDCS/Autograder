import React, {ButtonHTMLAttributes, FC} from "react";
import "./BlueButton.css"

type BlueButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
}

const BlueButton: FC<BlueButtonProps> = ({children, ...props}) => {
    const {className, ...withoutClassname} = props;
    return (
        <button className={`blueButton ${className}`}
            {...withoutClassname}>
            {children}
        </button>
    );
}

export default BlueButton;