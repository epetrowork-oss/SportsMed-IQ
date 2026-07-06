import { useState } from 'react'
import {
  useProgress,
  setStudentName,
  mergeProgress,
} from '../lib/progress.js'
import { encodeProgress, decodeProgressCode } from '../lib/share.js'
import { getUnit } from '../content/index.js'

export default function SyncPage() {
  const { name, units } = useProgress()
  const [copied, setCopied] = useState(false)
  const [pasted, setPasted] = useState('')
  const [importResult, setImportResult] = useState(null) // { ok, message }

  const code = encodeProgress(name, units)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — the textarea is selectable.
    }
  }

  function importCode() {
    try {
      const { name: importedName, units: importedUnits } = decodeProgressCode(pasted)
      mergeProgress(importedName, importedUnits)
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
          placeholder="Paste a progress code here (starts with SMIQ1.)"
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
    </div>
  )
}
