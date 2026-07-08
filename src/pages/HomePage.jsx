import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllUnits, getUnitsByCategory } from '../content/index.js'
import { useProgress, getUnitProgress, isUnitComplete } from '../lib/progress.js'
import { isComplete } from '../lib/status.js'
import StatusIcon from '../components/StatusIcon.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// Shared with scripts/list-image-slots.mjs, which reconstructs these same
// slots from the content JSON to build the image author's shot list.
function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const GRADE_BAND_KEY = 'sportmediq:gradeBand'
const GRADE_BANDS = [
  { id: 'all', label: 'All grades' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

function GradeBandLabel({ gradeBand }) {
  const band = GRADE_BANDS.find((b) => b.id === gradeBand)
  if (!band) return null
  return <span className="pill pill-grade">{band.label} grade</span>
}

// "started" = touched in some way but not (yet) complete. Same rule used by
// StatusIcon/status.js's statusInfo().
function isUnitStarted(p) {
  return !!p && (p.lessonRead || p.quizAttempts > 0 || p.flashcardsReviewed || p.readSeconds > 0)
}

// Short "read · quiz 60% · cards pending" style summary for the continue card.
function progressSummary(p) {
  const parts = [p.lessonRead ? 'read' : 'lesson pending']
  parts.push(p.quizAttempts > 0 ? `quiz ${Math.round((p.bestQuizScore ?? 0) * 100)}%` : 'quiz pending')
  parts.push(p.flashcardsReviewed ? 'cards done' : 'cards pending')
  return parts.join(' · ')
}

// Most recently touched unit that's been started but isn't complete yet.
// Ignores grade-band/search filters — personal progress trumps filters.
function findContinueUnit() {
  const candidates = getAllUnits().filter((unit) => {
    const p = getUnitProgress(unit.id)
    return isUnitStarted(p) && !isComplete(p)
  })
  if (candidates.length === 0) return null
  // getAllUnits() is already sorted in the app's canonical order, so when
  // every candidate has touchedAt === 0 (e.g. progress imported from an
  // older sync code) this naturally falls back to the first one.
  return candidates.reduce((best, unit) =>
    getUnitProgress(unit.id).touchedAt > getUnitProgress(best.id).touchedAt ? unit : best
  )
}

function ContinueCard({ unit }) {
  const p = getUnitProgress(unit.id)
  return (
    <Link to={`/unit/${unit.id}`} className="continue-card">
      <span className="continue-kicker">Continue where you left off</span>
      <h2 className="continue-title">{unit.title}</h2>
      <div className="continue-meta">
        <GradeBandLabel gradeBand={unit.gradeBand} />
        <StatusIcon progress={p} />
      </div>
      <p className="continue-summary">{progressSummary(p)}</p>
    </Link>
  )
}

function unitMatchesSearch(unit, term) {
  if (!term) return true
  const haystack = [unit.title, unit.summary, unit.category, unit.strand]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

function UnitCard({ unit, showGradeBand }) {
  const p = getUnitProgress(unit.id)
  const complete = isUnitComplete(unit.id)
  const strand = unit.strand ?? unit.id

  return (
    <Link to={`/unit/${unit.id}`} className="unit-card">
      <div className="unit-card-thumb">
        <ImagePlaceholder
          asset={`unit-${strand}-hero.webp`}
          purpose="unit card thumbnail"
          ratio="3:2"
          background="white"
          description={`Illustrative thumbnail for ${unit.title}: ${unit.summary}`}
          location={`public/images/units/${strand}/`}
          alt={`Thumbnail illustration for ${unit.title}`}
        />
      </div>
      <div className="unit-card-top">
        <h3>{unit.title}</h3>
        {complete ? (
          <span className="pill pill-done">
            <span aria-hidden="true">✓</span> Complete
          </span>
        ) : p.lessonRead || p.quizAttempts > 0 || p.flashcardsReviewed ? (
          <span className="pill pill-progress">
            <span aria-hidden="true">●</span> In progress
          </span>
        ) : null}
      </div>
      <p className="unit-summary">{unit.summary}</p>
      <div className="unit-meta">
        <span>{unit.minutes ? `~${unit.minutes} min` : ''}</span>
        <span>
          {unit.quiz.length} quiz questions · {unit.flashcards.length} flashcards
        </span>
      </div>
      {showGradeBand && <GradeBandLabel gradeBand={unit.gradeBand} />}
    </Link>
  )
}

export default function HomePage() {
  useProgress() // re-render when progress changes
  const [gradeBand, setGradeBand] = useState(() => {
    try {
      return localStorage.getItem(GRADE_BAND_KEY) || 'all'
    } catch {
      return 'all'
    }
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(GRADE_BAND_KEY, gradeBand)
    } catch {
      // Storage full or blocked — filter still works for this session.
    }
  }, [gradeBand])

  const continueUnit = findContinueUnit()
  const searchTerm = search.trim().toLowerCase()
  const totalUnits = getAllUnits().length

  const groups = getUnitsByCategory()
    .map(({ category, units }) => ({
      category,
      units: units.filter(
        (u) => (gradeBand === 'all' || u.gradeBand === gradeBand) && unitMatchesSearch(u, searchTerm)
      ),
    }))
    .filter((g) => g.units.length > 0)

  const matchedCount = groups.reduce((sum, g) => sum + g.units.length, 0)

  return (
    <div className="page">
      <section className="home-hero">
        <div className="home-hero-text">
          <h1>Welcome to SportMedIQ</h1>
          <p className="home-hero-tagline">Learn sports medicine skills, one lesson at a time.</p>
        </div>
        <div className="home-hero-image">
          <ImagePlaceholder
            asset="home-hero.webp"
            purpose="home hero image"
            ratio="21:9"
            background="white"
            description="A student athletic trainer taping an ankle on the sideline, first-aid kit open nearby — welcoming, hands-on scene that sets the tone for the app."
            location="public/images/home/"
            alt="A student athletic trainer taping an athlete's ankle on the sideline"
          />
        </div>
        {continueUnit && <ContinueCard unit={continueUnit} />}
      </section>
      <div className="home-filters">
        <div className="grade-band-picker" role="group" aria-label="Filter by grade">
          {GRADE_BANDS.map((band) => (
            <button
              key={band.id}
              className={gradeBand === band.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'}
              onClick={() => setGradeBand(band.id)}
              aria-pressed={gradeBand === band.id}
            >
              {band.label}
            </button>
          ))}
        </div>
        <div className="search-field">
          <label htmlFor="unit-search" className="sr-only">
            Search units
          </label>
          <input
            id="unit-search"
            type="search"
            className="search-input"
            placeholder="Search units…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {searchTerm && matchedCount > 0 && (
        <p className="search-count">
          {matchedCount} of {totalUnits} units
        </p>
      )}
      {groups.length === 0 && (
        <p className="empty-note">
          {searchTerm
            ? <>No units match &ldquo;{search.trim()}&rdquo;.</>
            : gradeBand === 'all'
            ? <>No units yet. Add a JSON file to <code>src/content/units/</code> to create one.</>
            : `No units yet for ${GRADE_BANDS.find((b) => b.id === gradeBand)?.label} grade.`}
        </p>
      )}
      {groups.map(({ category, units }) => (
        <section key={category} className="category-group">
          <div className="category-heading">
            <div className="category-icon-slot">
              <ImagePlaceholder
                asset={`category-${slugify(category)}.webp`}
                purpose="category icon"
                ratio="1:1"
                background="transparent"
                description={`Simple flat icon representing ${category}`}
                location="public/images/categories/"
                alt={`${category} icon`}
              />
            </div>
            <h2>{category}</h2>
          </div>
          <div className="unit-grid">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} showGradeBand={gradeBand === 'all'} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
