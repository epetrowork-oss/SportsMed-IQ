import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireSignIn from './components/RequireSignIn.jsx'
import HomePage from './pages/HomePage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import UnitPage from './pages/UnitPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import FlashcardsPage from './pages/FlashcardsPage.jsx'
import TeacherPage from './pages/TeacherPage.jsx'
import SyncPage from './pages/SyncPage.jsx'
import AchievementsPage from './pages/AchievementsPage.jsx'
import StudentLoginPage from './pages/StudentLoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Sign-in and the teacher dashboard are the only doors that open
            without a session — everything else is class material and sits
            behind RequireSignIn. */}
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route element={<RequireSignIn />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lessons" element={<LibraryPage />} />
          <Route path="/unit/:unitId" element={<UnitPage />} />
          <Route path="/unit/:unitId/quiz" element={<QuizPage />} />
          <Route path="/unit/:unitId/flashcards" element={<FlashcardsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
