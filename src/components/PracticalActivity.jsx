import { useEffect, useState } from 'react'
import {
  getPracticalProgress,
  markPracticalReadyForReview,
  savePracticalReflection,
  useProgress,
} from '../lib/progress.js'

function statusInfo(progress) {
  if (progress.teacherVerified) return { label: 'Teacher verified', className: 'pill pill-done' }
  if (progress.readyForReview) return { label: 'Awaiting teacher review', className: 'pill pill-progress' }
  if (progress.reflectionCompleted) return { label: 'Reflection saved', className: 'pill pill-grade' }
  return { label: 'Not started', className: 'pill pill-grade' }
}

export default function PracticalActivity({ activity }) {
  useProgress()
  const saved = getPracticalProgress(activity.id)
  const [reflection, setReflection] = useState(saved.reflection)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setReflection(saved.reflection)
  }, [activity.id, saved.updatedAt, saved.reflection])

  const status = statusInfo(saved)

  function saveReflection() {
    savePracticalReflection(activity.id, reflection)
    setMessage(reflection.trim() ? 'Reflection saved on this device.' : 'Blank reflection cleared.')
  }

  function readyForReview() {
    const savedReady = markPracticalReadyForReview(activity.id)
    setMessage(savedReady ? 'Marked ready for teacher review.' : 'Save a written reflection before requesting review.')
  }

  return (
    <details className="standards-alignment">
      <summary>
        {activity.title} <span className="field-hint">· About {activity.estimatedMinutes} min</span>{' '}
        <span className={status.className}>{status.label}</span>
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
            <label htmlFor={`practical-reflection-${activity.id}`} className="field-hint">
              Your reflection
            </label>
            <textarea
              id={`practical-reflection-${activity.id}`}
              className="code-box"
              rows={6}
              maxLength={4000}
              value={reflection}
              onChange={(event) => {
                setReflection(event.target.value)
                setMessage('')
              }}
              placeholder="Write your response here. It stays on this device until you export your progress code."
            />
            <div className="unit-actions">
              <button className="button" type="button" onClick={saveReflection}>Save reflection</button>
              {activity.teacherVerification && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={readyForReview}
                  disabled={!saved.reflectionCompleted || saved.readyForReview || saved.teacherVerified}
                >
                  {saved.teacherVerified ? 'Teacher verified' : saved.readyForReview ? 'Ready for review' : 'Ready for teacher review'}
                </button>
              )}
            </div>
            {message && <p className="field-hint" role="status">{message}</p>}
            {activity.teacherVerification && (
              <p className="field-hint">
                Only a teacher-controlled workflow can mark this activity verified. Saving or submitting a reflection does not certify clinical skill.
              </p>
            )}
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
