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
// Stores another Teacher tab has told us it could not write. Kept apart from
// this tab's own failures because only the tab that owns stranded data can
// clear it: a successful write here says nothing about what is stuck there.
const failingElsewhere = new Set()
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

// A refused write emits no `storage` event -- nothing was written -- so a
// second Teacher tab would otherwise never learn that the first one is
// holding changes localStorage rejected. It would then show no warning and
// report a backup as complete while silently omitting them. This is the one
// piece of cross-tab state that cannot ride on storage, because its whole
// subject is a write that did not reach storage.
const CHANNEL = 'sportmediq:storage-health:v1'

const channel = (() => {
  try {
    if (typeof BroadcastChannel !== 'function') return null
    const bc = new BroadcastChannel(CHANNEL)
    // Node's implementation keeps the event loop alive; browsers have no
    // unref and do not need one.
    bc.unref?.()
    bc.onmessage = (event) => {
      const { store, ok } = event.data ?? {}
      if (typeof store !== 'string') return
      const was = failingElsewhere.has(store)
      if (ok === !was) return
      if (ok) failingElsewhere.delete(store)
      else failingElsewhere.add(store)
      notify()
    }
    return bc
  } catch {
    return null
  }
})()

export function reportStorageWrite(store, ok) {
  const was = failing.has(store)
  if (ok === !was) return
  if (ok) failing.delete(store)
  else failing.add(store)
  try {
    channel?.postMessage({ store, ok })
  } catch {
    // A tab that cannot broadcast still shows its own warning.
  }
  notify()
}

export function storageIsFailing() {
  return failing.size > 0 || failingElsewhere.size > 0
}

// Which stores are affected, for a message that can say what is at risk.
export function failingStores() {
  return [...new Set([...failing, ...failingElsewhere])]
}

// True when the trouble is in another tab rather than this one, so the
// warning can say where to go and look.
export function failingInAnotherTab() {
  return failingElsewhere.size > 0
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStorageHealth() {
  return useSyncExternalStore(subscribe, () => failing.size > 0 || failingElsewhere.size > 0)
}
