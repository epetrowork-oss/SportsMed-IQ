import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStudentSession, logoutStudent } from '../lib/studentSession.js'

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return online
}

export default function Layout() {
  const online = useOnlineStatus()
  const { session } = useStudentSession()

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">+</span>
          SportMedIQ
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/lessons">Library</NavLink>
          <NavLink to="/sync">Sync</NavLink>
          <NavLink to="/teacher">Teacher</NavLink>
          {!session && <NavLink to="/login">Log in</NavLink>}
        </nav>
        {session && (
          <span className="student-session-badge">
            <NavLink to="/login" className="student-session-name">
              {session.name}
            </NavLink>
            <button className="button student-session-signout" onClick={logoutStudent}>
              Sign out
            </button>
          </span>
        )}
        {!online && (
          <span className="offline-badge" title="You're offline — everything still works">
            Offline
          </span>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
