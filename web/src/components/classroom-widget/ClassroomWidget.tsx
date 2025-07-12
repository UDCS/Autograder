import './classroomwidget.css';
import Classroompic from './Classroompic.png'

interface ClassroomWidgetProps {
  name?: string;
  course_code?: string;
  start_date?: string;
  end_date?: string;
  id?: string;
};

const ClassroomWidget = ({ 
    name,
    course_code,
    start_date,
    end_date,
    id
}: ClassroomWidgetProps) => {
  return (
    <a className="course-card" href={`/classroom?id=${id}`}>
      <img
        src= {Classroompic}
        alt="Course background"
        className="course-card-image"
      />
      <div className="course-card-overlay" />
      <div className="course-card-text">
        <p className='course-card-name'>{name}</p>
        <p className="course-card-code">{course_code}</p>
        <p className="course-card-date">
          Start:{start_date} 
          <br />
          End: {end_date}
        </p>
      </div>
    </a>
  );
};

export default ClassroomWidget;