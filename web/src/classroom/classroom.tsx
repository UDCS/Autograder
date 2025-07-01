import { createRoot } from "react-dom/client";
import './classroom.css'
import ClassroomBody from "./ClassroomBody";


createRoot(document.getElementById('root')!).render(<div>
    <ClassroomBody />
</div>)