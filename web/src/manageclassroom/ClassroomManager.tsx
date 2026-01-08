import { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import ClassroomSidebar, {
  ClassroomSidebarSelected,
} from "./components/ClassroomSidebar";
import AssignmentsSubpage from "./subpages/AssignmentsSubpage";
import DetailsSubpage from "./subpages/DetailsSubpage";
import GradesSubpage from "./subpages/GradesSubpage";
import StudentsSubpage from "./subpages/StudentsSubpage";
import { Classroom } from "../models/classroom";

function ClassroomManager() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ClassroomSidebarSelected>("details");
  const [classroomInfo, setClassroomInfo] = useState<Classroom>({});
  const [classroomName, setClassroomName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const classroomId = urlParams.get("id");
  const onChange = (newState: ClassroomSidebarSelected) => {
    setSelected(newState);
  };

  useEffect(() => {
    const stopLoading = () => {
      setLoading(false);
    };
    let isError = false;
    const verifyLogin = async () => {
      try {
        const response = await fetch("/api/auth/valid_login");
        if (response.ok) {
          const json = await response.json();
          if (json["message"] != "true") {
            isError = true;
            setErrorMessage("You need to be logged in to manage classrooms");
            stopLoading();
          }
        } else {
          isError = true;
          setErrorMessage("You need to be logged in to manage classrooms");
          stopLoading();
        }
      } catch (err) {
        console.error("Fetch error: ", err);
      }
    };
    const getClassroomInfo = async () => {
      const response = await fetch(`/api/classroom/${classroomId}`);
      if (response.ok) {
        const json = await response.json();
        setClassroomInfo(json);
        setClassroomName(json["name"]);
      } else {
        isError = true;
        setErrorMessage(
          "Either the classroom does not exist or you are not part of this classroom"
        );
        stopLoading();
      }
    };
    (async function () {
      if (loading) {
        await verifyLogin();
        if (isError) return;
        await getClassroomInfo();
        if (isError) return;
        stopLoading();
      }
    })();
  });

  return (
    <>
      {!loading ? (
        <>
          <Navbar />
          {errorMessage === "" ? (
            <div id="main">
              <h1 className="classroomName">{classroomName}</h1>
              <div id="content">
                <ClassroomSidebar onChange={onChange} />
                <div id="body">
                  <div
                    className={`${selected === "assignments" ? "" : "hidden"}`}
                  >
                    <AssignmentsSubpage classroomInfo={classroomInfo} />
                  </div>
                  <div className={`${selected === "details" ? "" : "hidden"}`}>
                    <DetailsSubpage
                      changeClassroomTitle={setClassroomName}
                      classroomInfo={classroomInfo}
                    />
                  </div>
                  <div className={`${selected === "grades" ? "" : "hidden"}`}>
                    <GradesSubpage classroomInfo={classroomInfo} />
                  </div>
                  <div className={`${selected === "students" ? "" : "hidden"}`}>
                    <StudentsSubpage classroomInfo={classroomInfo} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="errorParent">
              <div className="error">{errorMessage}</div>
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
export default ClassroomManager;
