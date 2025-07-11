import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import ClassroomWidget from '../components/classroom-widget/Classroomwidget'
import './dashboard.css'

  const enrolledClasses = [
    {className: "Operating Systems and Concurrent Programming.", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
  ];

  const activeClasses = [
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
  ];

  const expiredClasses = [
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
    {className: "Computer science", courseCode: "MCS101", startDate: "1-1-2024", endDate: "5-12-2024"},
  ];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <section className="section">
        <h2 className="section-title">Enrolled Classes</h2>
        <div className="card-grid">
          {enrolledClasses.map((course, index) => (
            <ClassroomWidget
              key={`enrolled-${index}`}
              {...course}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Active Classes</h2>
        <div className="card-grid">
          {activeClasses.map((course, index) => (
            <ClassroomWidget
              key={`active-${index}`}
              {...course}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Expired Classes</h2>
        <div className="card-grid">
          {expiredClasses.map((course, index) => (
            <ClassroomWidget
              key={`expired-${index}`}
              {...course}
            />
          ))}
        </div>
      </section>
  </StrictMode>,
)