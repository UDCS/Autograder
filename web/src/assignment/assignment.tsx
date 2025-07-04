import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import AssignmentPanel from "../components/assignment/AssignmentPanel";

createRoot(document.getElementById('root')!).render(<div>
    <Navbar />
    <div className="panelParent">
        <AssignmentPanel />
    </div>
</div>)