import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStudentSession, logoutStudent } from '../lib/studentSession.js'
import { useSignedIn } from './RequireSignIn.jsx'

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
  // Those links all lead to pages RequireSignIn bounces back to /login, so
  // showing them before sign-in would just be four ways to reach the same
  // door. Locked, the header offers the two doors that actually open.
  const { signedIn, role } = useSignedIn()
  const { pathname } = useLocation()
  const teacherView = pathname === '/teacher'
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={(e) => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a>
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">+</span>
          SportMedIQ
        </NavLink>
        <nav className="app-nav" aria-label="Main navigation">
          {signedIn ? <>
            {teacherView ? <>
              <NavLink to="/teacher">Workspace</NavLink>
              <NavLink to="/lessons">Lesson library</NavLink>
            </> : <>
              <NavLink to="/" end>My learning</NavLink>
              <NavLink to="/lessons">Library</NavLink>
              <NavLink to="/achievements">Progress</NavLink>
              <NavLink to="/sync">Share</NavLink>
            </>}
          </> : <>
            <NavLink to="/login">Student</NavLink>
            <NavLink to="/teacher">Teacher</NavLink>
          </>}
        </nav>
        {signedIn && <details className="account-menu" key={pathname}>
          <summary>{session?.name || 'Teacher'} <span aria-hidden="true">⌄</span></summary>
          <div className="account-dropdown">
            {session && <NavLink to="/login">My account</NavLink>}
            {role && <NavLink to="/teacher">Teacher workspace</NavLink>}
            {teacherView && <NavLink to="/">My learning</NavLink>}
            <span className="field-hint">Progress saves on this device</span>
            {session && <button className="button" onClick={logoutStudent}>Sign out</button>}
          </div>
        </details>}
        {!online && (
          <span className="offline-badge" title="You're offline — everything still works">
            Offline
          </span>
        )}
      </header>
      <main id="main-content" tabIndex={-1} className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
