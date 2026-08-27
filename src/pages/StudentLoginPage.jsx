import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  useStudentSession,
  importClassLoginCode,
  loginStudent,
  logoutStudent,
  removeImportedClass,
  canRecoverPreviousWork,
  recoverPreviousWork,
} from '../lib/studentSession.js'

function ImportClassCode({ onImported }) {
  const [pasted, setPasted] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  async function submit() {
    try {
      const cls = await importClassLoginCode(pasted)
      setPasted('')
      setResult({ ok: true, message: `${cls.name} added — now pick your name below.` })
      onImported?.(cls.cid)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section>
      <h2>Have a class login code?</h2>
      <p className="field-hint">
        Your teacher shared one code for the whole class — paste it here.
      </p>
      <textarea
        className="code-box"
        placeholder="Paste your class login code here (starts with SMIQC1)"
        value={pasted}
        onChange={(e) => {
          setPasted(e.target.value)
          setResult(null)
        }}
        rows={4}
      />
      <div className="unit-actions">
        <button className="button button-primary" onClick={submit} disabled={!pasted.trim()}>
          Add class
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

function RemoveClassControl({ cid, onRemove }) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  if (confirmRemove) {
    return (
      <span className="unit-actions">
        <button className="button button-danger" onClick={() => onRemove(cid)}>
          Confirm remove class
        </button>
        <button className="button" onClick={() => setConfirmRemove(false)}>
          Cancel
        </button>
      </span>
    )
  }
  return (
    <button className="remove-button" onClick={() => setConfirmRemove(true)} aria-label="Remove this class" title="Remove this class">
      ✕
    </button>
  )
}

function PickName({ cls, onRemove, next }) {
  const [sid, setSid] = useState(cls.students[0]?.sid ?? '')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit() {
    try {
      await loginStudent(cls.cid, sid, pin)
      // If this device still holds work saved under an earlier PIN, stay here
      // so the student can bring it over before moving on.
      // Otherwise go where they were headed when the lock sent them here, so
      // a link to one lesson still opens that lesson.
      if (!canRecoverPreviousWork()) navigate(next || '/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="class-code-entry">
      <div className="assignment-card-header">
        <h3>{cls.name}</h3>
        <RemoveClassControl cid={cls.cid} onRemove={onRemove} />
      </div>
      <label className="field-hint" htmlFor={`pick-name-${cls.cid}`}>
        Your name
      </label>
      <select
        id={`pick-name-${cls.cid}`}
        className="text-input"
        value={sid}
        onChange={(e) => {
          setSid(e.target.value)
          setError('')
        }}
      >
        {cls.students.map((s) => (
          <option key={s.sid} value={s.sid}>
            {s.name}
          </option>
        ))}
      </select>
      <label className="field-hint" htmlFor={`pick-pin-${cls.cid}`}>
        Your PIN
      </label>
      <input
        id={`pick-pin-${cls.cid}`}
        className="text-input"
        type="text"
        placeholder="Your PIN — looks like MAPLE42"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value)
          setError('')
        }}
      />
      <div className="unit-actions">
        <button className="button button-primary" onClick={submit} disabled={!sid || !pin.trim()}>
          Sign in
        </button>
      </div>
      {error && (
        <p className="import-error" role="status">
          {error}
        </p>
      )}
    </section>
  )
}

// Shown when the device holds progress for this student under a different PIN
// key — what a teacher-issued PIN reset leaves behind. Typing the old PIN is
// what proves the work is theirs; nothing is moved without it.
function RecoverPreviousWork() {
  const [previousPin, setPreviousPin] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  async function submit() {
    try {
      await recoverPreviousWork(previousPin)
      setPreviousPin('')
      setResult({ ok: true, message: 'Your earlier work has been added to this account.' })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section className="class-code-entry">
      <h3>Did your teacher give you a new PIN?</h3>
      <p className="field-hint">
        There's earlier work saved on this device. Type the PIN you used before and it will move
        across — your lessons, quiz scores and streak all come with it.
      </p>
      <div className="class-code-entry-row">
        <label htmlFor="previous-pin" className="sr-only">
          Your previous PIN
        </label>
        <input
          id="previous-pin"
          className="text-input"
          type="text"
          placeholder="Your previous PIN"
          value={previousPin}
          onChange={(e) => {
            setPreviousPin(e.target.value)
            setResult(null)
          }}
        />
        <button className="button button-primary" onClick={submit} disabled={!previousPin.trim()}>
          Bring it over
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

function SignedIn({ session, controls, next }) {
  const recoverable = canRecoverPreviousWork()
  return (
    <div className="page page-narrow">
      <h1>Student sign-in</h1>
      <p>
        You're signed in as <strong>{session.name}</strong> ({session.sid}) — {controls?.className}
      </p>
      {recoverable && <RecoverPreviousWork />}
      <div className="unit-actions">
        <button className="button button-primary" onClick={logoutStudent}>
          Sign out
        </button>
        <Link className="button" to={next || '/'}>
          {next ? 'Continue' : 'Home'}
        </Link>
      </div>
    </div>
  )
}

export default function StudentLoginPage() {
  const { classes, session, controls } = useStudentSession()
  const [picking, setPicking] = useState(null) // cid of the class the picker is showing, when > 1 class
  // Set by RequireSignIn when it bounced someone here from a locked page.
  // Never trust it as a URL to anywhere: only in-app paths are followed, so a
  // crafted link cannot use the login page as an open redirect.
  const location = useLocation()
  const requested = location.state?.from
  const next =
    typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//')
      ? requested
      : ''

  if (session) return <SignedIn session={session} controls={controls} next={next} />

  const activeClasses = classes
  const shownClass =
    activeClasses.length <= 1
      ? activeClasses[0] ?? null
      : activeClasses.find((c) => c.cid === picking) ?? null

  return (
    <div className="page page-narrow">
      <h1>Student sign-in</h1>
      {next && (
        <p className="import-error" role="status">
          Sign in to open the lessons.
        </p>
      )}
      <p className="field-hint">
        No account, no email — your teacher gave you a login name and PIN, and your progress saves
        on this device (even offline).
      </p>
      <p className="field-hint">
        Teachers: <Link to="/teacher">sign in to the teacher dashboard</Link>.
      </p>

      <ImportClassCode onImported={(cid) => setPicking(cid)} />

      {activeClasses.length > 1 && !shownClass && (
        <section>
          <h2>Pick your class</h2>
          <div className="unit-actions">
            {activeClasses.map((c) => (
              <button key={c.cid} className="button" onClick={() => setPicking(c.cid)}>
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {shownClass && (
        <PickName
          cls={shownClass}
          next={next}
          onRemove={(cid) => {
            removeImportedClass(cid)
            setPicking(null)
          }}
        />
      )}
    </div>
  )
}
