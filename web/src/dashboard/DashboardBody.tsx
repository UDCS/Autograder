import { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import DashboardSection from "./DashboardSection";

function DashboardBody() {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
    const [activeClasses, setActiveClasses] = useState<any[]>([]);
    const [expiredClasses, setExpiredClasses] = useState<any[]>([]);
    useEffect(() => {
        var isError = false;
        const parseDateString = (dateString: string) => {
            let parts = dateString.split("-").map((p, i) => Number(p) - Number(i == 1));
            return new Date(parts[0], parts[1], parts[2]);
        }
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
                console.log(classrooms);
                var now = new Date().getTime();
                console.log("now: ", now)
                for (let classroom of classrooms) {
                    console.log(classroom);
                    let classStart = parseDateString(classroom.start_date).getTime();
                    let classExpire = parseDateString(classroom.end_date).getTime();
                    console.log("start: ",classStart);
                    console.log("expire: ", classExpire)

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
                setErrorMessage("Error retrieving the classrooms")
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
                stopLoading();
            })();
        }
    })
    return <>
        {loading? <></> : <>
            <Navbar />
            {errorMessage === "" ? 
            <>
                <DashboardSection title="Enrolled Classes" classes={enrolledClasses}/>
                <DashboardSection title="Active Classes" classes={activeClasses} />
                <DashboardSection title="Expired Classes" classes={expiredClasses} />
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