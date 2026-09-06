// App-initiated scrolling must never advance the reading high-water mark.
// Wait for two quiet animation frames: scroll events run before animation-frame
// callbacks, and each suppressed event restarts the quiet-frame count. No timer
// guesses, mount/resize samples, or teardown measurements of a replacement DOM.
export function createScrollGuard(requestFrame) {
  let ignoring = false
  let quietFrames = 0
  let draining = false
  function drain() {
    if (++quietFrames >= 2) {
      ignoring = false
      draining = false
    } else requestFrame(drain)
  }
  return {
    run(action) {
      ignoring = true
      quietFrames = 0
      try { return action() } finally {
        if (!draining) {
          draining = true
          requestFrame(drain)
        }
      }
    },
    ignoreScroll() {
      if (ignoring) quietFrames = 0
      return ignoring
    },
  }
}

export const appScrollGuard = createScrollGuard((callback) => requestAnimationFrame(callback))

export function observeScrollDepth({ target, element, record, guard = appScrollGuard,
  schedule = setInterval, cancel = clearInterval }) {
  let maxPct = 0
  let savedPct = 0
  const measure = () => {
    if (guard.ignoreScroll()) return
    const el = element()
    const pct = el.scrollHeight <= el.clientHeight ? 100
      : Math.min(100, ((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100)
    maxPct = Math.max(maxPct, pct)
  }
  const flush = () => {
    if (maxPct > savedPct) {
      record(maxPct)
      savedPct = maxPct
    }
  }
  // Only scroll events can add evidence. Initial layout, resize, and route
  // cleanup can otherwise measure the wrong page or a not-yet-sized image.
  target.addEventListener('scroll', measure, { passive: true })
  const interval = schedule(flush, 2000)
  return () => {
    target.removeEventListener('scroll', measure)
    cancel(interval)
    flush()
  }
}
