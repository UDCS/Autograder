import { Link } from "react-router-dom";
import "./HomeworkAssignment.css";

interface HomeworkAssignmentProps {
  name: string;
  dueDate: Date;
  assignmentId: string;
}

function HomeworkAssignment({
  name,
  dueDate,
  assignmentId,
}: HomeworkAssignmentProps) {
  const isLate = dueDate.getTime() < new Date().getTime();
  const formatDate = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
  };
  return (
    <Link
      className={`homeworkAssignment${isLate ? " late" : ""}`}
      to={`/assignment?id=${assignmentId}`}
    >
      {name}
      <br />
      Due on: {formatDate(dueDate)}
    </Link>
  );
}

export default HomeworkAssignment;
