// Whether this browser is actually saving.
//
// Every store here writes to localStorage and, when the write is refused --
// a full quota, a locked-down or private window -- keeps the new state in
// memory so the session goes on working. That is the right thing to do and it
// used to be done in silence, which is not: the teacher goes on adding
// students, printing slips and making backups, and finds out at the next
// reload that none of it was written down.
//
// So the stores report the outcome here instead, and the dashboard says so.
// This is the piece that lets everything else keep a single simple rule:
// **what is in storage is the truth**. No store has to guess whether its own
// memory is ahead because a write failed or stale because another tab deleted
// something -- a question that cannot be answered from the two states alone,
// and answering it wrongly resurrects deleted classes.

import { useSyncExternalStore } from 'react'

let failing = false
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function reportStorageWrite(ok) {
  if (failing === !ok) return
  failing = !ok
  notify()
}

export function storageIsFailing() {
  return failing
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStorageHealth() {
  return useSyncExternalStore(subscribe, () => failing)
}
