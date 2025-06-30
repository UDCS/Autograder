import "./HomeworkSidebar.css"
interface HomeworkSidebarProps {
    children?: React.ReactNode;
}
function HomeworkSidebar({children}: HomeworkSidebarProps) {
    return (
        <div className="homeworkSidebar">
            <div className="homeworkHeader">Homework</div>
            <div className="homeworkAssignments">
                {children}
            </div>
        </div>
    );
}
export default HomeworkSidebar;