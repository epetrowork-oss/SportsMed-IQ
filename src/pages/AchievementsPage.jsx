import { getAllUnits } from '../content/index.js'
import { getGamificationSummary } from '../lib/gamification.js'
import { localDateKey, useProgress } from '../lib/progress.js'

function formatDateKey(key) {
  if (!key) return 'No learning day recorded yet'
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AchievementsPage() {
  const progress = useProgress()
  const summary = getGamificationSummary(progress, getAllUnits(), localDateKey())
  const progressPercent = summary.nextLevelXp == null
    ? 100
    : Math.min(100, Math.round((summary.xpIntoLevel / summary.xpNeededForLevel) * 100))

  return (
    <div className="page page-narrow">
      <h1>Achievements</h1>
      <p className="unit-summary">
        Progress rewards careful learning, accurate review, consistency, and teacher-verified practice—not speed during emergency activities.
      </p>

      <section className="assignment-card" aria-labelledby="achievement-level-heading">
        <div className="assignment-card-header">
          <h2 id="achievement-level-heading">Level {summary.level.level}: {summary.level.name}</h2>
          <span className="pill pill-grade">{summary.xp} XP</span>
        </div>
        {summary.nextLevelXp == null ? (
          <p className="assignment-progress-text">Highest current level reached.</p>
        ) : (
          <>
            <div
              className="assignment-progress-bar"
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuemin={0}
              aria-valuemax={summary.xpNeededForLevel}
              aria-valuenow={summary.xpIntoLevel}
            >
              <div className="assignment-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="assignment-progress-text">
              {summary.nextLevelXp - summary.xp} XP to the next level
            </p>
          </>
        )}
      </section>

      <section>
        <h2>Learning streak</h2>
        <div className="how-it-works">
          <div className="how-it-works-card">
            <h3>{summary.currentStreak} day{summary.currentStreak === 1 ? '' : 's'}</h3>
            <p>Current streak</p>
          </div>
          <div className="how-it-works-card">
            <h3>{summary.longestStreak} day{summary.longestStreak === 1 ? '' : 's'}</h3>
            <p>Longest streak</p>
          </div>
        </div>
        <p className="field-hint">Last active: {formatDateKey(summary.lastActiveDate)}. A missed day simply starts a new streak.</p>
      </section>

      <section>
        <h2>Badges</h2>
        <div className="assignment-card-list">
          {summary.badges.map((badge) => (
            <article key={badge.id} className="assignment-card">
              <div className="assignment-card-header">
                <h3>{badge.name}</h3>
                <span className={badge.isEarned ? 'pill pill-done' : 'pill pill-grade'}>
                  {badge.isEarned ? 'Earned' : 'Locked'}
                </span>
              </div>
              <p>{badge.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
