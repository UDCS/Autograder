import { ReactNode } from "react";
import "./Popup.css"; 

type PopupProps = {
  children: ReactNode;
  onClose: () => void;
};

function Popup ({ children, onClose }: PopupProps)  {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Popup;
