// State + server-render checks. These do not replace browser layout or PWA tests.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const storage = new Map()
globalThis.localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: (k) => storage.delete(k) }
globalThis.window = { addEventListener() {}, removeEventListener() {}, location: { origin: 'https://example.test' } }
const originalError = console.error
console.error = (...args) => { if (!String(args[0]).includes('useLayoutEffect does nothing on the server')) originalError(...args) }
const server = await createServer({
  optimizeDeps: { noDiscovery: true, include: [] }, configFile: false, base: '/SportsMed-IQ/', server: { middlewareMode: true, hmr: false },
  esbuild: { jsx: 'automatic' },
  plugins: [{ name: 'test-server-snapshots', enforce: 'pre', transform(code, id) {
    if (!id.includes('/src/lib/') || !code.includes("import { useSyncExternalStore } from 'react'")) return
    // Supply a server snapshot only inside the test loader; production remains client-only.
    return code.replace("import { useSyncExternalStore } from 'react'", "import { useSyncExternalStore as reactUseSyncExternalStore } from 'react'\nconst useSyncExternalStore = (subscribe, snapshot) => reactUseSyncExternalStore(subscribe, snapshot, snapshot)")
  }}],
})
let checks = 0
function check(value, message) { assert.ok(value, message); checks++ }
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const auth = await server.ssrLoadModule('/src/lib/auth.js')
  const classes = await server.ssrLoadModule('/src/lib/classes.js')
  const sessions = await server.ssrLoadModule('/src/lib/studentSession.js')
  const progress = await server.ssrLoadModule('/src/lib/progress.js')
  const { nextLearningStep } = await server.ssrLoadModule('/src/lib/learningPath.js')
  const { getAllUnits } = await server.ssrLoadModule('/src/content/index.js')
  const share = await server.ssrLoadModule('/src/lib/share.js')
  const assignments = await server.ssrLoadModule('/src/lib/teacherAssignments.js')
  const decode = await server.ssrLoadModule('/src/lib/assignments.js')
  const render = (path) => renderToString(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(App))).replace(/<!--.*?-->/g, '')
  check(render('/login').includes('Join your class'), 'First-time student entry renders')
  check(!render('/lessons').includes('Lesson library'), 'Signed-out lesson library stays gated')
  await auth.setupAdmin('test-only-admin-passcode')
  for (const [view, expected] of [['overview', 'Your teaching overview'], ['classes', 'Create a class'], ['assignments', 'Assignments'], ['reports', 'Student progress'], ['settings', 'Device setup']]) {
    check(render(`/teacher?view=${view}`).includes(expected), `Teacher ${view} renders`)
  }
  check(!render('/teacher').includes('Download CSV'), 'Overview does not show report controls')
  check(render('/teacher?view=reports').includes('Excel / Teams'), 'Reports default to Microsoft export')
  const units = getAllUnits()
  const unit = units.find((u) => u.id === 'ankle-sprain')
  const cls = classes.createClass('Review class')
  const student = classes.addStudent(cls.cid, 'Learner A')
  classes.updateClassSettings(cls.cid, { units: [unit.id], quizzes: false, assignments: true })
  const loginCode = await classes.buildClassLoginCode(cls.cid)
  await sessions.importClassLoginCode(loginCode)
  auth.signOut()
  await sessions.loginStudent(cls.cid, student.sid, student.pin)
  check(render('/').includes('Welcome back, Learner A'), 'Signed-in home renders')
  check(!render('/').includes('Teacher workspace'), 'Student navigation omits teacher workspace')
  check(render('/lessons').includes('1 of 1 lessons'), 'Class-restricted library shows only allowed lesson')
  check(render(`/unit/${unit.id}/quiz`).includes('Quizzes aren'), 'Closed quiz stays gated')
  check(render('/unit/concussion').includes('This lesson isn'), 'Closed lesson stays gated')
  check(render('/achievements').includes('Your progress'), 'Achievements render')
  check(render('/sync').includes('Share your learning'), 'Sharing renders')
  check(nextLearningStep(unit.id).stage === 'read', 'First step is reading')
  progress.markLessonRead(unit.id)
  check(nextLearningStep(unit.id, progress.getUnitProgress(unit.id), sessions.getClassControls()).stage === 'cards', 'Closed quiz leads to cards')
  check(render('/').includes(`/unit/${unit.id}/flashcards`), 'Home resumes the next available step')
  progress.markFlashcardsReviewed(unit.id)
  check(nextLearningStep(unit.id, progress.getUnitProgress(unit.id), sessions.getClassControls()).stage === 'waiting', 'Closed quiz does not falsely complete lesson')
  classes.updateClassSettings(cls.cid, { units: null, quizzes: true })
  await sessions.importClassLoginCode(await classes.buildClassLoginCode(cls.cid))
  check(nextLearningStep(unit.id, progress.getUnitProgress(unit.id), sessions.getClassControls()).stage === 'quiz', 'Reopened quiz becomes next step')
  progress.recordQuizResult(unit.id, 8, 8)
  check(nextLearningStep(unit.id, progress.getUnitProgress(unit.id)).stage === 'complete', 'All three requirements complete the lesson')
  const assignment = await assignments.saveTeacherAssignment({ name: 'Practice', unitIds: [unit.id], mode: 'focus' })
  progress.importAssignment(await decode.decodeAssignment(assignment.code))
  check(render('/').includes('Practice'), 'Imported assignment appears on home')
  // Render all 54 lessons and their quiz/card screens to catch content-dependent failures.
  for (const u of units) {
    for (const suffix of ['', '/quiz', '/flashcards']) check(render(`/unit/${u.id}${suffix}`).includes('Lesson progress'), `${u.id}${suffix} renders`)
  }
  const code = await share.encodeProgress('Learner A', { [unit.id]: progress.getUnitProgress(unit.id) })
  const decoded = await share.decodeProgressCode(code)
  check(decoded.units[unit.id].bestQuizScore === 1, 'Progress code preserves quiz completion')
  const before = progress.getUnitProgress(unit.id).bestQuizScore
  progress.mergeProgress('Learner A', { [unit.id]: { bestQuizScore: .2, lessonRead: false } })
  check(progress.getUnitProgress(unit.id).bestQuizScore === before, 'Import preserves better existing score')
  const print = await server.ssrLoadModule('/src/lib/print.js')
  const { getActivitiesForUnit } = await server.ssrLoadModule('/src/content/activities.js')
  let printed = ''
  window.open = () => ({ document: { open() {}, write(html) { printed = html }, close() {} } })
  check(print.printLessonPacket(unit), 'Lesson print document opens')
  check(printed.includes(unit.title) && printed.includes('color: #111'), 'Lesson packet has content and monochrome print style')
  const practicalUnit = units.find((u) => getActivitiesForUnit(u).length > 0)
  check(print.printPracticalPacket(practicalUnit, getActivitiesForUnit(practicalUnit)), 'Practical packet opens')
  check(printed.includes('Class period'), 'Practical packet includes student response information')
  window.open = () => null
  check(!print.printLessonPacket(unit), 'Blocked print popup reports failure')
  console.log(`Redesign state/render checks: ${checks} passed (browser QA still required).`)
} finally { console.error = originalError; await server.close() }
