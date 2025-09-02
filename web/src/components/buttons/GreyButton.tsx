import { ButtonHTMLAttributes } from "react";
import ColorButton from "./ColorButton";

type RedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
    onClick?: () => void;
}

function GreyButton({children, ...props}: RedButtonProps) {
    return (
        <ColorButton mainColor="#aaa" hoverColor="#777" clickedColor="#222" {...props}>
            {children}
        </ColorButton>
    )
}
export default GreyButton;