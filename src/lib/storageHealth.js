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

// Which stores currently hold a change localStorage refused. Per store, not
// one flag: a quota-limited browser can reject a large class write and then
// accept a small assignment write moments later, and a single flag would read
// that second success as "all clear" while the class change is still
// stranded. A store clears itself only by writing successfully -- which, under
// "storage is the truth", is also the moment its stranded change is gone.
const failing = new Set()
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function reportStorageWrite(store, ok) {
  const was = failing.has(store)
  if (ok === !was) return
  if (ok) failing.delete(store)
  else failing.add(store)
  notify()
}

export function storageIsFailing() {
  return failing.size > 0
}

// Which stores are affected, for a message that can say what is at risk.
export function failingStores() {
  return [...failing]
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStorageHealth() {
  return useSyncExternalStore(subscribe, () => failing.size > 0)
}
