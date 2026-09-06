import { useEffect, useState } from 'react'
import {
  useProgress,
  useAssignments,
  setStudentName,
  mergeProgress,
  importAssignment,
  removeAssignment,
} from '../lib/progress.js'
import { encodeProgress, decodeProgressCode } from '../lib/share.js'
import { decodeAssignment } from '../lib/assignments.js'
import { useStudentSession } from '../lib/studentSession.js'
import { getUnit } from '../content/index.js'

function formatDueDate(due) {
  // due is "YYYY-MM-DD"; parse as local date, not UTC midnight, so it never
  // displays a day early/late depending on timezone.
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function SyncPage() {
  const { name, units, gamification } = useProgress()
  const assignments = useAssignments()
  const { session, controls } = useStudentSession()
  const [task, setTask] = useState('share')
  const [copyError, setCopyError] = useState('')
  const [copied, setCopied] = useState(false)
  const [pasted, setPasted] = useState('')
  const [importResult, setImportResult] = useState(null) // { ok, message }
  const [code, setCode] = useState('')
  const [classPasted, setClassPasted] = useState('')
  const [classImportResult, setClassImportResult] = useState(null) // { ok, message }
  const [confirmRemove, setConfirmRemove] = useState(null) // assignment name pending confirmation

  useEffect(() => {
    let cancelled = false
    const ids = session ? { sid: session.sid, cid: session.cid } : null
    encodeProgress(name, units, gamification, ids).then((c) => {
      if (!cancelled) setCode(c)
    })
    return () => {
      cancelled = true
    }
  }, [name, units, gamification, session])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setCopyError('')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('Automatic copying is unavailable. Select the code below and copy it manually.')
    }
  }

  async function importCode() {
    try {
      const {
        name: importedName,
        units: importedUnits,
        gamification: importedGamification,
      } = await decodeProgressCode(pasted)
      mergeProgress(importedName, importedUnits, importedGamification)
      const unitCount = Object.keys(importedUnits).length
      const known = Object.keys(importedUnits).filter((id) => getUnit(id)).length
      setImportResult({
        ok: true,
        message: `Loaded progress for ${unitCount} unit${unitCount === 1 ? '' : 's'}${
          known < unitCount ? ` (${unitCount - known} not in this app version yet)` : ''
        }. Your existing progress was kept — the best of both counts.`,
      })
      setPasted('')
    } catch (err) {
      setImportResult({ ok: false, message: err.message })
    }
  }

  async function importClassCode() {
    try {
      const assignment = await decodeAssignment(classPasted)
      importAssignment(assignment)
      const titles = assignment.unitIds.map((id) => getUnit(id)?.title).filter(Boolean)
      const parts = [
        `${titles.length} lesson${titles.length === 1 ? '' : 's'}`,
        assignment.mode === 'focus' ? 'focus mode' : 'open mode',
      ]
      if (assignment.due) parts.push(`due ${formatDueDate(assignment.due)}`)
      setClassImportResult({
        ok: true,
        message: `Imported "${assignment.name}" — ${parts.join(', ')}. Lessons: ${titles.join(', ')}.`,
      })
      setClassPasted('')
    } catch (err) {
      setClassImportResult({ ok: false, message: err.message })
    }
  }

  return (
    <div className="page page-narrow">
      <span className="kicker">SAVE & SHARE</span><h1>Share your learning</h1>
      <p className="unit-summary">Your work saves on this device. Choose what you want to do next.</p>
      <nav className="workspace-nav" aria-label="Sharing tasks">
        <button className={task === 'share' ? 'active' : ''} aria-current={task === 'share' ? 'page' : undefined} onClick={() => setTask('share')}>Share with teacher</button>
        <button className={task === 'move' ? 'active' : ''} aria-current={task === 'move' ? 'page' : undefined} onClick={() => setTask('move')}>Move progress</button>
        {controls?.assignments !== false && <button className={task === 'assignment' ? 'active' : ''} aria-current={task === 'assignment' ? 'page' : undefined} onClick={() => setTask('assignment')}>Add assignment</button>}
      </nav>
      {task !== 'assignment' && <div className="workspace-panel">
      <section>
        <h2>Your name</h2>
        <input
          className="text-input"
          type="text"
          placeholder="First and last name"
          value={name}
          onChange={(e) => setStudentName(e.target.value)}
          aria-label="Your name"
        />
        {!name && (
          <p className="field-hint">
            Add your name so your teacher knows whose progress this is.
          </p>
        )}
        {session && (
          <p className="field-hint sync-session-hint">
            Your code includes your class identity so your teacher can match your work.
          </p>
        )}
      </section>

      <section>
        <h2>{task === 'share' ? 'Send your progress to your teacher' : 'Copy from this device'}</h2>
        <p>{task === 'share' ? 'Copy your code and send it using your teacher’s preferred method. Your teacher then imports it into their roster.' : 'Copy this code. On your other device, sign in as yourself, open Share → Move progress, and paste it below.'}</p>
        <textarea aria-label="Your progress code" className="code-box" readOnly value={code} rows={4} onFocus={(e) => e.target.select()} />
        <div className="unit-actions">
          <button className="button button-primary" onClick={copyCode} disabled={!code}>
            {copied ? '✓ Code copied' : 'Copy progress code'}
          </button>
        </div>
        <p className="field-hint">
          Copying a code does not send it. Your teacher’s report updates after they import it.
        </p>
      </section>

      {copyError && <p role="status" className="import-error">{copyError}</p>}
      {copied && <p role="status" className="import-ok">Code copied. Ready to paste.</p>}
      {task === 'move' && <section>
        <h2>Load progress on this device</h2>
        <textarea
          className="code-box"
          aria-label="Progress code from another device"
          placeholder="Paste your progress code here"
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value)
            setImportResult(null)
          }}
          rows={4}
        />
        <div className="unit-actions">
          <button className="button button-primary" onClick={importCode} disabled={!pasted.trim()}>
            Load progress
          </button>
        </div>
        {importResult && (
          <p className={importResult.ok ? 'import-ok' : 'import-error'} role="status">
            {importResult.message}
          </p>
        )}
      </section>}

      </div>}
      {task === 'assignment' && controls?.assignments !== false && (
      <section>
        <h2>Add an assignment</h2>
        <p className="field-hint">
          Paste the assignment code from your teacher to add your lessons and due date. To join a class, use Student sign-in.
        </p>
        <textarea
          className="code-box"
          aria-label="Assignment code"
          placeholder="Paste your assignment code here"
          value={classPasted}
          onChange={(e) => {
            setClassPasted(e.target.value)
            setClassImportResult(null)
          }}
          rows={4}
        />
        <div className="unit-actions">
          <button
            className="button button-primary"
            onClick={importClassCode}
            disabled={!classPasted.trim()}
          >
            Add assignment
          </button>
        </div>
        {classImportResult && (
          <p className={classImportResult.ok ? 'import-ok' : 'import-error'} role="status">
            {classImportResult.message}
          </p>
        )}

        {assignments.length > 0 && (
          <div className="assignment-list">
            <h3>Your assignments</h3>
            {assignments.map((a) => {
              const titles = a.unitIds.map((id) => getUnit(id)?.title).filter(Boolean)
              return (
                <div key={a.name} className="assignment-item">
                  <div className="assignment-item-main">
                    <strong>{a.name}</strong>
                    <span className="field-hint">
                      {titles.length} lesson{titles.length === 1 ? '' : 's'} &middot;{' '}
                      {a.mode === 'focus' ? 'Focus mode' : 'Open mode'}
                      {a.due ? ` · Due ${formatDueDate(a.due)}` : ''}
                    </span>
                    <span className="field-hint">{titles.join(', ')}</span>
                  </div>
                  {confirmRemove === a.name ? (
                    <span className="unit-actions">
                      <button
                        className="button button-danger"
                        onClick={() => {
                          removeAssignment(a.name)
                          setConfirmRemove(null)
                        }}
                      >
                        Confirm remove
                      </button>
                      <button className="button" onClick={() => setConfirmRemove(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className="remove-button"
                      onClick={() => setConfirmRemove(a.name)}
                      aria-label={`Remove ${a.name}`}
                      title={`Remove ${a.name}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
      )}
    </div>
  )
}
