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
// Two things are tracked, and they are NOT two values of one state -- that
// was the mistake, and it made the warning disappear exactly when it mattered:
//
//   stranded    a refused change is here in memory right now. Provable: the
//               snapshot is read from storage, so it is not in storage, and a
//               backup taken now does not have it. Current health -- every
//               write changes it.
//   unverified  a refused change this tab no longer holds. History, not
//               health: it happened and cannot un-happen, so a later write
//               cannot clear it.
//
// `unverified`, not `lost`, and the difference is a claim this code cannot
// make. When state is replaced by something that is not the refused payload,
// what is known is that this tab can no longer account for that change -- NOT
// that it is missing from storage. A later write can carry it: refuse a
// restore of X, then restore X+Y successfully, and X is in storage while the
// states never matched. And the opposite is equally possible: refuse a
// DELETION, and a later write that contains the record again has undone it.
// Telling the two apart needs a diff of the change rather than the state, so
// the app says what it knows -- this could not be saved and cannot be
// accounted for here, go and check -- rather than pronouncing it gone.
//
// Keeping them on one axis meant the next write decided what the teacher was
// told about the previous one: a write that landed deleted the entry (banner
// gone, work gone, teacher never told), and a write that was refused left the
// state reading "stranded" (banner says the work is still in this tab, when
// what is in the tab is the NEW change and the old one is gone).
//
// An unverified change clears only when the teacher says so, PER STORE. That
// is the one thing that settles it -- they have looked, and redone the work or
// found it already there -- and it is bounded, unlike round 16's cross-tab
// warnings, because it lives in this tab's memory and dies with the tab. Per
// store because a teacher who has checked their class list has established
// nothing about their imported progress.
const stranded = new Set()
const unverified = new Set()
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function reportStorageWrite(store, ok) {
  if (ok) {
    if (!stranded.delete(store)) return
  } else {
    if (stranded.has(store)) return
    stranded.add(store)
  }
  notify()
}

// This store's in-memory state was replaced -- by a commit rebuilding from
// storage, or by another tab's `storage` event -- by something that is not
// the change a refused write was holding. This tab can no longer account for
// that change.
//
// A no-op unless the store is actually stranded: a store with nothing held
// here has nothing to be unsure about, which is what keeps an ordinary write
// silent.
export function reportStorageDiscard(store) {
  if (!stranded.delete(store)) return
  unverified.add(store)
  notify()
}

// The teacher has checked this part of the device -- redone the work, or found
// it already there. The only thing that settles it, and it settles only the
// store named: checking a class list establishes nothing about imported
// progress, so there is no clear-everything call.
export function acknowledgeLoss(store) {
  if (!unverified.delete(store)) return
  notify()
}

export function storageIsFailing() {
  return stranded.size > 0 || unverified.size > 0
}

// Which stores are affected, for a message that can say what is at risk.
export function failingStores() {
  return [...new Set([...stranded, ...unverified])]
}

// Stores holding a refused change right now -- provably not in storage.
export function strandedStores() {
  return [...stranded]
}

// Stores whose refused change this tab can no longer account for.
export function unverifiedStores() {
  return [...unverified]
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
// identity, and a fresh object every render is an infinite loop. It encodes
// MEMBERSHIP, not just a category, so that a second store joining either set
// re-renders the banners that name them. Callers read the lists themselves;
// this is the change key.
function healthSnapshot() {
  return `${[...stranded].sort().join(',')}|${[...unverified].sort().join(',')}`
}

export function useStorageHealth() {
  return useSyncExternalStore(subscribe, healthSnapshot)
}
