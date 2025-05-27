import './classroomwidget.css';
import Classroompic from './Classroompic.png'

interface Classroomwidget {
  imageSrc?: string;
  instructorName?: string;
  termYear?: string;
  termBeginEndDate?: string;
};

const Classroomwidget = ({ 
    imageSrc = Classroompic, 
    instructorName = 'Instructor Name', 
    termYear = "Term Year", 
    termBeginEndDate = "Term Begin/End Date", 
}) => {
  return (
    <div className="course-card">
      <img
        src= {imageSrc}
        alt="Course background"
        className="course-card-image"
      />
      <div className="course-card-overlay" />
      <div className="course-card-text">
        <p className="course-card-instructor">{instructorName}</p>
        <p className="course-card-term">{termYear}</p>
      </div>
      <div className="course-card-date">
        {termBeginEndDate}
      </div>
    </div>
  );
};

export default Classroomwidget;