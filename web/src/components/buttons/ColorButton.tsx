import "./ColorButton.css"
import clsx from "clsx";
import React, { ButtonHTMLAttributes, useEffect, useState } from "react";

type ColorButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  mainColor: string;
  hoverColor: string;
  clickedColor: string;
  children?: React.ReactNode;
  fontColor?: string;
  onClick?: () => void;
};

function ColorButton({
    mainColor: color,
    hoverColor,
    clickedColor,
    fontColor,
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onClick,
    ...props
}: ColorButtonProps)  {
    const [bgColor, setBgColor] = useState(color);

    useEffect(() => {
        setBgColor(color);
    }, [color]);

    return (
        <>
            <button
                className={clsx('color-button', className)}
                onClick={onClick}
                style={{
                    ...(fontColor && { color: fontColor }),
                    // 👇 set CSS variable
                    ['--bg-color' as any]: bgColor,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {onMouseEnter?.(e); setBgColor(hoverColor);}}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {onMouseLeave?.(e); setBgColor(color);}}
                onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {onMouseDown?.(e); setBgColor(clickedColor);}}
                onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => {onMouseUp?.(e); setBgColor(hoverColor);}}
                {...props}
            >
                {children}
            </button>
        </>
    );
}

export default ColorButton;
