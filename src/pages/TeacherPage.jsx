import { useEffect, useMemo, useState } from 'react'
import { getAllUnits, getUnitsByCategory, getUnit } from '../content/index.js'
import { useProgress, getUnitProgress, PASS_THRESHOLD } from '../lib/progress.js'
import { useRoster, addStudentFromCode, removeStudent, clearRoster } from '../lib/roster.js'
import {
  useTeacherAssignments,
  saveTeacherAssignment,
  removeTeacherAssignment,
  clearTeacherAssignments,
} from '../lib/teacherAssignments.js'
import { ASSIGNMENT_MODES } from '../lib/assignments.js'
import { isComplete, isFlagged, flagReasons, formatMinSec, statusInfo } from '../lib/status.js'
import StatusIcon from '../components/StatusIcon.jsx'
import QrCode from '../components/QrCode.jsx'
import { printClassJoinSheet } from '../lib/print.js'
import mockRoster from '../content/mock/students.json'
import {
  useAuth,
  setupAdmin,
  loginAdmin,
  issueTeacherCode,
  removeIssuedTeacher,
  redeemTeacherCode,
  loginTeacher,
  forgetTeacher,
  signOut,
} from '../lib/auth.js'
import {
  useClasses,
  clearAllClasses,
  createClass,
  removeClass,
  addStudent,
  removeStudentFromClass,
  resetStudentPin,
  updateClassSettings,
  buildClassLoginCode,
  credentialSheetText,
  classJoinUrl,
} from '../lib/classes.js'
import {
  downloadDetailCsvMicrosoft,
  downloadDetailCsvGoogle,
  downloadGradebookCsvMicrosoft,
  downloadGradebookCsvGoogle,
} from '../lib/exports.js'

// due is "YYYY-MM-DD"; parse as local date, not UTC midnight, so it never
// displays a day early/late depending on timezone (mirrors SyncPage).
function formatDueDate(due) {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function completedCount(row, unitList) {
  return unitList.filter((u) => isComplete(row.progressFor(u.id))).length
}

function flagCount(row, unitList) {
  return unitList.filter((u) => isFlagged(row.progressFor(u.id))).length
}

function assignmentCompletion(row, assignment) {
  const total = assignment.unitIds.length
  const complete = assignment.unitIds.filter((id) => isComplete(row.progressFor(id))).length
  return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 }
}

