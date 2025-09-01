import { ButtonHTMLAttributes } from "react";
import ColorButton from "./ColorButton";

type RedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
    onClick?: () => void;
}

function RedButton({children, ...props}: RedButtonProps) {
    return (
        <ColorButton mainColor="red" hoverColor="#e00" clickedColor="darkred" {...props}>
            {children}
        </ColorButton>
    )
}
export default RedButton;