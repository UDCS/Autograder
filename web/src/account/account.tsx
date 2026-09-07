import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import auth from "../utils/auth";
import Navbar from "../components/navbar/Navbar";
import './account.css'
import AccountSettings from "./AccountSettings";

function AccountApp() {
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

    if (!ready) return null;

    return <div>
        <Navbar />
        <AccountSettings />
    </div>;
}

createRoot(document.getElementById('root')!).render(<div>
    <AccountApp />
</div>)