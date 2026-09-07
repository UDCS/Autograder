import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import auth from "../utils/auth";
import ClassroomManager from "./ClassroomManager";

function ManageClassroomApp() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            await auth.init();
            if (alive) setReady(true);
        })();
        return () => {
            alive = false;
        };
    }, []);

    return ready ? <ClassroomManager /> : null;
}

createRoot(document.getElementById('root')!).render(
    <ManageClassroomApp />
)