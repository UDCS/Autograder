import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import './classroom.css'
import TitleBanner from "../components/titlebanner/TitleBanner";
import AssignmentDropdown from "../components/assignment/AssignmentDropdown";
import HomeworkSidebar from "../components/homework/HomeworkSidebar";
import HomeworkAssignment from "../components/homework/HomeworkAssignment";


createRoot(document.getElementById('root')!).render(<div>
    <Navbar />
    <TitleBanner>Test classroom</TitleBanner>
    <div id='classroomBody'>
        <div id="assignments">
            <AssignmentDropdown name="Test assignment"></AssignmentDropdown>
        </div>
        <div id="homework">
            <HomeworkSidebar>
                <HomeworkAssignment name="Test assignment" dueDate={new Date()}/>
                <HomeworkAssignment name="Test assignment 2" dueDate={new Date()}/>
            </HomeworkSidebar>
        </div>
    </div>
</div>)