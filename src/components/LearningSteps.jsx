import { Link } from 'react-router-dom'
import { getUnitProgress, PASS_THRESHOLD, useProgress } from '../lib/progress.js'
import { useClassControls } from '../lib/studentSession.js'

export default function LearningSteps({ unitId, current }) {
  useProgress()
  const p = getUnitProgress(unitId)
  const controls = useClassControls()
  const steps = [
    { id: 'read', label: 'Read lesson', to: `/unit/${unitId}`, done: p.lessonRead },
    { id: 'quiz', label: 'Take quiz', to: `/unit/${unitId}/quiz`, done: (p.bestQuizScore ?? 0) >= PASS_THRESHOLD, locked: controls?.quizzes === false },
    { id: 'cards', label: 'Review cards', to: `/unit/${unitId}/flashcards`, done: p.flashcardsReviewed },
  ]
  return <nav className="learning-steps" aria-label="Lesson progress">
    {steps.map((s, i) => s.locked ? <span key={s.id} className="learning-step step-locked">{i + 1}. Quiz opens later</span> :
      <Link key={s.id} to={s.to} className={`learning-step ${current === s.id ? 'step-current' : ''} ${s.done ? 'step-done' : ''}`} aria-current={current === s.id ? 'step' : undefined}>
        <span className="step-number" aria-hidden="true">{s.done ? '✓' : i + 1}</span><span>{s.label}<small>{s.done ? 'Complete' : current === s.id ? 'You are here' : 'Up next'}</small></span>
      </Link>)}
  </nav>
}
