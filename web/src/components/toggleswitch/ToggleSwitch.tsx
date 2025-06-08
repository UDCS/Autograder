import { useState } from "react";
import Switch from "react-switch";

function ToggleSwitch({className}: {className?: string}) {   
    const [checked, setChecked] = useState(false);
    return <Switch 
                checkedIcon={false} 
                uncheckedIcon={false} 
                className={`toggleSwitch ${className}`} 
                onChange={() => setChecked(!checked)} 
                checked={checked}
                onColor="#0caadc"
                offColor="#1481ba"
                />
}

export default ToggleSwitch;