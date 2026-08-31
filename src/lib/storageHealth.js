// Whether this browser is actually saving.
//
// Every store here writes to localStorage and, when the write is refused --
// a full quota, a locked-down or private window -- keeps the new state in
// memory so the session goes on working. That is the right thing to do and it
// used to be done in silence, which is not: the teacher goes on adding
// students, printing slips and making backups, and finds out at the next
// reload that none of it was written down.
//
// So the stores report the outcome here, and the dashboard says so. That is
// what lets everything else keep a single simple rule: **what is in storage is
// the truth**, with a refused write surfaced rather than compensated for.
//
// Two ways of knowing, deliberately kept small:
//
//   1. What this tab's own writes did (`reportStorageWrite`), which is what
//      the warning banner reflects.
//   2. Whether storage will take a write AT ALL, asked directly at the moment
//      it matters (`storageAcceptsWrites`).
//
// The second replaced a cross-tab broadcast of the first. Sharing failure
// health between tabs sounds right and does not end: it needs per-tab
// identity (two failing tabs, one recovers, and a shared set clears while the
// other is still stranded), a join handshake (a tab opened after the failure
// hears nothing), and then liveness (a stranded tab closes and the rest warn
// forever) -- a consensus protocol growing inside an offline app to describe
// a browser-wide condition. Asking storage is one line, answers for every tab
// at once, and cannot go stale.
//
// What the probe does not catch: a tab holding a change from an earlier
// outage that storage has since recovered from. That tab shows its own
// warning and its next write lands; if it never writes again the change was
// never going to survive the tab anyway. Documented in docs/ACCOUNTS.md
// rather than pretended away.

import { useSyncExternalStore } from 'react'

// Which stores in THIS tab are in trouble, and WHICH TROUBLE. Per store, not
// one flag: a quota-limited browser can reject a large class write and then
// accept a small assignment write moments later, and a single flag would read
// that second success as "all clear" while the class change is still
// stranded.
//
// Two states, because they call for different things from the teacher:
//
//   'stranded'  a refused change is still here in memory. The dashboard shows
//               it, it is missing from a backup taken now, and it dies with
//               the tab.
//   'lost'      that change is gone from memory too. Every write rebuilds
//               state from storage, so a later commit -- even one that lands,
//               even a restore that merges nothing -- overwrites what the
//               refused write was holding. Nothing anywhere has it now, and
//               the teacher has to redo it rather than hurry to save it.
//
// Telling a teacher a change is "only in this tab" once it is not even that
// sends them looking for something that no longer exists.
//
// A store clears itself only by writing successfully. That clears 'lost' too,
// which is deliberate: the alternative is a warning that never goes away, and
// round 16 is the record of where perpetual cross-tab warnings lead. The
// window in which it is shown is the window in which it is actionable.
const failing = new Map()
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function reportStorageWrite(store, ok) {
  if (ok) {
    if (!failing.delete(store)) return
  } else {
    if (failing.get(store) === 'stranded') return
    failing.set(store, 'stranded')
  }
  notify()
}

// A commit rebuilt this store's state from storage, discarding a change an
// earlier refused write was holding in memory. Called only when there was one:
// a store that was not stranded has nothing to lose.
export function reportStorageDiscard(store) {
  if (failing.get(store) !== 'stranded') return
  failing.set(store, 'lost')
  notify()
}

export function storageIsFailing() {
  return failing.size > 0
}

// Which stores are affected, for a message that can say what is at risk.
export function failingStores() {
  return [...failing.keys()]
}

// Stores whose refused change is gone rather than merely unsaved.
export function lostStores() {
  return [...failing].filter(([, state]) => state === 'lost').map(([store]) => store)
}

// Ask storage directly: a probe write and read-back, then cleaned up.
//
// Read this signal in ONE direction only. A probe that fails proves storage is
// refusing writes; a probe that succeeds proves almost nothing, because quota
// rejection is size-dependent — a browser near its limit can refuse a class
// roster and accept one byte in the same breath. So this can raise the alarm
// and must never be used to certify that nothing is missing.
//
// That asymmetry is the whole reason the completeness claim was dropped rather
// than re-derived: what another tab is holding in memory after a rejected
// write is not observable from here at all, and no probe of any size changes
// that.
const PROBE_KEY = 'sportmediq:storageProbe:v1'

export function storageAcceptsWrites() {
  try {
    localStorage.setItem(PROBE_KEY, '1')
    const readBack = localStorage.getItem(PROBE_KEY) === '1'
    localStorage.removeItem(PROBE_KEY)
    return readBack
  } catch {
    return false
  }
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// A string, not an object: useSyncExternalStore compares snapshots by
// identity, and a fresh object every render is an infinite loop.
function healthSnapshot() {
  if (failing.size === 0) return 'ok'
  return [...failing.values()].includes('lost') ? 'lost' : 'stranded'
}

export function useStorageHealth() {
  return useSyncExternalStore(subscribe, healthSnapshot)
}
