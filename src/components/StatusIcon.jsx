import { statusInfo, isFlagged } from '../lib/status.js'

// Small inline status label used wherever a lesson's progress status shows
// up: icon + label colored via .status-{done,progress,none}, plus an
// optional ⚠ for a likely click-through.
export default function StatusIcon({ progress }) {
  const info = statusInfo(progress)
  const flagged = isFlagged(progress)
  return (
    <span className={`status-dot status-${info.key}`}>
      <span aria-hidden="true">{info.icon}</span> {info.label}
      {flagged && (
        <span className="status-flag" title="Marked read too quickly or without seeing all of it">
          {' '}
          ⚠
        </span>
      )}
    </span>
  )
}