function AddStudentForm() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  async function add() {
    try {
      const student = await addStudentFromCode(code)
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
        placeholder="Paste a student's progress code (starts with SMIQ)"
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

// --- login gate (Teacher tab lock) ---

function LoginGate() {
  const { adminConfigured, teacherConfigured, teacherName } = useAuth()

  const [teacherCode, setTeacherCode] = useState('')
  const [teacherError, setTeacherError] = useState('')
  const [teacherPass, setTeacherPass] = useState('')
  const [teacherConfirm, setTeacherConfirm] = useState('')

  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')

  const [setupPass, setSetupPass] = useState('')
  const [setupConfirm, setSetupConfirm] = useState('')
  const [setupError, setSetupError] = useState('')

  // First run on this device: the code says who the teacher is, the passcode
  // is what unlocks the device from here on.
  async function handleRedeem() {
    if (teacherPass.length < 6) {
      setTeacherError('Pick a teacher passcode of at least 6 characters.')
      return
    }
    if (teacherPass !== teacherConfirm) {
      setTeacherError('Passcodes do not match — re-enter them.')
      return
    }
    try {
      await redeemTeacherCode(teacherCode, teacherPass)
      setTeacherCode('')
      setTeacherPass('')
      setTeacherConfirm('')
      setTeacherError('')
    } catch (err) {
      setTeacherError(err.message)
    }
  }

  async function handleTeacherLogin() {
    try {
      await loginTeacher(teacherPass)
      setTeacherPass('')
      setTeacherError('')
    } catch (err) {
      setTeacherError(err.message)
    }
  }

  async function handleAdminLogin() {
    try {
      await loginAdmin(adminPass)
      setAdminPass('')
      setAdminError('')
    } catch (err) {
      setAdminError(err.message)
    }
  }

  async function handleAdminSetup() {
    if (setupPass.length < 6) {
      setSetupError('Pick an admin passcode of at least 6 characters.')
      return
    }
    if (setupPass !== setupConfirm) {
      setSetupError('Passcodes do not match — re-enter them.')
      return
    }
    try {
      await setupAdmin(setupPass)
      setSetupPass('')
      setSetupConfirm('')
      setSetupError('')
    } catch (err) {
      setSetupError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Teacher sign-in</h1>
      <p className="field-hint">
        Sign-in keeps students on a shared device out of the teacher dashboard. All data stays on
        this device — there are no online accounts.
      </p>

      <div className="login-cards">
        <section className="login-card">
          <h2>Teacher</h2>
          {teacherConfigured ? (
            <>
              <p className="field-hint">
                This device is set up for <strong>{teacherName}</strong>. Enter the teacher
                passcode to sign in.
              </p>
              <input
                className="text-input"
                type="password"
                placeholder="Teacher passcode"
                value={teacherPass}
                onChange={(e) => {
                  setTeacherPass(e.target.value)
                  setTeacherError('')
                }}
              />
              <div className="unit-actions">
                <button
                  className="button button-primary"
                  onClick={handleTeacherLogin}
                  disabled={!teacherPass}
                >
                  Sign in
                </button>
              </div>
              <p className="field-hint">
                Forgot it, or handing this device to another teacher? The program admin can sign
                in below and release the device.
              </p>
            </>
          ) : (
            <>
              <p className="field-hint">
                Paste the access code your program admin gave you, then pick a passcode for this
                device. You'll use the passcode to sign in from now on — the code is only needed
                this once, so a pasted code can never unlock a device that already holds class
                data.
              </p>
              <textarea
                className="code-box"
                placeholder="Paste your teacher access code (starts with SMIQT1)"
                rows={3}
                value={teacherCode}
                onChange={(e) => {
                  setTeacherCode(e.target.value)
                  setTeacherError('')
                }}
              />
              <label className="assignment-field">
                Choose a teacher passcode (min 6 characters)
                <input
                  className="text-input"
                  type="password"
                  value={teacherPass}
                  onChange={(e) => {
                    setTeacherPass(e.target.value)
                    setTeacherError('')
                  }}
                />
              </label>
              <label className="assignment-field">
                Confirm passcode
                <input
                  className="text-input"
                  type="password"
                  value={teacherConfirm}
                  onChange={(e) => {
                    setTeacherConfirm(e.target.value)
                    setTeacherError('')
                  }}
                />
              </label>
              <div className="unit-actions">
                <button
                  className="button button-primary"
                  onClick={handleRedeem}
                  disabled={!teacherCode.trim() || !teacherPass || !teacherConfirm}
                >
                  Set up this device
                </button>
              </div>
              <p className="field-hint">
                There is no account recovery — write the passcode down.
              </p>
            </>
          )}
          {teacherError && (
            <p className="import-error" role="status">
              {teacherError}
            </p>
          )}
        </section>

        <section className="login-card">
          <h2>Program admin</h2>
          {teacherConfigured && !adminConfigured ? (
            // Offering first-run admin setup here would be a back door around
            // the teacher passcode on a device that already holds their
            // classes; auth.js refuses it, and the form is hidden to match.
            <p className="field-hint">
              This device belongs to <strong>{teacherName}</strong>. Sign in with the teacher
              passcode above first — a program admin can then be added from the dashboard.
            </p>
          ) : adminConfigured ? (
            <>
              <p className="field-hint">Enter the admin passcode set up on this device.</p>
              <input
                className="text-input"
                type="password"
                placeholder="Admin passcode"
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value)
                  setAdminError('')
                }}
              />
              <div className="unit-actions">
                <button
                  className="button button-primary"
                  onClick={handleAdminLogin}
                  disabled={!adminPass}
                >
                  Sign in
                </button>
              </div>
              {adminError && (
                <p className="import-error" role="status">
                  {adminError}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="field-hint">
                Set up the program admin on this device. The admin issues teacher access codes.
                Everything stays on this device; there is no account recovery — write the
                passcode down.
              </p>
              <label className="assignment-field">
                Admin passcode (min 6 characters)
                <input
                  className="text-input"
                  type="password"
                  value={setupPass}
                  onChange={(e) => {
                    setSetupPass(e.target.value)
                    setSetupError('')
                  }}
                />
              </label>
              <label className="assignment-field">
                Confirm passcode
                <input
                  className="text-input"
                  type="password"
                  value={setupConfirm}
                  onChange={(e) => {
                    setSetupConfirm(e.target.value)
                    setSetupError('')
                  }}
                />
              </label>
              <div className="unit-actions">
                <button
                  className="button button-primary"
                  onClick={handleAdminSetup}
                  disabled={!setupPass || !setupConfirm}
                >
                  Set up admin
                </button>
              </div>
              {setupError && (
                <p className="import-error" role="status">
                  {setupError}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// Top-of-dashboard strip once signed in: who's signed in + a sign-out button.
function SignedInBanner({ auth }) {
  const who = auth.role === 'admin' ? 'Program admin' : auth.teacher?.name ?? 'Teacher'
  const [confirmRelease, setConfirmRelease] = useState(false)
  const [releaseError, setReleaseError] = useState('')

  // Releasing hands the device to someone else. With no admin left to guard
  // it, the departing teacher's classes — rosters and plaintext PINs — must go
  // with their credential, or the next person to pick the device up could set
  // themselves up as teacher and read them. auth.js refuses redemption while
  // class data remains, so a failure here locks the device rather than
  // exposing it.
  //
  // This value drives the WARNING only. The wipe itself is decided by what
  // forgetTeacher() actually committed, because another tab may have added an
  // admin whose storage event has not been delivered here — wiping on this
  // stale snapshot would erase a device that is in fact still guarded.
  const wipesData = !auth.adminConfigured

  function release() {
    try {
      // Release FIRST: it re-checks authorization against persisted state and
      // throws if this tab was signed out elsewhere, so an unauthorized tab
      // can never reach the wipe below. Between the two, the device holds
      // class data with no teacher record — redemption refuses in exactly that
      // state, so the gap is locked rather than open.
      const { adminRemains } = forgetTeacher()
      if (!adminRemains) {
        clearAllClasses()
        clearRoster()
        clearTeacherAssignments()
      }
      setConfirmRelease(false)
      setReleaseError('')
    } catch (err) {
      setReleaseError(err.message)
    }
  }

  return (
    <div className="teacher-session-bar">
      <span>
        Signed in as {who} · {auth.role}
      </span>
      <span className="unit-actions">
        {auth.teacherConfigured &&
          (confirmRelease ? (
            <>
              <button className="button button-danger" onClick={release}>
                {wipesData ? 'Confirm — release and erase classes' : 'Confirm release'}
              </button>
              <button className="button" onClick={() => setConfirmRelease(false)}>
                Cancel
              </button>
              <span className="field-hint">
                {wipesData
                  ? 'This device has no program admin, so releasing also erases its classes, rosters and PINs — nothing would protect them otherwise. Export what you need first.'
                  : 'The teacher is removed from this device. Classes stay, protected by the admin passcode.'}
              </span>
            </>
          ) : (
            <button
              className="button"
              onClick={() => setConfirmRelease(true)}
              title="Remove this teacher from the device so another teacher can set it up"
            >
              Release device
            </button>
          ))}
        <button className="button" onClick={signOut}>
          Sign out
        </button>
      </span>
      {releaseError && (
        <p className="import-error" role="status">
          {releaseError}
        </p>
      )}
    </div>
  )
}

// --- admin panel: issue/manage teacher access codes ---

function AdminPanel({ issued }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [copiedTid, setCopiedTid] = useState(null)
  const [revealedTid, setRevealedTid] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  async function issue() {
    try {
      await issueTeacherCode(name)
      setName('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function copyCode(entry) {
    try {
      await navigator.clipboard.writeText(entry.code)
      setCopiedTid(entry.tid)
      setTimeout(() => setCopiedTid(null), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — reveal the selectable
      // textarea so the admin can still select and copy the code by hand.
      setRevealedTid(entry.tid)
    }
  }

  return (
    <section className="admin-panel">
      <h2>Teacher access codes</h2>
      <p className="field-hint">
        Issue a code for each teacher; they paste it on their own device to unlock the Teacher
        tab there. Re-issuing for the same name replaces the code. Removal is bookkeeping only on
        this device — there is no server, so there is no remote revocation.
      </p>
      <div className="unit-actions">
        <input
          className="text-input"
          type="text"
          placeholder="Teacher name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
        />
        <button className="button button-primary" onClick={issue} disabled={!name.trim()}>
          Issue code
        </button>
      </div>
      {error && (
        <p className="import-error" role="status">
          {error}
        </p>
      )}

      {issued.length > 0 && (
        <div className="assignment-list">
          {issued.map((entry) => (
            <div key={entry.tid} className="assignment-item">
              <div className="assignment-item-main">
                <strong>{entry.name}</strong>
                <span className="field-hint">
                  Issued {new Date(entry.issuedAt).toLocaleDateString()}
                </span>
              </div>
              <span className="unit-actions">
                <button className="button" onClick={() => copyCode(entry)}>
                  {copiedTid === entry.tid ? '✓ Copied' : 'Copy code'}
                </button>
                <button
                  className="button"
                  onClick={() =>
                    setRevealedTid((cur) => (cur === entry.tid ? null : entry.tid))
                  }
                  aria-expanded={revealedTid === entry.tid}
                >
                  {revealedTid === entry.tid ? 'Hide code' : 'Show code'}
                </button>
                {confirmRemove === entry.tid ? (
                  <>
                    <button
                      className="button button-danger"
                      onClick={() => {
                        removeIssuedTeacher(entry.tid)
                        setConfirmRemove(null)
                      }}
                    >
                      Confirm remove
                    </button>
                    <button className="button" onClick={() => setConfirmRemove(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="remove-button"
                    onClick={() => setConfirmRemove(entry.tid)}
                    aria-label={`Remove ${entry.name}`}
                    title={`Remove ${entry.name}`}
                  >
                    ✕
                  </button>
                )}
              </span>
              {revealedTid === entry.tid && (
                <textarea
                  className="code-box"
                  readOnly
                  value={entry.code}
                  rows={4}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Access code for ${entry.name}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// Provisioning that has to be reachable AFTER signing in, not only from the
// locked sign-in screen. Two flows deadlock otherwise, both of them documented
// as supported: a teacher-only device can never gain an admin (setupAdmin
// refuses while locked, and the sign-in form is gone once the teacher is in),
// and an admin-managed device can never take a replacement teacher after a
// release (redemption needs the admin's session, which hides the form).
function DeviceSetupPanel({ auth }) {
  const [teacherCode, setTeacherCode] = useState('')
  const [teacherPass, setTeacherPass] = useState('')
  const [teacherConfirm, setTeacherConfirm] = useState('')
  const [teacherMsg, setTeacherMsg] = useState(null)

  const [adminPass, setAdminPass] = useState('')
  const [adminConfirm, setAdminConfirm] = useState('')
  const [adminMsg, setAdminMsg] = useState(null)

  const canAddAdmin = !auth.adminConfigured
  const canTakeTeacher = auth.role === 'admin' && !auth.teacherConfigured
  // Succeeding hides the form that produced the message (the device is now
  // provisioned), so the panel stays mounted while there is something to
  // report — otherwise the confirmation would vanish in the same render.
  if (!canAddAdmin && !canTakeTeacher && !adminMsg && !teacherMsg) return null

  async function addAdmin() {
    if (adminPass.length < 6) {
      setAdminMsg({ ok: false, message: 'Pick an admin passcode of at least 6 characters.' })
      return
    }
    if (adminPass !== adminConfirm) {
      setAdminMsg({ ok: false, message: 'Passcodes do not match — re-enter them.' })
      return
    }
    try {
      await setupAdmin(adminPass)
      setAdminPass('')
      setAdminConfirm('')
      setAdminMsg({ ok: true, message: 'Program admin added to this device.' })
    } catch (err) {
      setAdminMsg({ ok: false, message: err.message })
    }
  }

  async function takeTeacher() {
    if (teacherPass.length < 6) {
      setTeacherMsg({ ok: false, message: 'Pick a teacher passcode of at least 6 characters.' })
      return
    }
    if (teacherPass !== teacherConfirm) {
      setTeacherMsg({ ok: false, message: 'Passcodes do not match — re-enter them.' })
      return
    }
    try {
      await redeemTeacherCode(teacherCode, teacherPass)
      setTeacherCode('')
      setTeacherPass('')
      setTeacherConfirm('')
      setTeacherMsg({ ok: true, message: 'Teacher set up on this device.' })
    } catch (err) {
      setTeacherMsg({ ok: false, message: err.message })
    }
  }

  return (
    <section className="admin-panel">
      <h2>Device setup</h2>

      {canAddAdmin && (
        <>
          <h3>Add a program admin</h3>
          <p className="field-hint">
            An admin can issue teacher access codes and hand this device to another teacher. There
            is no account recovery — write the passcode down.
          </p>
          <label className="assignment-field">
            Admin passcode (min 6 characters)
            <input
              className="text-input"
              type="password"
              value={adminPass}
              onChange={(e) => {
                setAdminPass(e.target.value)
                setAdminMsg(null)
              }}
            />
          </label>
          <label className="assignment-field">
            Confirm passcode
            <input
              className="text-input"
              type="password"
              value={adminConfirm}
              onChange={(e) => {
                setAdminConfirm(e.target.value)
                setAdminMsg(null)
              }}
            />
          </label>
          <div className="unit-actions">
            <button
              className="button button-primary"
              onClick={addAdmin}
              disabled={!adminPass || !adminConfirm}
            >
              Add program admin
            </button>
          </div>
        </>
      )}
      {adminMsg && (
        <p className={adminMsg.ok ? 'import-ok' : 'import-error'} role="status">
          {adminMsg.message}
        </p>
      )}

      {canTakeTeacher && (
        <>
          <h3>Set up a teacher on this device</h3>
          <p className="field-hint">
            Paste that teacher&apos;s access code and choose the passcode this device will use.
            They sign in with the passcode from then on.
          </p>
          <textarea
            className="code-box"
            placeholder="Paste a teacher access code (starts with SMIQT1)"
            rows={3}
            value={teacherCode}
            onChange={(e) => {
              setTeacherCode(e.target.value)
              setTeacherMsg(null)
            }}
          />
          <label className="assignment-field">
            Teacher passcode (min 6 characters)
            <input
              className="text-input"
              type="password"
              value={teacherPass}
              onChange={(e) => {
                setTeacherPass(e.target.value)
                setTeacherMsg(null)
              }}
            />
          </label>
          <label className="assignment-field">
            Confirm passcode
            <input
              className="text-input"
              type="password"
              value={teacherConfirm}
              onChange={(e) => {
                setTeacherConfirm(e.target.value)
                setTeacherMsg(null)
              }}
            />
          </label>
          <div className="unit-actions">
            <button
              className="button button-primary"
              onClick={takeTeacher}
              disabled={!teacherCode.trim() || !teacherPass || !teacherConfirm}
            >
              Set up teacher
            </button>
          </div>
        </>
      )}
      {teacherMsg && (
        <p className={teacherMsg.ok ? 'import-ok' : 'import-error'} role="status">
          {teacherMsg.message}
        </p>
      )}
    </section>
  )
}


// --- shared drill-down building blocks ---

const GRADE_BAND_LABELS = { '7-8': '7th–8th', '9-10': '9th–10th', '11-12': '11th–12th' }

function GradeBandPill({ gradeBand }) {
  const label = GRADE_BAND_LABELS[gradeBand]
  if (!label) return null
  return <span className="pill pill-grade">{label}</span>
}

// One expandable card/accordion row: disclosure triangle, label, optional
// right-aligned meta content. Real button semantics, 44px min touch height.
function DrillRow({ level = 0, expanded, onToggle, label, right }) {
  return (
    <div
      className={expanded ? 'drill-row drill-row-expanded' : 'drill-row'}
      style={{ '--level': level }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <span className={expanded ? 'drill-caret drill-caret-open' : 'drill-caret'} aria-hidden="true">
        ▸
      </span>
      <span className="drill-label">{label}</span>
      {right && <span className="drill-right">{right}</span>}
    </div>
  )
}

function CategoryHeading({ level = 0, children }) {
  return (
    <h3 className="drill-category-heading" style={{ '--level': level }}>
      {children}
    </h3>
  )
}

// --- assignment builder (teacher-authored class codes) ---

const MODE_INFO = {
  focus: { label: 'Focus', desc: 'students see only assigned lessons in the Library.' },
  open: { label: 'Open', desc: 'students can browse everything.' },
}

// Grade-band filter for the unit picker below — local component state only,
// deliberately not persisted/shared with the "By Lesson" pivot's grade-band
// filter (sportmediq:teacherGradeBand).
const BUILDER_GRADE_BANDS = [
  { id: 'all', label: 'All' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

function TeacherAssignments() {
  const savedAssignments = useTeacherAssignments()
  const unitsByCategory = useMemo(() => getUnitsByCategory(), [])

  const [name, setName] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [mode, setMode] = useState('focus')
  const [due, setDue] = useState('')
  const [gradeBand, setGradeBand] = useState('all')

  const [generatedCode, setGeneratedCode] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [copied, setCopied] = useState(false)

  const [copiedName, setCopiedName] = useState(null)
  const [revealedName, setRevealedName] = useState(null) // saved assignment whose code textarea is shown
  const [confirmRemove, setConfirmRemove] = useState(null)

  function toggleUnit(id) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function generate() {
    try {
      const entry = await saveTeacherAssignment({
        name,
        unitIds: [...selected],
        mode,
        due: due || undefined,
      })
      setGeneratedCode(entry.code)
      setGenerateError('')
      setName('')
      setSelected(new Set())
      setMode('focus')
      setDue('')
    } catch (err) {
      setGenerateError(err.message)
    }
  }

  async function copyGeneratedCode() {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — the textarea is selectable.
    }
  }

  async function copySavedCode(assignment) {
    try {
      await navigator.clipboard.writeText(assignment.code)
      setCopiedName(assignment.name)
      setTimeout(() => setCopiedName(null), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — reveal the selectable
      // textarea so the teacher can still select and copy the code by hand.
      setRevealedName(assignment.name)
    }
  }

  return (
    <section className="teacher-assignments">
      <h2>Assignments</h2>
      <p className="field-hint">
        Build a class code for a set of lessons, then share it with students to paste into
        their Sync page.
      </p>

      <label className="assignment-field">
        Assignment name
        <input
          className="text-input"
          type="text"
          placeholder="e.g. Week 3 — Concussion unit"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="grade-band-picker" role="group" aria-label="Filter assignment lessons by grade">
        {BUILDER_GRADE_BANDS.map((band) => (
          <button
            key={band.id}
            type="button"
            className={
              gradeBand === band.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'
            }
            onClick={() => setGradeBand(band.id)}
            aria-pressed={gradeBand === band.id}
          >
            {band.label}
          </button>
        ))}
      </div>

      <div className="assignment-unit-picker">
        {unitsByCategory.map(({ category, units: catUnits }) => {
          const visible =
            gradeBand === 'all' ? catUnits : catUnits.filter((u) => u.gradeBand === gradeBand)
          if (visible.length === 0) return null
          return (
            <div key={category}>
              <CategoryHeading level={0}>{category}</CategoryHeading>
              {visible.map((unit) => (
                <label key={unit.id} className="assignment-unit-row">
                  <input
                    type="checkbox"
                    checked={selected.has(unit.id)}
                    onChange={() => toggleUnit(unit.id)}
                  />
                  <span className="assignment-unit-title">{unit.title}</span>
                  <GradeBandPill gradeBand={unit.gradeBand} />
                </label>
              ))}
            </div>
          )
        })}
      </div>

      <p className="field-hint">
        {selected.size} lesson{selected.size === 1 ? '' : 's'} selected
      </p>

      <div className="assignment-mode-picker" role="radiogroup" aria-label="Assignment mode">
        {ASSIGNMENT_MODES.map((m) => (
          <label key={m} className="assignment-mode-option">
            <input
              type="radio"
              name="assignment-mode"
              value={m}
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            <span>
              <strong>{MODE_INFO[m].label}</strong> — {MODE_INFO[m].desc}
            </span>
          </label>
        ))}
      </div>

      <label className="assignment-field">
        Due date (optional)
        <input
          className="text-input"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
      </label>

      <div className="unit-actions">
        <button
          className="button button-primary"
          onClick={generate}
          disabled={!name.trim() || selected.size === 0}
        >
          Generate class code
        </button>
      </div>
      <p className="field-hint">
        To edit a saved assignment, rebuild it here with the same name and generate again — it
        replaces the old code rather than creating a duplicate.
      </p>

      {generateError && (
        <p className="import-error" role="status">
          {generateError}
        </p>
      )}

      {generatedCode && (
        <>
          <textarea
            className="code-box"
            readOnly
            value={generatedCode}
            rows={4}
            onFocus={(e) => e.target.select()}
          />
          <div className="unit-actions">
            <button className="button button-primary" onClick={copyGeneratedCode}>
              {copied ? '✓ Copied' : 'Copy code'}
            </button>
          </div>
        </>
      )}

      {savedAssignments.length > 0 && (
        <div className="assignment-list">
          <h3>Saved assignments</h3>
          {savedAssignments.map((a) => {
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
                <span className="unit-actions">
                  <button className="button" onClick={() => copySavedCode(a)}>
                    {copiedName === a.name ? '✓ Copied' : 'Copy code'}
                  </button>
                  <button
                    className="button"
                    onClick={() =>
                      setRevealedName((cur) => (cur === a.name ? null : a.name))
                    }
                    aria-expanded={revealedName === a.name}
                  >
                    {revealedName === a.name ? 'Hide code' : 'Show code'}
                  </button>
                  {confirmRemove === a.name ? (
                    <>
                      <button
                        className="button button-danger"
                        onClick={() => {
                          removeTeacherAssignment(a.name)
                          setConfirmRemove(null)
                        }}
                      >
                        Confirm remove
                      </button>
                      <button className="button" onClick={() => setConfirmRemove(null)}>
                        Cancel
                      </button>
                    </>
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
                </span>
                {revealedName === a.name && (
                  <textarea
                    className="code-box"
                    readOnly
                    value={a.code}
                    rows={4}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Class code for ${a.name}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// --- class manager (teacher-created classes, rosters, and content controls) ---

function ClassStudents({ cls }) {
  const [addName, setAddName] = useState('')
  const [addError, setAddError] = useState('')
  const [confirmRemoveSid, setConfirmRemoveSid] = useState(null)
  const [sheetCopied, setSheetCopied] = useState(false)
  const [sheetRevealed, setSheetRevealed] = useState(false)

  function handleAdd() {
    try {
      addStudent(cls.cid, addName)
      setAddName('')
      setAddError('')
    } catch (err) {
      setAddError(err.message)
    }
  }

  async function copySheet() {
    try {
      await navigator.clipboard.writeText(credentialSheetText(cls))
      setSheetCopied(true)
      setTimeout(() => setSheetCopied(false), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — reveal the selectable
      // textarea so the teacher can still select and copy the sheet by hand.
      setSheetRevealed(true)
    }
  }

  return (
    <div className="class-students">
      <h3>Students</h3>
      {cls.students.length === 0 ? (
        <p className="field-hint">No students yet — add one below.</p>
      ) : (
        <div className="assignment-list">
          {cls.students.map((s) => (
            <div key={s.sid} className="assignment-item">
              <div className="assignment-item-main">
                <strong>{s.name}</strong>
                <span className="field-hint">
                  ID {s.sid} · PIN {s.pin}
                </span>
              </div>
              <span className="unit-actions">
                <button className="button" onClick={() => resetStudentPin(cls.cid, s.sid)}>
                  New PIN
                </button>
                {confirmRemoveSid === s.sid ? (
                  <>
                    <button
                      className="button button-danger"
                      onClick={() => {
                        removeStudentFromClass(cls.cid, s.sid)
                        setConfirmRemoveSid(null)
                      }}
                    >
                      Confirm remove
                    </button>
                    <button className="button" onClick={() => setConfirmRemoveSid(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="remove-button"
                    onClick={() => setConfirmRemoveSid(s.sid)}
                    aria-label={`Remove ${s.name}`}
                    title={`Remove ${s.name}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="unit-actions">
        <input
          className="text-input"
          type="text"
          placeholder="Login name — first name or nickname is enough"
          value={addName}
          onChange={(e) => {
            setAddName(e.target.value)
            setAddError('')
          }}
        />
        <button className="button button-primary" onClick={handleAdd} disabled={!addName.trim()}>
          Add student
        </button>
      </div>
      <p className="field-hint">First name or nickname is enough — no real full names needed.</p>
      {addError && (
        <p className="import-error" role="status">
          {addError}
        </p>
      )}

      {cls.students.length > 0 && (
        <>
          <div className="unit-actions">
            <button className="button" onClick={copySheet}>
              {sheetCopied ? '✓ Copied' : 'Copy credential sheet'}
            </button>
          </div>
          <p className="field-hint">Print and cut into slips, one per student.</p>
          {sheetRevealed && (
            <textarea
              className="code-box"
              readOnly
              value={credentialSheetText(cls)}
              rows={Math.min(cls.students.length + 2, 10)}
              onFocus={(e) => e.target.select()}
              aria-label="Credential sheet"
            />
          )}
        </>
      )}
    </div>
  )
}

function ClassContentControls({ cls }) {
  const unitsByCategory = useMemo(() => getUnitsByCategory(), [])
  const [libraryMode, setLibraryMode] = useState(cls.settings.units === null ? 'all' : 'pick')
  const [selected, setSelected] = useState(() => new Set(cls.settings.units ?? []))
  const [gradeBand, setGradeBand] = useState('all')

  function chooseWholeLibrary() {
    setLibraryMode('all')
    updateClassSettings(cls.cid, { units: null })
  }

  function choosePick() {
    setLibraryMode('pick')
    // Restore the previous pick, if there was one — an empty selection would
    // hide the whole library, so only persist a non-empty restriction.
    if (selected.size > 0) updateClassSettings(cls.cid, { units: [...selected] })
  }

  function toggleUnit(id) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size > 0) updateClassSettings(cls.cid, { units: [...next] })
      return next
    })
  }

  return (
    <div className="class-content-controls">
      <h3>What students can see right now</h3>

      <div className="assignment-mode-picker" role="radiogroup" aria-label="Library visibility">
        <label className="assignment-mode-option">
          <input
            type="radio"
            name={`library-${cls.cid}`}
            checked={libraryMode === 'all'}
            onChange={chooseWholeLibrary}
          />
          <span>
            <strong>Whole library</strong> — students can browse every lesson.
          </span>
        </label>
        <label className="assignment-mode-option">
          <input
            type="radio"
            name={`library-${cls.cid}`}
            checked={libraryMode === 'pick'}
            onChange={choosePick}
          />
          <span>
            <strong>Only the lessons I pick</strong> — restrict the library to specific lessons.
          </span>
        </label>
      </div>

      {libraryMode === 'pick' && (
        <>
          <div className="grade-band-picker" role="group" aria-label="Filter lessons by grade">
            {BUILDER_GRADE_BANDS.map((band) => (
              <button
                key={band.id}
                type="button"
                className={
                  gradeBand === band.id
                    ? 'grade-band-button grade-band-button-active'
                    : 'grade-band-button'
                }
                onClick={() => setGradeBand(band.id)}
                aria-pressed={gradeBand === band.id}
              >
                {band.label}
              </button>
            ))}
          </div>
          <div className="assignment-unit-picker">
            {unitsByCategory.map(({ category, units: catUnits }) => {
              const visible =
                gradeBand === 'all' ? catUnits : catUnits.filter((u) => u.gradeBand === gradeBand)
              if (visible.length === 0) return null
              return (
                <div key={category}>
                  <CategoryHeading level={0}>{category}</CategoryHeading>
                  {visible.map((unit) => (
                    <label key={unit.id} className="assignment-unit-row">
                      <input
                        type="checkbox"
                        checked={selected.has(unit.id)}
                        onChange={() => toggleUnit(unit.id)}
                      />
                      <span className="assignment-unit-title">{unit.title}</span>
                      <GradeBandPill gradeBand={unit.gradeBand} />
                    </label>
                  ))}
                </div>
              )
            })}
          </div>
          <p className="field-hint">
            {selected.size} lesson{selected.size === 1 ? '' : 's'} picked — check at least one to
            restrict the library; students keep seeing the whole library until then.
          </p>
        </>
      )}

      <label className="assignment-mode-option">
        <input
          type="checkbox"
          checked={cls.settings.quizzes}
          onChange={(e) => updateClassSettings(cls.cid, { quizzes: e.target.checked })}
        />
        <span>Quizzes open</span>
      </label>

      <label className="assignment-mode-option">
        <input
          type="checkbox"
          checked={cls.settings.assignments}
          onChange={(e) => updateClassSettings(cls.cid, { assignments: e.target.checked })}
        />
        <span>Assignments visible</span>
      </label>
      <p className="field-hint">
        Off hides the My Lessons queue and class-code entry on student devices until you're ready
        to use assignments.
      </p>
    </div>
  )
}

function ClassLoginCodeBlock({ cls }) {
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const joinUrl = classJoinUrl(cls.code)

  // Esc closes the projected code — a teacher mid-lesson should not have to
  // find the mouse.
  useEffect(() => {
    if (!fullScreen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFullScreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullScreen])

  async function generate() {
    setBusy(true)
    try {
      await buildClassLoginCode(cls.cid)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function copy(what, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      // Clipboard blocked — the boxes below are visible and selectable.
    }
  }

  return (
    <div className="class-code-block">
      <h3>Class login code</h3>
      {cls.code ? (
        <>
          <textarea
            className="code-box"
            readOnly
            value={cls.code}
            rows={4}
            onFocus={(e) => e.target.select()}
            aria-label={`Class login code for ${cls.name}`}
          />
          <div className="unit-actions">
            <button className="button" onClick={() => copy('code', cls.code)}>
              {copied === 'code' ? '✓ Copied' : 'Copy code'}
            </button>
          </div>

          <h4>Join link</h4>
          <p className="field-hint">
            Post this in Google Classroom or Teams — students tap it and land on the sign-in
            page with the class already loaded, so nobody types the code.
          </p>
          <input
            className="text-input join-link"
            readOnly
            value={joinUrl}
            onFocus={(e) => e.target.select()}
            aria-label={`Join link for ${cls.name}`}
          />
          <div className="unit-actions">
            <button className="button button-primary" onClick={() => copy('link', joinUrl)}>
              {copied === 'link' ? '✓ Copied' : 'Copy join link'}
            </button>
            <button className="button" onClick={() => setShowQr((v) => !v)}>
              {showQr ? 'Hide QR code' : 'Show QR code'}
            </button>
          </div>

          {showQr && (
            <div className="qr-block">
              <QrCode text={joinUrl} size={520} label={`QR code to join ${cls.name}`} />
              <p className="field-hint">
                A whole class roster is a lot to carry, so this is a dense code — a camera needs
                it big. Project it full screen, or print the sheet and pin it up; scanning it
                from a laptop screen across the room will not work.
              </p>
              <div className="unit-actions">
                <button className="button button-primary" onClick={() => setFullScreen(true)}>
                  Full screen
                </button>
                <button className="button" onClick={() => printClassJoinSheet(cls, joinUrl)}>
                  Print join sheet
                </button>
              </div>
            </div>
          )}
          {fullScreen && (
            <div
              className="qr-fullscreen"
              role="dialog"
              aria-modal="true"
              aria-label={`QR code to join ${cls.name}`}
              onClick={() => setFullScreen(false)}
            >
              <QrCode text={joinUrl} size={2000} label={`QR code to join ${cls.name}`} />
              <p>Scan to join {cls.name}</p>
              <button className="button" onClick={() => setFullScreen(false)}>
                Close
              </button>
            </div>
          )}
          <p className="field-hint">generated {new Date(cls.codeAt).toLocaleString()}</p>
        </>
      ) : cls.students.length > 0 ? (
        <>
          <p className="import-error" role="status">
            Roster or settings changed — generate a fresh code and re-share it with the class
            (that's how changes reach student devices).
          </p>
          <div className="unit-actions">
            <button className="button button-primary" onClick={generate} disabled={busy}>
              Generate class login code
            </button>
          </div>
        </>
      ) : (
        <p className="field-hint">Add at least one student, then generate a class login code.</p>
      )}
      {error && (
        <p className="import-error" role="status">
          {error}
        </p>
      )}
      <p className="field-hint">
        Students paste this one code on their Log in page, then sign in with their own PIN.
      </p>
    </div>
  )
}

function ClassCard({ cls, expanded, onToggle }) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  return (
    <div className="drill-group">
      <DrillRow
        level={0}
        expanded={expanded}
        onToggle={onToggle}
        label={cls.name}
        right={
          <span className="drill-stat">
            {cls.students.length} student{cls.students.length === 1 ? '' : 's'}
          </span>
        }
      />
      {expanded && (
        <div className="drill-children class-card-body">
          <ClassStudents cls={cls} />
          <ClassContentControls cls={cls} />
          <ClassLoginCodeBlock cls={cls} />
          <div className="unit-actions class-remove-row">
            {confirmRemove ? (
              <>
                <button className="button button-danger" onClick={() => removeClass(cls.cid)}>
                  Confirm remove class
                </button>
                <button className="button" onClick={() => setConfirmRemove(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="button button-danger" onClick={() => setConfirmRemove(true)}>
                Remove class
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ClassManager() {
  const classes = useClasses()
  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState('')
  const [openCid, setOpenCid] = useState(null)

  function create() {
    try {
      const cls = createClass(newName)
      setNewName('')
      setCreateError('')
      setOpenCid(cls.cid)
    } catch (err) {
      setCreateError(err.message)
    }
  }

  return (
    <section className="class-manager">
      <h2>Classes</h2>
      <p className="field-hint">
        Create a class, add students, and share one class login code so students can sign in with
        their own PIN.
      </p>
      <div className="unit-actions">
        <input
          className="text-input"
          type="text"
          placeholder="Class name (e.g. Period 3)"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            setCreateError('')
          }}
        />
        <button className="button button-primary" onClick={create} disabled={!newName.trim()}>
          Create class
        </button>
      </div>
      {createError && (
        <p className="import-error" role="status">
          {createError}
        </p>
      )}

      {classes.length === 0 ? (
        <p className="empty-note">No classes yet — create one above.</p>
      ) : (
        <div className="drill-list">
          {classes.map((cls) => (
            <ClassCard
              key={cls.cid}
              cls={cls}
              expanded={openCid === cls.cid}
              onToggle={() => setOpenCid((cur) => (cur === cls.cid ? null : cls.cid))}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Bottom of every drill-down path: one student, one lesson. Same info the
// old flat table's expand-row showed, as a small definition list.
function LessonDetailPanel({ progress }) {
  const p = progress
  const readSeconds = p?.readSeconds ?? 0
  const scrollPct = p?.scrollPct ?? 0
  const reasons = flagReasons(p)
  const info = statusInfo(p)
  const attempts = p?.quizAttempts ?? 0
  return (
    <dl className="lesson-detail">
      <div className="lesson-detail-row">
        <dt>Lesson read</dt>
        <dd>{p?.lessonRead ? 'Read' : readSeconds > 0 ? 'Not marked read yet' : 'Not started'}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Reading time</dt>
        <dd>{formatMinSec(readSeconds)}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Deepest scroll seen</dt>
        <dd>{scrollPct}%</dd>
      </div>
      {reasons.length > 0 && (
        <div className="lesson-detail-row">
          <dt>Flags</dt>
          <dd className="detail-flag">⚠ {reasons.join('; ')}</dd>
        </div>
      )}
      <div className="lesson-detail-row">
        <dt>Flashcards</dt>
        <dd>{p?.flashcardsReviewed ? 'Reviewed' : 'Not reviewed'}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Best quiz score</dt>
        <dd>
          {p?.bestQuizScore != null ? `${Math.round(p.bestQuizScore * 100)}%` : '—'}
          {` · ${attempts} attempt${attempts === 1 ? '' : 's'}`}
        </dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Status</dt>
        <dd className={`status-dot status-${info.key}`}>
          {info.icon} {info.label}
        </dd>
      </div>
    </dl>
  )
}

// --- pivot views ---

// By Student: roster list → student's lessons grouped by category → lesson
// detail panel.
function ByStudentView({
  rows,
  unitsByCategory,
  units,
  teacherAssignments,
  openStudent,
  toggleStudent,
  openLesson,
  toggleLesson,
}) {
  return (
    <div className="drill-list">
      {rows.map((row) => {
        const expanded = openStudent === row.id
        const complete = completedCount(row, units)
        const flags = flagCount(row, units)
        return (
          <div key={row.id} className="drill-group">
            <DrillRow
              level={0}
              expanded={expanded}
              onToggle={() => toggleStudent(row.id)}
              label={row.name}
              right={
                <span className="drill-row-right">
                  <span className="drill-stat">
                    {complete}/{units.length} lessons complete
                  </span>
                  {flags > 0 && <span className="status-flag">{flags} ⚠</span>}
                  {row.removable && (
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStudent(row.id)
                      }}
                      aria-label={`Remove ${row.name}`}
                      title={`Remove ${row.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              }
            />
            {expanded && (
              <div className="drill-children">
                {teacherAssignments.length > 0 && (
                  <div className="assignment-progress-block">
                    <CategoryHeading level={1}>Assignments</CategoryHeading>
                    {teacherAssignments.map((a) => {
                      const { total, complete, pct } = assignmentCompletion(row, a)
                      return (
                        <p key={a.name} className="assignment-progress-row">
                          «{a.name}» — {complete}/{total} lessons complete ({pct}%)
                        </p>
                      )
                    })}
                  </div>
                )}
                {unitsByCategory.map(({ category, units: catUnits }) => (
                  <div key={category}>
                    <CategoryHeading level={1}>{category}</CategoryHeading>
                    {catUnits.map((lesson) => {
                      const lessonExpanded = openLesson === lesson.id
                      const p = row.progressFor(lesson.id)
                      return (
                        <div key={lesson.id}>
                          <DrillRow
                            level={1}
                            expanded={lessonExpanded}
                            onToggle={() => toggleLesson(lesson.id)}
                            label={
                              <>
                                {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                              </>
                            }
                            right={<StatusIcon progress={p} />}
                          />
                          {lessonExpanded && (
                            <div className="drill-detail-wrap" style={{ '--level': 2 }}>
                              <LessonDetailPanel progress={p} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// By Unit (= category): class-wide rollup per category → student rows with
// their per-category stats → that student's lessons in the category →
// lesson detail panel.
function ByUnitView({
  rows,
  unitsByCategory,
  openCategory,
  toggleCategory,
  openStudent,
  toggleStudent,
  openLesson,
  toggleLesson,
}) {
  return (
    <div className="drill-list">
      {unitsByCategory.map(({ category, units: catUnits }) => {
        const expanded = openCategory === category
        const totalPossible = catUnits.length * rows.length
        const totalComplete = rows.reduce((sum, row) => sum + completedCount(row, catUnits), 0)
        const totalFlags = rows.reduce((sum, row) => sum + flagCount(row, catUnits), 0)
        return (
          <div key={category} className="drill-group">
            <DrillRow
              level={0}
              expanded={expanded}
              onToggle={() => toggleCategory(category)}
              label={category}
              right={
                <span className="drill-row-right">
                  <span className="drill-stat">
                    {totalComplete}/{totalPossible} lesson completions across class
                  </span>
                  {totalFlags > 0 && <span className="status-flag">{totalFlags} ⚠</span>}
                </span>
              }
            />
            {expanded && (
              <div className="drill-children">
                {rows.map((row) => {
                  const studentExpanded = openStudent === row.id
                  const studentComplete = completedCount(row, catUnits)
                  return (
                    <div key={row.id}>
                      <DrillRow
                        level={1}
                        expanded={studentExpanded}
                        onToggle={() => toggleStudent(row.id)}
                        label={row.name}
                        right={
                          <span className="drill-stat">
                            {studentComplete}/{catUnits.length} complete
                          </span>
                        }
                      />
                      {studentExpanded && (
                        <div className="drill-children">
                          {catUnits.map((lesson) => {
                            const lessonExpanded = openLesson === lesson.id
                            const p = row.progressFor(lesson.id)
                            return (
                              <div key={lesson.id}>
                                <DrillRow
                                  level={2}
                                  expanded={lessonExpanded}
                                  onToggle={() => toggleLesson(lesson.id)}
                                  label={
                                    <>
                                      {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                                    </>
                                  }
                                  right={<StatusIcon progress={p} />}
                                />
                                {lessonExpanded && (
                                  <div className="drill-detail-wrap" style={{ '--level': 3 }}>
                                    <LessonDetailPanel progress={p} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// By Lesson: lessons grouped by category, with class-wide stats per lesson
// → student rows with their status on that lesson → lesson detail panel.
function ByLessonView({ rows, unitsByCategory, gradeBand, openLesson, toggleLesson, openStudent, toggleStudent }) {
  const groups = unitsByCategory
    .map(({ category, units: catUnits }) => ({
      category,
      units: gradeBand === 'all' ? catUnits : catUnits.filter((u) => u.gradeBand === gradeBand),
    }))
    .filter((g) => g.units.length > 0)

  return (
    <div className="drill-list">
      {groups.map(({ category, units: catUnits }) => (
        <div key={category} className="drill-group">
          <CategoryHeading level={0}>{category}</CategoryHeading>
          {catUnits.map((lesson) => {
            const expanded = openLesson === lesson.id
            const total = rows.length
            const completeN = rows.filter((r) => isComplete(r.progressFor(lesson.id))).length
            const attempted = rows.map((r) => r.progressFor(lesson.id)).filter((p) => (p?.quizAttempts ?? 0) > 0)
            const avgQuiz = attempted.length
              ? Math.round((attempted.reduce((s, p) => s + (p.bestQuizScore ?? 0), 0) / attempted.length) * 100)
              : null
            const flags = rows.filter((r) => isFlagged(r.progressFor(lesson.id))).length
            return (
              <div key={lesson.id}>
                <DrillRow
                  level={0}
                  expanded={expanded}
                  onToggle={() => toggleLesson(lesson.id)}
                  label={
                    <>
                      {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                    </>
                  }
                  right={
                    <span className="drill-row-right">
                      <span className="drill-stat">
                        {completeN}/{total} complete
                        {avgQuiz != null ? ` · avg quiz ${avgQuiz}%` : ''}
                      </span>
                      {flags > 0 && <span className="status-flag">{flags} ⚠</span>}
                    </span>
                  }
                />
                {expanded && (
                  <div className="drill-children">
                    {rows.map((row) => {
                      const studentExpanded = openStudent === row.id
                      const p = row.progressFor(lesson.id)
                      return (
                        <div key={row.id}>
                          <DrillRow
                            level={1}
                            expanded={studentExpanded}
                            onToggle={() => toggleStudent(row.id)}
                            label={row.name}
                            right={<StatusIcon progress={p} />}
                          />
                          {studentExpanded && (
                            <div className="drill-detail-wrap" style={{ '--level': 2 }}>
                              <LessonDetailPanel progress={p} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// --- page ---

const PIVOT_KEY = 'sportmediq:teacherPivot'
const PIVOTS = [
  { id: 'unit', label: 'By Unit' },
  { id: 'lesson', label: 'By Lesson' },
  { id: 'student', label: 'By Student' },
]

const GRADE_BAND_KEY = 'sportmediq:teacherGradeBand'
const GRADE_BANDS = [
  { id: 'all', label: 'All' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

export default function TeacherPage() {
  const auth = useAuth()
  if (!auth.role) return <LoginGate />
  return <TeacherDashboard auth={auth} />
}

function TeacherDashboard({ auth }) {
  useProgress() // include this device's live progress
  const { students } = useRoster()
  const teacherAssignments = useTeacherAssignments()
  const units = getAllUnits()
  const unitsByCategory = useMemo(() => getUnitsByCategory(), [])
  const usingMock = students.length === 0
  const [sortBy, setSortBy] = useState('name') // name | completed | flags

  const [pivot, setPivot] = useState(() => {
    try {
      return localStorage.getItem(PIVOT_KEY) || 'student'
    } catch {
      return 'student'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(PIVOT_KEY, pivot)
    } catch {
      // Storage full or blocked — pivot choice just won't persist.
    }
  }, [pivot])

  const [gradeBand, setGradeBand] = useState(() => {
    try {
      return localStorage.getItem(GRADE_BAND_KEY) || 'all'
    } catch {
      return 'all'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(GRADE_BAND_KEY, gradeBand)
    } catch {
      // Storage full or blocked — filter still works for this session.
    }
  }, [gradeBand])

  // A single drill path shared by every pivot: level 0 (student/category/
  // lesson depending on pivot), level 1, level 2. Switching pivots collapses
  // everything since the ids mean different things in each pivot.
  const [open0, setOpen0] = useState(null)
  const [open1, setOpen1] = useState(null)
  const [open2, setOpen2] = useState(null)
  useEffect(() => {
    setOpen0(null)
    setOpen1(null)
    setOpen2(null)
  }, [pivot])
  const toggle0 = (id) => {
    setOpen0((cur) => (cur === id ? null : id))
    setOpen1(null)
    setOpen2(null)
  }
  const toggle1 = (id) => {
    setOpen1((cur) => (cur === id ? null : id))
    setOpen2(null)
  }
  const toggle2 = (id) => {
    setOpen2((cur) => (cur === id ? null : id))
  }

  // Real students imported by code; the mock roster only appears until the
  // first real student is added. The last row is always live from this device.
  const rows = useMemo(() => {
    const studentRows = (usingMock ? mockRoster.students : students).map((s) => ({
      id: s.id,
      name: s.name,
      sid: s.sid ?? null,
      removable: !usingMock,
      progressFor: (unitId) => s.progress[unitId],
    }))
    studentRows.sort((a, b) => {
      if (sortBy === 'completed') {
        const d = completedCount(b, units) - completedCount(a, units)
        if (d !== 0) return d
      }
      if (sortBy === 'flags') {
        const d = flagCount(b, units) - flagCount(a, units)
        if (d !== 0) return d
      }
      return a.name.localeCompare(b.name)
    })
    return [
      ...studentRows,
      {
        id: 'local',
        name: 'You (this device)',
        sid: null,
        removable: false,
        progressFor: (unitId) => getUnitProgress(unitId),
      },
    ]
  }, [usingMock, students, units, sortBy])

  return (
    <div className="page">
      <SignedInBanner auth={auth} />
      <h1>Teacher dashboard</h1>
      <p className="empty-note">
        A lesson is complete when it's read, its flashcards are reviewed, and the best quiz
        score is at least {Math.round(PASS_THRESHOLD * 100)}%. Click any row to drill down to a
        student's reading time, scroll depth, and quiz/flashcard status. A ⚠ means a lesson was
        marked read with under 2 minutes of reading time or with less than 80% of it seen.
        {usingMock &&
          ' Showing sample students — add a real student below and the samples disappear.'}
      </p>

      <div className="grade-band-picker" role="group" aria-label="Pivot the roster view">
        {PIVOTS.map((p) => (
          <button
            key={p.id}
            className={pivot === p.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'}
            onClick={() => setPivot(p.id)}
            aria-pressed={pivot === p.id}
          >
            {p.label}
          </button>
        ))}
      </div>

      {pivot === 'lesson' && (
        <div className="grade-band-picker" role="group" aria-label="Filter lessons by grade">
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
      )}

      <div className="table-toolbar">
        <label>
          Sort by{' '}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="completed">Lessons completed</option>
            <option value="flags">Flags first</option>
          </select>
        </label>
        <span className="unit-actions">
          <button
            className="button"
            onClick={() => downloadDetailCsvMicrosoft(rows, units, teacherAssignments)}
          >
            Excel / Teams — details
          </button>
          <button
            className="button"
            onClick={() => downloadDetailCsvGoogle(rows, units, teacherAssignments)}
          >
            Google Sheets — details
          </button>
          <button
            className="button"
            onClick={() => downloadGradebookCsvMicrosoft(rows, units, teacherAssignments)}
          >
            Excel / Teams — gradebook
          </button>
          <button
            className="button"
            onClick={() => downloadGradebookCsvGoogle(rows, units, teacherAssignments)}
          >
            Google Classroom — gradebook
          </button>
        </span>
      </div>
      <p className="field-hint">
        Excel/Teams files open in Microsoft Office and upload to Teams; Google files import
        cleanly into Sheets, Docs and Classroom.
      </p>

      {pivot === 'student' && (
        <ByStudentView
          rows={rows}
          unitsByCategory={unitsByCategory}
          units={units}
          teacherAssignments={teacherAssignments}
          openStudent={open0}
          toggleStudent={toggle0}
          openLesson={open1}
          toggleLesson={toggle1}
        />
      )}
      {pivot === 'unit' && (
        <ByUnitView
          rows={rows}
          unitsByCategory={unitsByCategory}
          openCategory={open0}
          toggleCategory={toggle0}
          openStudent={open1}
          toggleStudent={toggle1}
          openLesson={open2}
          toggleLesson={toggle2}
        />
      )}
      {pivot === 'lesson' && (
        <ByLessonView
          rows={rows}
          unitsByCategory={unitsByCategory}
          gradeBand={gradeBand}
          openLesson={open0}
          toggleLesson={toggle0}
          openStudent={open1}
          toggleStudent={toggle1}
        />
      )}

      {auth.role === 'admin' && <AdminPanel issued={auth.issued} />}
      <DeviceSetupPanel auth={auth} />
      <ClassManager />
      <TeacherAssignments />
      <AddStudentForm />
    </div>
  )
}
