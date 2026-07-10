export default function PracticalActivity({ activity }) {
  return (
    <details className="standards-alignment">
      <summary>
        {activity.title} <span className="field-hint">· About {activity.estimatedMinutes} min</span>
      </summary>

      <div>
        {activity.safetyNotes?.length > 0 && (
          <div className="callout callout-warning">
            <strong>Safety notes</strong>
            <ul>
              {activity.safetyNotes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        )}

        {activity.materials?.length > 0 && (
          <section>
            <h3>Materials</h3>
            <ul>{activity.materials.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        <section>
          <h3>Instructions</h3>
          <ol>{activity.instructions.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>

        {activity.checklist?.length > 0 && (
          <section>
            <h3>Student checklist</h3>
            <ul>
              {activity.checklist.map((item) => (
                <li key={item}><span aria-hidden="true">☐</span> {item}</li>
              ))}
            </ul>
          </section>
        )}

        {activity.writtenResponse && (
          <section>
            <h3>Written response</h3>
            <p>{activity.writtenResponse}</p>
          </section>
        )}

        {activity.rubric?.length > 0 && (
          <section>
            <h3>Teacher rubric</h3>
            <table>
              <thead><tr><th>Criterion</th><th>Proficient evidence</th></tr></thead>
              <tbody>
                {activity.rubric.map((row) => (
                  <tr key={row.criterion}><td>{row.criterion}</td><td>{row.proficient}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="field-hint">
          Completion: {activity.completionMethod.replaceAll('-', ' ')}
          {activity.teacherVerification ? ' · Teacher verification required' : ''}
        </p>
      </div>
    </details>
  )
}
