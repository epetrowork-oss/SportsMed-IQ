import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

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

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">+</span>
          SportMedIQ
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/" end>
            Study
          </NavLink>
          <NavLink to="/teacher">Teacher</NavLink>
        </nav>
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
