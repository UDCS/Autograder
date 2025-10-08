import { HTMLAttributes, ReactNode } from "react";
import "./Popup.css"; 
import clsx from "clsx";

export type PopupProps = Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> & {
  children: ReactNode;
  onClose: () => void;
  onClick?: () => void;
};

function Popup ({ children, className, onClick, onClose, ...props }: PopupProps)  {
  return (
    <div className="popup-overlay" onClick={onClose} >
      <div className={clsx("popup-content", className)} onClick={(e) => {e.stopPropagation(); onClick?.();}} {...props}>
        {children}
      </div>
    </div>
  );
};

export default Popup;
