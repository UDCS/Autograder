import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import auth from "../utils/auth";
import AssignmentBody from "./AssignmentBody";

function AssignmentApp() {
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

    return ready ? <AssignmentBody /> : null;
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AssignmentApp />
    </StrictMode>
)