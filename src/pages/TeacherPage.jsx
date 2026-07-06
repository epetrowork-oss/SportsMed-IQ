import { getAllUnits } from '../content/index.js'
import { useProgress, getUnitProgress, PASS_THRESHOLD } from '../lib/progress.js'
import roster from '../content/mock/students.json'

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
  if (!progress || (!progress.lessonRead && progress.quizAttempts === 0 && !progress.flashcardsReviewed)) {
    return <td className="cell-progress">Not started</td>
  }
  const parts = []
  if (progress.lessonRead) parts.push('read')
  if (progress.bestQuizScore != null)
    parts.push(`quiz ${Math.round(progress.bestQuizScore * 100)}%`)
  if (progress.flashcardsReviewed) parts.push('cards')
  return <td className="cell-progress">{parts.join(' · ') || 'Started'}</td>
}

export default function TeacherPage() {
  useProgress() // include this device's live progress in the table
  const units = getAllUnits()

  // Mock roster plus a live row for whoever is using this device,
  // so the dashboard reflects real local data too.
  const rows = [
    ...roster.students.map((s) => ({
      id: s.id,
      name: s.name,
      progressFor: (unitId) => s.progress[unitId],
    })),
    {
      id: 'local',
      name: 'You (this device)',
      progressFor: (unitId) => getUnitProgress(unitId),
    },
  ]

  return (
    <div className="page">
      <h1>Teacher dashboard</h1>
      <p className="empty-note">
        Unit completion by student. A unit is complete when the lesson is read, the
        flashcards are reviewed, and the best quiz score is at least{' '}
        {Math.round(PASS_THRESHOLD * 100)}%. Roster data is mocked until accounts exist;
        the last row is live from this device.
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                {units.map((unit) => (
                  <StatusCell key={unit.id} progress={row.progressFor(unit.id)} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
