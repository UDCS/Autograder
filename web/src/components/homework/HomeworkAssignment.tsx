import "./HomeworkAssignment.css"

interface HomeworkAssignmentProps {
    name: string;
    dueDate: Date;
    assignmentId: string;
}

function HomeworkAssignment({name, dueDate, assignmentId}: HomeworkAssignmentProps) {
    // The real deadline is end of the due day, so only style as late after that.
    const endOfDueDay = new Date(dueDate);
    endOfDueDay.setHours(23, 59, 59, 999);
    const isLate = endOfDueDay.getTime() < new Date().getTime();
    const formatDate = (date: Date): string => {
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();

        return `${mm}/${dd}/${yyyy}`;
    }
    return (
        <a className={`homeworkAssignment${isLate ? ' late' : ''}`} href={`/assignment?id=${assignmentId}`}>
            {name} 
            <br />
            Due on: {formatDate(dueDate)}
        </a>
    );
}

export default HomeworkAssignment;