import ClassroomWidget from "../components/classroom-widget/ClassroomWidget";

function DashboardSection({classes, title}: {classes: any[], title: string}) {
    return <>
        {classes.length > 0 ?
        <section className="section">
            <h2 className="section-title">{title}</h2>
            <div className="card-grid">
            {...classes.map((course: any, index) => (
                <ClassroomWidget
                key={`enrolled-${index}`}
                {...course}
                />
            ))}
            </div>
        </section>
        : <></>}
    </>
}
export default DashboardSection;