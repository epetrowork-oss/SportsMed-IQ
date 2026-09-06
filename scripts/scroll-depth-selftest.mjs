import assert from 'node:assert/strict'
import { createScrollGuard, observeScrollDepth } from '../src/lib/scrollDepth.js'

const frames = []
const guard = createScrollGuard((cb) => frames.push(cb))
const frame = () => frames.splice(0).forEach((cb) => cb())
const listeners = new Map()
const target = { addEventListener: (name, cb) => listeners.set(name, cb), removeEventListener: (name) => listeners.delete(name) }
const scroll = () => listeners.get('scroll')?.()
let el = { scrollTop: 9000, clientHeight: 1000, scrollHeight: 10000 }
const records = []
let flush
const stop = observeScrollDepth({ target, element: () => el, guard, record: (pct) => records.push(pct), schedule: (cb) => { flush = cb; return 1 }, cancel() {} })
flush()
assert.deepEqual(records, [], 'Mount must not sample the previous route position')
guard.run(() => { el = { scrollTop: 0, clientHeight: 1000, scrollHeight: 1000 } })
scroll(); frame(); scroll(); frame(); frame(); flush()
assert.deepEqual(records, [], 'Reset/layout scrolls must not mark untouched lesson complete')
el.scrollHeight = 10000
for (const top of [2000, 4000, 6500, 9000]) {
  guard.run(() => { el.scrollTop = top })
  scroll(); frame(); scroll(); frame(); frame(); flush()
}
assert.deepEqual(records, [], 'Every contents jump must leave the depth record unchanged')
// A delayed burst extends suppression instead of racing a timer.
guard.run(() => { el.scrollTop = 9000 })
frame(); scroll(); frame(); scroll(); frame(); frame(); flush()
assert.deepEqual(records, [], 'Late programmatic events extend the drain')
el.scrollTop = 1000; scroll(); flush()
assert.deepEqual(records, [20], 'Real user scroll preserves the original depth formula')
el.scrollTop = 9000; scroll(); flush()
assert.deepEqual(records, [20, 100], 'Real bottom scroll records 100')
stop()
// Cleanup must never sample the next route DOM, even if it fits one viewport.
records.length = 0
const stop2 = observeScrollDepth({ target, element: () => el, guard, record: (pct) => records.push(pct), schedule: (cb) => { flush = cb; return 2 }, cancel() {} })
el = { scrollTop: 0, clientHeight: 1000, scrollHeight: 1000 }
flush(); flush(); flush(); stop2()
assert.deepEqual(records, [], 'Untouched and unmounted lesson records no unearned depth')
console.log('Scroll-depth regression checks: 7 scenarios passed (simulated event/frame lifecycle).')
