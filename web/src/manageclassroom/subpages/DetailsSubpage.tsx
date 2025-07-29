import { useState } from "react";
import BlueButton from "../../components/bluebutton/BlueButton";
import CalendarInput from "../../components/calendar-input/CalendarInput";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import TextArea from "../../components/textarea/TextArea";
import { Classroom } from "../../models/classroom";
import "../css/DetailsSubpage.css"
import Popup from "../../components/popup/Popup";

interface DetailsSubpageProps {
    classroomInfo: Classroom;
}
function DetailsSubpage({classroomInfo}: DetailsSubpageProps) {
    const [isPopup, setIsPopup] = useState<boolean>(false);
    return (
        <>
            <p>Details</p>
            <input />
            <br />
            {JSON.stringify(classroomInfo)}
            <br />
            <CalendarInput onChange={(newDate: string) => {console.log(newDate);}} />
            <br />
            <TextArea onChange={(newText: string) => console.log(newText)} style={{width: "100%"}} rows={5} className="test">Hello, world!</TextArea>
            <br />
            <SelectDropdown options={["Option 1", "Option 2", "Really really long Option 3"]} onChange={(selected: string) => console.log(`${selected} selected`)}/>
            <br /> 
            <BlueButton onClick={() => setIsPopup(true)}>Click here to show popup</BlueButton>
            {isPopup && <Popup onClose={() => setIsPopup(false)}>Test Popup</Popup>}
        </>
    );
}
export default DetailsSubpage;