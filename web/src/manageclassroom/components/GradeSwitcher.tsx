import { useState } from "react";
import "../css/GradeSwitcher.css"
import clsx from "clsx";

interface GradeSwitcherProps {
    onChange: (newSection: GradeSection) => void;
}

export type GradeSection = 'assignments' | 'students';

function GradeSwitcher({onChange}: GradeSwitcherProps) {

    const [section, setSection] = useState<GradeSection>('assignments');

    const changeSection = (newSection: GradeSection) => {
        setSection(newSection);
        onChange(newSection);
    }

    return (
        <div id="grade-switcher">
            <button className={clsx("grade-section-button", section === 'assignments' && "grade-section-selected")} onClick={() => changeSection('assignments')}>
                Assignments
            </button>
            <button className={clsx("grade-section-button", section === 'students' && "grade-section-selected")} onClick={() => changeSection('students')}>
                Students
            </button>
        </div>
    );
}
export default GradeSwitcher;