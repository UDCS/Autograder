import { useEffect, useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import CalendarInput from "../../components/calendar-input/CalendarInput";
import TextArea from "../../components/textarea/TextArea";
import { Classroom } from "../../models/classroom";
import "../css/DetailsSubpage.css"
import Popup from "../../components/popup/Popup";
import TextField, { TextFieldInput } from "../../components/textfield/Textfield";

interface DetailsSubpageProps {
    classroomInfo?: Classroom;
    changeClassroomTitle?: (newTitle: string) => void;
    newClassroom?: boolean;
}

const courseCodeMaxLength = 16;
const classroomNameMaxLength = 64;

function DetailsSubpage({classroomInfo, changeClassroomTitle, newClassroom=false}: DetailsSubpageProps) {
    const updateClassroomDetails = async (id: string, classroom: Classroom) => {
        var response = await fetch(`/api/classroom/edit/${id}/`, 
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(classroom)
            }
        )

        if (!response.ok) {
            console.log(response);
        } else {
            changeClassroomTitle?.(classroom.name!);
        }
    }
    const [isPopup, setIsPopup] = useState<boolean>(false);
    const [classroomName, setClassroomName] = useState<string>("");
    const [courseCode, setCourseCode] = useState<string>("");
    // const [bannerImage, setBannerImage] = useState<number>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [courseDescription, setCourseDescription] = useState<string>("");
    
    useEffect(() => {
        setClassroomName(classroomInfo?.name!)
        setCourseCode(classroomInfo?.course_code!)
        // setBannerImage(classroomInfo.banner_image_index!)
        setStartDate(classroomInfo?.start_date!)
        setEndDate(classroomInfo?.end_date!)
        setCourseDescription(classroomInfo?.course_description!)
    }, [classroomInfo])

    const handleClassroomNameChange = (input: TextFieldInput) => {
        setClassroomName(input.value);
    }

    const handleCourseCodeChange = (input: TextFieldInput) => {
        setCourseCode(input.value);
    }

    // const handleBannerImageChange = (input: I have no idea) => {
    //     setBannerImage(I have no idea);
    // }

    const handleStartDateChange = (input: string) => {
        setStartDate(input);
    }

    const handleEndDateChange = (input: string) => {
        setEndDate(input);
    }

    const handleCourseDescriptionChange = (input: string) => {
        setCourseDescription(input);
    }

    const handleServerSubmit = () => {
        updateClassroomDetails(
            classroomInfo?.id!,
            {
                name: classroomName,
                course_code: courseCode,
                // banner_image_index: bannerImage, //Non-functional at the moment
                start_date: startDate,
                end_date: endDate,
                course_description: courseDescription
            }
        );
    }

    return (
        <>
            {/* Classroom Name Element */}
            <div className="classroom-name-parent">
                <h3 id="classroom-name-text" className="details-title-fonts">Classroom Name:</h3>
                <TextField onChange={handleClassroomNameChange} label="" initialValue="Enter Classroom Name" value={classroomInfo?.name} className="classroom-name-field" maxLength={classroomNameMaxLength}></TextField>
            </div>
            {/* Classroom Code and Banner Image Button Element */}
            <div className="classroom-code-parent">
                    <h3 id="course-name-text" className="details-title-fonts">Course Code:</h3>
                <div className="classroom-code-sub-parent">
                    <TextField onChange={handleCourseCodeChange} label="" initialValue="Enter Course Code" value={classroomInfo?.course_code} maxLength={courseCodeMaxLength} className="classroom-code-field"></TextField>
                    <BlueButton onClick={() => setIsPopup(true)} className="change-banner-button">Change Banner Image</BlueButton>
                </div>
            </div>
            {/* Class Begin and End Date Element */}
            <div className="date-set-parent">
                <div id="start-date-set">
                    <h3 id="date-set-text" className="details-title-fonts">Start Date:</h3>
                    <CalendarInput defaultValue={classroomInfo?.start_date} onChange={handleStartDateChange}/>
                </div>
                <div id="end-date-set">
                    <h3 id="date-set-text" className="details-title-fonts">End Date:</h3>
                    <CalendarInput defaultValue={classroomInfo?.end_date} onChange={handleEndDateChange}/>
                </div>
            </div>
            <div className="course-description-parent">
                <h3 id="course-description-text" className="details-title-fonts">Course Description:</h3>
                <TextArea id="class-description-box" onChange={handleCourseDescriptionChange} style={{width: "100%"}} rows={5} className="test" value={classroomInfo?.course_description}></TextArea>
            </div>
            <div>
                <BlueButton onClick={handleServerSubmit} id="submit-changes-button">Submit</BlueButton>
            </div>
            {isPopup && <Popup onClose={() => setIsPopup(false)}>
                <p className="popup-style">Banner Image Index: {classroomInfo?.banner_image_index}</p>
                <p className="popup-style">Feature Still Under Development.</p>
                <p className="popup-style">Check Back Later!</p>
            </Popup>}   
        </>
    );
}
export default DetailsSubpage;