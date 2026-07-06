import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUnit } from '../content/index.js'
import { recordQuizResult, PASS_THRESHOLD } from '../lib/progress.js'
import NotFoundPage from './NotFoundPage.jsx'

function shuffled(n) {
  const order = [...Array(n).keys()]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// One question at a time: pick an answer, see the explanation, move on.
// Choice order is shuffled per attempt so answer positions can't be memorized.
// Score is recorded once at the end of the attempt.
export default function QuizPage() {
  const { unitId } = useParams()
  const unit = getUnit(unitId)

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null) // original choice index for current question
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  // One shuffled display order per question, regenerated each attempt.
  const [orders, setOrders] = useState(() =>
    (unit?.quiz ?? []).map((q) => shuffled(q.choices.length)),
  )

  if (!unit) return <NotFoundPage />
  const questions = unit.quiz

  function restart() {
    setIndex(0)
    setSelected(null)
    setCorrectCount(0)
    setFinished(false)
    setOrders(questions.map((q) => shuffled(q.choices.length)))
  }

  if (finished) {
    const score = questions.length > 0 ? correctCount / questions.length : 0
    const passed = score >= PASS_THRESHOLD
    return (
      <div className="page page-narrow">
        <nav className="breadcrumb">
          <Link to="/">Units</Link> / <Link to={`/unit/${unit.id}`}>{unit.title}</Link> / Quiz
        </nav>
        <h1>Quiz results</h1>
        <p className={`quiz-score ${passed ? 'quiz-score-pass' : ''}`}>
          {correctCount} / {questions.length} correct ({Math.round(score * 100)}%)
        </p>
        <p>
          {passed
            ? 'Nice work — that counts as a pass.'
            : `You need ${Math.round(PASS_THRESHOLD * 100)}% to pass. Review the lesson and try again.`}
        </p>
        <div className="unit-actions">
          <button className="button button-primary" onClick={restart}>
            Retake quiz
          </button>
          <Link className="button" to={`/unit/${unit.id}`}>
            Back to lesson
          </Link>
          <Link className="button" to={`/unit/${unit.id}/flashcards`}>
            Review flashcards
          </Link>
        </div>
      </div>
    )
  }

  const question = questions[index]
  const answered = selected !== null
  const isLast = index === questions.length - 1

  function choose(choiceIndex) {
    if (answered) return
    setSelected(choiceIndex)
    if (choiceIndex === question.answerIndex) setCorrectCount((n) => n + 1)
  }

  function next() {
    if (isLast) {
      const finalCorrect = correctCount // state already includes this question
      recordQuizResult(unit.id, finalCorrect, questions.length)
      setFinished(true)
    } else {
      setIndex(index + 1)
      setSelected(null)
    }
  }

  return (
    <div className="page page-narrow">
      <nav className="breadcrumb">
        <Link to="/">Units</Link> / <Link to={`/unit/${unit.id}`}>{unit.title}</Link> / Quiz
      </nav>
      <p className="quiz-progress">
        Question {index + 1} of {questions.length}
      </p>
      <h1 className="quiz-question">{question.question}</h1>
      <div className="quiz-choices">
        {orders[index].map((choiceIndex) => {
          let cls = 'quiz-choice'
          if (answered) {
            if (choiceIndex === question.answerIndex) cls += ' quiz-choice-correct'
            else if (choiceIndex === selected) cls += ' quiz-choice-wrong'
          }
          return (
            <button
              key={choiceIndex}
              className={cls}
              onClick={() => choose(choiceIndex)}
              disabled={answered}
            >
              {question.choices[choiceIndex]}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="quiz-feedback">
          <p>
            <strong>{selected === question.answerIndex ? 'Correct.' : 'Not quite.'}</strong>{' '}
            {question.explanation}
          </p>
          <button className="button button-primary" onClick={next}>
            {isLast ? 'See results' : 'Next question →'}
          </button>
        </div>
      )}
    </div>
  )
}
