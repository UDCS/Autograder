import { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import DashboardSection from "./DashboardSection";
import { createBlankClassroom, parseDateString } from "../utils/classroom";
import BlueButton from "../components/buttons/BlueButton";
import DetailsSubpage from "../manageclassroom/subpages/DetailsSubpage";
import Popup from "../components/popup/Popup";

function DashboardBody() {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
    const [activeClasses, setActiveClasses] = useState<any[]>([]);
    const [expiredClasses, setExpiredClasses] = useState<any[]>([]);
    const [noClasses, setNoClasses] = useState(false);

    const [canAddClassroom, setCanAddClassroom] = useState(false);
    
    const [isPopup, setIsPopup] = useState<boolean>(false);
    
    useEffect(() => {
        var isError = false;
        
        const verifyLogin = async () => {
            try {
                var response = await fetch('/api/auth/valid_login');
                if (response.ok) {
                    var json = await response.json();
                    if (json['message'] != 'true') {
                        isError = true;
                        setErrorMessage("You need to be logged in to view assignments");
                        stopLoading();
                    }
                } else {
                    isError = true;
                    setErrorMessage("You need to be logged in to view assignments");
                    stopLoading();
                }
            } catch (err){
                console.error("Fetch error: ", err);
            }
        }
        const getClassrooms = async () => {
            var request = await fetch('/api/classroom/all');
            
            var currentEnrolledClasses = [];
            var currentActiveClasses = [];
            var currentExpiredClasses = []
            
            if (request.ok) {
                var json = await request.json();
                var classrooms = json['classrooms'];
                if (classrooms != null) {
                    var now = new Date().getTime();
                    for (let classroom of classrooms) {
                        let classStart = parseDateString(classroom.start_date).getTime();
                        let classExpire = parseDateString(classroom.end_date).getTime();
                        if (now > classExpire) {
                            currentExpiredClasses.push(classroom);
                        } else if (now < classStart) {
                            currentEnrolledClasses.push(classroom);
                        } else {
                            currentActiveClasses.push(classroom);
                        }
                    }
                    setEnrolledClasses(currentEnrolledClasses);
                    setActiveClasses(currentActiveClasses);
                    setExpiredClasses(currentExpiredClasses);
                } else {
                    setNoClasses(true);
                }
            } else {
                setErrorMessage("Error retrieving the classrooms")
            }
        }
        const getUserRole = async () => {
            var request = await fetch("/api/auth/role");
            if (request.ok) {
                var role = await request.json();
                if (role == "admin" || role == "instructor") {
                    setCanAddClassroom(true);
                }
            }
        }
        const stopLoading = () => {
            setLoading(false);
        }
        if (loading) {
            (async function () {
                await verifyLogin();
                if (isError) return;
                await getClassrooms();
                if (isError) return;
                await getUserRole();
                stopLoading();
            })();
        }
    })
    return <>
        {loading? <></> : <>
            <Navbar />
            {errorMessage === "" ? 
            <>
                {!noClasses ? 
                <>
                    <DashboardSection title="Enrolled Classes" classes={enrolledClasses}/>
                    <DashboardSection title="Active Classes" classes={activeClasses} />
                    <DashboardSection title="Expired Classes" classes={expiredClasses} />
                    {canAddClassroom &&
                        <div className="create-classroom-parent">
                            <BlueButton className="create-classroom-button" onClick={() => setIsPopup(true)}>+ Create New Classroom</BlueButton>
                        </div>
                    }   
                    {isPopup && 
                        <Popup onClose={() => setIsPopup(false)}>
                            <DetailsSubpage classroomInfo={createBlankClassroom()} newClassroom={true}></DetailsSubpage>
                        </Popup>
                    }   
                </>
                :
                <div className="errorParent">
                    <div className="error">
                        You are not part of any classrooms
                    </div>
                </div>
                }
            </>
            : 
            <div className="errorParent">
                <div className="error">
                    {errorMessage}
                </div>
            </div>
            }
        </>}
      </>
}
export default DashboardBody;