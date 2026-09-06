import { nextLearningStep } from '../lib/learningPath.js'
import LearningSteps from '../components/LearningSteps.jsx'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUnit, getStandardsForUnit } from '../content/index.js'
import { getActivitiesForUnit } from '../content/activities.js'
import {
  useProgress,
  getUnitProgress,
  markLessonRead,
  addReadingTime,
  recordScrollDepth,
} from '../lib/progress.js'
import { printLessonPacket, printPracticalPacket } from '../lib/print.js'
import { useClassControls, isUnitVisible } from '../lib/studentSession.js'
import NotFoundPage from './NotFoundPage.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import PracticalActivity from '../components/PracticalActivity.jsx'

// Accumulate reading time while the lesson is open AND the tab is visible.
// Each delta is capped so a laptop waking from sleep cannot credit hours.
const FLUSH_MS = 5000
const MAX_DELTA_S = 30

function useReadingTimer(unitId) {
  useEffect(() => {
    if (!unitId) return
    let last = Date.now()
    const credit = () => {
      const now = Date.now()
      addReadingTime(unitId, Math.min((now - last) / 1000, MAX_DELTA_S))
      last = now
    }
    const tick = () => {
      if (document.visibilityState === 'visible') credit()
      else last = Date.now()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') credit()
      else last = Date.now()
    }
    const interval = setInterval(tick, FLUSH_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (document.visibilityState === 'visible') credit()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [unitId])
}

function formatReadTime(seconds) {
  if (!seconds || seconds < 60) return seconds > 0 ? 'under 1 min' : null
  return `${Math.round(seconds / 60)} min`
}

// Track the deepest point of the lesson the student has scrolled to. Measure
// on scroll, but persist only every couple of seconds so scrolling does not
// trigger store writes and React updates on every event.
function useScrollDepth(unitId) {
  useEffect(() => {
    if (!unitId) return
    let maxPct = 0
    let savedPct = 0
    const measure = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      const pct =
        scrollable <= 0 ? 100 : Math.min(100, ((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100)
      if (pct > maxPct) maxPct = pct
    }
    const flush = () => {
      if (maxPct > savedPct) {
        recordScrollDepth(unitId, maxPct)
        savedPct = maxPct
      }
    }
    measure()
    const interval = setInterval(flush, 2000)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      measure()
      flush()
      clearInterval(interval)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [unitId])
}

function Callout({ callout }) {
  return (
    <div className={`callout callout-${callout.type ?? 'tip'}`}>
      {callout.title && <strong>{callout.title}</strong>}
      <p>{callout.text}</p>
    </div>
  )
}

function Sources({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null
  return (
    <details className="sources-list">
      <summary>Sources</summary>
      <ul className="sources-items">
        {sources.map((s, i) => (
          <li key={i} className="sources-item">
            <span className="sources-title">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
            </span>
            <span className="sources-meta">
              {[s.publisher, s.year].filter(Boolean).join(' · ')}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}

function StandardsAlignment({ standards }) {
  if (standards.length === 0) return null
  const hasDraft = standards.some((s) => !s.verified)
  return (
    <details className="standards-alignment">
      <summary>Standards alignment</summary>
      <ul className="standards-list">
        {standards.map((s) => (
          <li key={s.id} className="standards-item">
            <span className="standards-code">
              {s.framework.shortName} {s.officialCode}
            </span>
            {!s.verified && <span className="pill pill-draft">draft</span>}
            <p className="standards-text">{s.text}</p>
          </li>
        ))}
      </ul>
      {hasDraft && (
        <p className="standards-footnote">
          Draft alignments — pending verification against the official CDE documents.
        </p>
      )}
    </details>
  )
}

function PracticalActivities({ activities }) {
  if (activities.length === 0) return null
  return (
    <section className="practical-activities" aria-labelledby="practical-activities-heading">
      <h2 id="practical-activities-heading">Practical activities</h2>
      <p className="field-hint">Practice the lesson in a teacher-supervised simulation.</p>
      {activities.map((activity) => (
        <PracticalActivity key={activity.id} activity={activity} />
      ))}
    </section>
  )
}

export default function UnitPage() {
  const { unitId } = useParams()
  useProgress()
  const controls = useClassControls()
  const [printMessage, setPrintMessage] = useState('')
  const unit = getUnit(unitId)
  const visible = !unit || isUnitVisible(unit.id, controls)
  useReadingTimer(unit && visible ? unit.id : null)
  useScrollDepth(unit && visible ? unit.id : null)
  if (!unit) return <NotFoundPage />

  if (controls && !isUnitVisible(unit.id, controls)) {
    return (
      <div className="page page-narrow gated-unavailable">
        <h1>This lesson isn't open yet</h1>
        <p>Your teacher hasn't unlocked it for your class yet.</p>
        <Link className="button" to="/lessons">
          Back to Library
        </Link>
      </div>
    )
  }

  const p = getUnitProgress(unit.id)
  const nextStep = nextLearningStep(unit.id, p, controls)
  const standards = getStandardsForUnit(unit)
  const activities = getActivitiesForUnit(unit)

  function printLesson() {
    setPrintMessage(printLessonPacket(unit, standards) ? 'Lesson print preview opened.' : 'Print preview was blocked. Allow pop-ups for this app and try again.')
  }

  function printActivities() {
    setPrintMessage(printPracticalPacket(unit, activities) ? 'Activity packet print preview opened.' : 'Print preview was blocked. Allow pop-ups for this app and try again.')
  }

  return (
    <div className="page page-narrow">
      <nav className="breadcrumb">
        <Link to="/lessons">Library</Link> / {unit.title}
      </nav>
      <h1>{unit.title}</h1>
      <p className="unit-summary">{unit.summary}</p>

      <LearningSteps unitId={unit.id} current="read" />
      <div className="lesson-tools">
        <span className="field-hint">{unit.minutes ? `About ${unit.minutes} minutes · ` : ''}{unit.sections.length} sections</span>
        <details className="print-menu"><summary>Print & resources</summary><div className="unit-actions">
          <button className="button" type="button" onClick={printLesson}>Print lesson</button>
          {activities.length > 0 && <button className="button" type="button" onClick={printActivities}>Print activity packet</button>}
        </div></details>
      </div>
      <details className="lesson-contents"><summary>In this lesson</summary><nav aria-label="Lesson sections">{unit.sections.map((section, i) => section.heading && <button className="contents-link" key={i} onClick={() => { const target = document.getElementById(`lesson-section-${i}`); target?.scrollIntoView({ behavior: 'instant', block: 'start' }); target?.focus({ preventScroll: true }) }}>{String(i + 1).padStart(2, '0')} · {section.heading}</button>)}</nav></details>
      {printMessage && <p className="field-hint" role="status">{printMessage}</p>}

      <article className="lesson">
        {unit.sections.map((section, i) => (
          <section key={i} id={`lesson-section-${i}`} tabIndex={-1}>
            {section.heading && <h2>{section.heading}</h2>}
            {(section.body ?? []).map((paragraph, j) => (
              <p key={j}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
            {section.callout && <Callout callout={section.callout} />}
            {section.image && (
              <div className="lesson-image">
                <ImagePlaceholder
                  asset={section.image.asset}
                  purpose="lesson diagram"
                  ratio={section.image.ratio}
                  background={section.image.background}
                  description={section.image.description}
                  location={section.image.location}
                  alt={section.image.alt}
                />
              </div>
            )}
          </section>
        ))}
      </article>

      <PracticalActivities activities={activities} />
      <StandardsAlignment standards={standards} />
      <Sources sources={unit.sources} />

      <div className="lesson-footer">
        {formatReadTime(p.readSeconds) && (
          <p className="read-time-note">
            Reading time: {formatReadTime(p.readSeconds)}
            {p.scrollPct > 0 && ` · ${p.scrollPct}% of lesson seen`}
          </p>
        )}
        {p.lessonRead ? (
          <p className="done-note">✓ Marked as read</p>
        ) : (
          <button className="button button-primary" onClick={() => markLessonRead(unit.id)}>
            I've read this lesson
          </button>
        )}
        {p.lessonRead && <>
          {nextStep.stage === 'waiting' && <p className="field-hint">Your quiz will open when your teacher updates class access.</p>}
          <Link className="button button-primary" to={nextStep.to}>{nextStep.label} →</Link>
        </>}
      </div>
    </div>
  )
}
