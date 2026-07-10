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
  const [copied, setCopied] = useState(false)
  const [pasted, setPasted] = useState('')
  const [importResult, setImportResult] = useState(null) // { ok, message }
  const [code, setCode] = useState('')
  const [classPasted, setClassPasted] = useState('')
  const [classImportResult, setClassImportResult] = useState(null) // { ok, message }
  const [confirmRemove, setConfirmRemove] = useState(null) // assignment name pending confirmation

  useEffect(() => {
    let cancelled = false
    encodeProgress(name, units, gamification).then((c) => {
      if (!cancelled) setCode(c)
    })
    return () => {
      cancelled = true
    }
  }, [name, units, gamification])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — the textarea is selectable.
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
      <h1>Sync between devices</h1>
      <p className="empty-note">
        Your progress lives on this device. To move it to another device — or hand it in to
        your teacher — copy your code below. No internet needed.
      </p>

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
      </section>

      <section>
        <h2>Your progress code</h2>
        <textarea className="code-box" readOnly value={code} rows={4} onFocus={(e) => e.target.select()} />
        <div className="unit-actions">
          <button className="button button-primary" onClick={copyCode}>
            {copied ? '✓ Copied' : 'Copy code'}
          </button>
        </div>
        <p className="field-hint">
          Paste it into the Sync page on your other device, or send it to your teacher.
        </p>
      </section>

      <section>
        <h2>Load a code</h2>
        <textarea
          className="code-box"
          placeholder="Paste a progress code here (starts with SMIQ)"
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
      </section>

      <section>
        <h2>Class code</h2>
        <p className="field-hint">
          If your teacher gave you a class code, paste it here to load your assigned lessons.
        </p>
        <textarea
          className="code-box"
          placeholder="Paste a class code here (starts with SMIQA1)"
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
            Import class code
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
    </div>
  )
}
