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
        var isError = false;
        const getAssignment = async () => {
            var response = await fetch(`/api/classroom/assignment/${assignmentId}`);
            if (response.ok) {
                var json = await response.json();
                setAssignmentInfo(json);
            } else {
                setErrorMessage("Error getting the assignment. Either the assignment does not exist or you do not have the permissions to see it.");
            }
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
        const stopLoading = () => {
            setLoading(false);
        }
        (async function () {
            if (loading) {
                await verifyLogin();
                if (isError) return;
                await getAssignment();
                stopLoading();
            } else if (errorMessage === "") {
                const hash = window.location.hash.substring(1);
                if (hash) {
                    const el = document.getElementById(hash);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                    }
                }
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