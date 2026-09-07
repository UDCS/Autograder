import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import auth from "../utils/auth";
import './classroom.css'
import ClassroomBody from "./ClassroomBody";

function ClassroomApp() {
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

    return ready ? <ClassroomBody /> : null;
}

createRoot(document.getElementById('root')!).render(<div>
    <ClassroomApp />
</div>)