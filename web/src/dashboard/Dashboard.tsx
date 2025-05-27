import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import Classroomwidget from '../components/classroom-widget/Classroomwidget'
import './dashboard.css'

  const enrolledClasses = [
    { instructorName: 'Dr. John Smith', termYear: 'Fall 2025', termBeginEndDate: 'September 1, 2025' },
    { instructorName: 'Prof. Jane Doe', termYear: 'Fall 2025', termBeginEndDate: 'September 1, 2025' },
    { instructorName: 'Dr. Alice Brown', termYear: 'Fall 2025', termBeginEndDate: 'September 1, 2025' },
    { instructorName: 'Prof. Bob Wilson', termYear: 'Fall 2025', termBeginEndDate: 'September 1, 2025' },
  ];

  const activeClasses = [
    { instructorName: 'Dr. Emma Davis', termYear: 'Spring 2025', termBeginEndDate: 'January 15, 2025' },
    { instructorName: 'Prof. Michael Lee', termYear: 'Spring 2025', termBeginEndDate: 'January 15, 2025' },
    { instructorName: 'Dr. Sarah Kim', termYear: 'Spring 2025', termBeginEndDate: 'January 15, 2025' },
    { instructorName: 'Prof. David Chen', termYear: 'Spring 2025', termBeginEndDate: 'January 15, 2025' },
  ];

  const expiredClasses = [
    { instructorName: 'Dr. Laura Adams', termYear: 'Fall 2024', termBeginEndDate: 'September 1, 2024' },
    { instructorName: 'Prof. Mark Taylor', termYear: 'Fall 2024', termBeginEndDate: 'September 1, 2024' },
    { instructorName: 'Dr. Emily White', termYear: 'Fall 2024', termBeginEndDate: 'September 1, 2024' },
    { instructorName: 'Prof. James Green', termYear: 'Fall 2024', termBeginEndDate: 'September 1, 2024' },
  ];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <section className="section">
        <h2 className="section-title">Enrolled Classes</h2>
        <div className="card-grid">
          {enrolledClasses.map((course, index) => (
            <Classroomwidget
              key={`enrolled-${index}`}
              imageSrc={undefined}
              instructorName={course.instructorName}
              termYear={course.termYear}
              termBeginEndDate={course.termBeginEndDate}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Active Classes</h2>
        <div className="card-grid">
          {activeClasses.map((course, index) => (
            <Classroomwidget
              key={`active-${index}`}
              imageSrc={undefined}
              instructorName={course.instructorName}
              termYear={course.termYear}
              termBeginEndDate={course.termBeginEndDate}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Expired Classes</h2>
        <div className="card-grid">
          {expiredClasses.map((course, index) => (
            <Classroomwidget
              key={`expired-${index}`}
              imageSrc={undefined}
              instructorName={course.instructorName}
              termYear={course.termYear}
              termBeginEndDate={course.termBeginEndDate}
            />
          ))}
        </div>
      </section>
  </StrictMode>,
)