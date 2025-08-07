import { ButtonHTMLAttributes } from "react";
import ColorButton from "./ColorButton";

type DarkBlueButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
    onClick?: () => void;
}

function DarkBlueButton({children, ...props}: DarkBlueButtonProps) {
    return (
        <ColorButton mainColor="var(--color-NCS-blue)" hoverColor="var(--color-aero-blue)" clickedColor="var(--color-process-cyan)" {...props}>
            {children}
        </ColorButton>
    )
}
export default DarkBlueButton;