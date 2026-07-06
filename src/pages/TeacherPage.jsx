import { useState } from 'react'
import { getAllUnits } from '../content/index.js'
import { useProgress, getUnitProgress, PASS_THRESHOLD } from '../lib/progress.js'
import { useRoster, addStudentFromCode, removeStudent } from '../lib/roster.js'
import mockRoster from '../content/mock/students.json'

// Same completion rule as the student side.
function isComplete(p) {
  return (
    !!p &&
    p.lessonRead &&
    p.flashcardsReviewed &&
    (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
  )
}

function StatusCell({ progress }) {
  if (isComplete(progress)) {
    return <td className="cell-done">✓ Complete</td>
  }
  if (!progress || (!progress.lessonRead && !progress.quizAttempts && !progress.flashcardsReviewed)) {
    return <td className="cell-progress">Not started</td>
  }
  const parts = []
  if (progress.lessonRead) parts.push('read')
  if (progress.bestQuizScore != null)
    parts.push(`quiz ${Math.round(progress.bestQuizScore * 100)}%`)
  if (progress.flashcardsReviewed) parts.push('cards')
  return <td className="cell-progress">{parts.join(' · ') || 'Started'}</td>
}

function AddStudentForm() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  function add() {
    try {
      const student = addStudentFromCode(code)
      setResult({ ok: true, message: `Added ${student.name}.` })
      setCode('')
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section className="add-student">
      <h2>Add a student</h2>
      <p className="field-hint">
        Paste the progress code from the student's Sync page. Pasting a newer code for the
        same name updates their row.
      </p>
      <textarea
        className="code-box"
        placeholder="Paste a student's progress code (starts with SMIQ1.)"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
          setResult(null)
        }}
        rows={3}
      />
      <div className="unit-actions">
        <button className="button button-primary" onClick={add} disabled={!code.trim()}>
          Add student
        </button>
      </div>
      {result && (
        <p className={result.ok ? 'import-ok' : 'import-error'} role="status">
          {result.message}
        </p>
      )}
    </section>
  )
}

export default function TeacherPage() {
  useProgress() // include this device's live progress in the table
  const { students } = useRoster()
  const units = getAllUnits()
  const usingMock = students.length === 0

  // Real students imported by code; the mock roster only appears until the
  // first real student is added. The last row is always live from this device.
  const rows = [
    ...(usingMock
      ? mockRoster.students.map((s) => ({
          id: s.id,
          name: s.name,
          removable: false,
          progressFor: (unitId) => s.progress[unitId],
        }))
      : students.map((s) => ({
          id: s.id,
          name: s.name,
          removable: true,
          progressFor: (unitId) => s.progress[unitId],
        }))),
    {
      id: 'local',
      name: 'You (this device)',
      removable: false,
      progressFor: (unitId) => getUnitProgress(unitId),
    },
  ]

  return (
    <div className="page">
      <h1>Teacher dashboard</h1>
      <p className="empty-note">
        A unit is complete when the lesson is read, the flashcards are reviewed, and the best
        quiz score is at least {Math.round(PASS_THRESHOLD * 100)}%.
        {usingMock &&
          ' Showing sample students — add a real student below and the samples disappear.'}
      </p>

      {units.map((unit) => {
        const completed = rows.filter((r) => isComplete(r.progressFor(unit.id))).length
        return (
          <p key={unit.id} className="empty-note">
            <strong>{unit.title}:</strong> {completed} of {rows.length} students complete
          </p>
        )
      })}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {units.map((unit) => (
                <th key={unit.id}>{unit.title}</th>
              ))}
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                {units.map((unit) => (
                  <StatusCell key={unit.id} progress={row.progressFor(unit.id)} />
                ))}
                <td>
                  {row.removable && (
                    <button
                      className="remove-button"
                      onClick={() => removeStudent(row.id)}
                      aria-label={`Remove ${row.name}`}
                      title={`Remove ${row.name}`}
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddStudentForm />
    </div>
  )
}
