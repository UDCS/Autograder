import "./HomeworkAssignment.css"

interface HomeworkAssignmentProps {
    name: string;
    dueDate: Date;
}

function HomeworkAssignment({name, dueDate}: HomeworkAssignmentProps) {
    const formatDate = (date: Date): string => {
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();

        return `${mm}/${dd}/${yyyy}`;
    }
    return (
        <div className="homeworkAssignment">
            {name} 
            <br />
            Due on: {formatDate(dueDate)}
        </div>
    );
}

export default HomeworkAssignment;