import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import UnitPage from './pages/UnitPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import FlashcardsPage from './pages/FlashcardsPage.jsx'
import TeacherPage from './pages/TeacherPage.jsx'
import SyncPage from './pages/SyncPage.jsx'
import AchievementsPage from './pages/AchievementsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lessons" element={<LibraryPage />} />
        <Route path="/unit/:unitId" element={<UnitPage />} />
        <Route path="/unit/:unitId/quiz" element={<QuizPage />} />
        <Route path="/unit/:unitId/flashcards" element={<FlashcardsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
