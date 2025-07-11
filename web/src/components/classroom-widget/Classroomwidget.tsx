import './classroomwidget.css';
import Classroompic from './Classroompic.png'

interface ClassroomWidgetProps {
  className?: string;
  courseCode?: string;
  startDate?: string;
  endDate?: string;
};

const ClassroomWidget = ({ 
    className,
    courseCode,
    startDate,
    endDate 
}: ClassroomWidgetProps) => {
  return (
    <div className="course-card">
      <img
        src= {Classroompic}
        alt="Course background"
        className="course-card-image"
      />
      <div className="course-card-overlay" />
      <div className="course-card-text">
        <p className='course-card-name'>{className}</p>
        <p className="course-card-code">{courseCode}</p>
        <p className="course-card-date">
          Start:{startDate} 
          <br />
          End: {endDate}
        </p>
      </div>
    </div>
  );
};

export default ClassroomWidget;