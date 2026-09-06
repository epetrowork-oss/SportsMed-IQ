import { PASS_THRESHOLD } from './progress.js'

// One next-action rule shared by home, results and review screens.
export function nextLearningStep(unitId, progress = {}, controls) {
  const root = `/unit/${unitId}`
  if (!progress.lessonRead) return { to: root, label: 'Continue reading', stage: 'read' }
  if ((progress.bestQuizScore ?? 0) < PASS_THRESHOLD && controls?.quizzes !== false) {
    return { to: `${root}/quiz`, label: 'Take quiz', stage: 'quiz' }
  }
  if (!progress.flashcardsReviewed) return { to: `${root}/flashcards`, label: 'Review flashcards', stage: 'cards' }
  if ((progress.bestQuizScore ?? 0) < PASS_THRESHOLD) return { to: '/', label: 'Back to my learning', stage: 'waiting' }
  return { to: '/', label: 'Back to my learning', stage: 'complete' }
}
