import { useEffect, useState } from "react";
import AssignmentPanel from "../components/assignment/AssignmentPanel";
import Navbar from "../components/navbar/Navbar";

function AssignmentBody() {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [assignmentInfo, setAssignmentInfo] = useState({});
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('id');

    useEffect(() => {
        const getAssignment = async () => {
            var response = await fetch(`/api/classroom/assignment/${assignmentId}`);
            if (response.ok) {
                var json = await response.json();
                setAssignmentInfo(json);
            } else {
                setErrorMessage("Error getting the assignment. Either the assignment does not exist or you do not have the permissions to see it.");
            }
        }
        const stopLoading = () => {
            setLoading(false);
        }
        (async function () {
            if (loading) {
                await getAssignment();
                stopLoading();
            }
        })();
    });

    return <>
        {!loading ?
            <div>
                <Navbar />
                <div className="panelParent">
                    {errorMessage === "" ?
                        <AssignmentPanel info={assignmentInfo}/>
                        : 
                        <div className="error">{errorMessage}</div>
                    }   
                </div>
            </div>
        : <></>}
    </>
}
export default AssignmentBody;