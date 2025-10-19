import { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import DashboardSection from "./DashboardSection";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [enrolledClasses, setEnrolledClasses] = useState<object[]>([]);
  const [activeClasses, setActiveClasses] = useState<object[]>([]);
  const [expiredClasses, setExpiredClasses] = useState<object[]>([]);
  const [noClasses, setNoClasses] = useState(false);

  useEffect(() => {
    let isError = false;
    const parseDateString = (dateString: string) => {
      const parts = dateString
        .split("-")
        .map((p, i) => Number(p) - Number(i == 1));
      return new Date(parts[0], parts[1], parts[2]);
    };
    const verifyLogin = async () => {
      try {
        const response = await fetch("/api/auth/valid_login");
        if (response.ok) {
          const json = await response.json();
          if (json["message"] != "true") {
            isError = true;
            setErrorMessage("You need to be logged in to view assignments");
            stopLoading();
          }
        } else {
          isError = true;
          setErrorMessage("You need to be logged in to view assignments");
          stopLoading();
        }
      } catch (err) {
        console.error("Fetch error: ", err);
      }
    };
    const getClassrooms = async () => {
      const request = await fetch("/api/classroom/all");

      const currentEnrolledClasses: object[] = [];
      const currentActiveClasses: object[] = [];
      const currentExpiredClasses: object[] = [];

      if (request.ok) {
        const json = await request.json();
        const classrooms = json["classrooms"];
        if (classrooms != null) {
          const now = new Date().getTime();
          for (const classroom of classrooms) {
            const classStart = parseDateString(classroom.start_date).getTime();
            const classExpire = parseDateString(classroom.end_date).getTime();
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
        setErrorMessage("Error retrieving the classrooms");
      }
    };
    const stopLoading = () => {
      setLoading(false);
    };
    if (loading) {
      (async function () {
        await verifyLogin();
        if (isError) return;
        await getClassrooms();
        stopLoading();
      })();
    }
  });
  return (
    <>
      {loading ? (
        <></>
      ) : (
        <>
          <Navbar />
          {errorMessage === "" ? (
            <>
              {!noClasses ? (
                <>
                  <DashboardSection
                    title="Enrolled Classes"
                    classes={enrolledClasses}
                  />
                  <DashboardSection
                    title="Active Classes"
                    classes={activeClasses}
                  />
                  <DashboardSection
                    title="Expired Classes"
                    classes={expiredClasses}
                  />
                </>
              ) : (
                <div className="errorParent">
                  <div className="error">
                    You are not part of any classrooms
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="errorParent">
              <div className="error">{errorMessage}</div>
            </div>
          )}
        </>
      )}
    </>
  );
}
export default Dashboard;
