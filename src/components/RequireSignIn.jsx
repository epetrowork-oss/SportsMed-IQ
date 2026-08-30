// The app's front door. Lessons, quizzes, flashcards, achievements and Sync
// are class material, not a public library: without a sign-in there is no
// student to attribute work to and no teacher deciding what should be open
// yet, so an un-signed-in visitor is sent to the sign-in page instead.
//
// Two kinds of sign-in open the app:
//   - a student session (class login code + login name + PIN), which also
//     brings the teacher's content controls with it, and
//   - a teacher or admin signed in on this device, so they can read through
//     the library before deciding what to open up to the class.
//
// Where the visitor was headed is carried along in navigation state, and the
// sign-in page sends them there once they are in — a link to a specific
// lesson still lands on that lesson.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStudentSession } from '../lib/studentSession.js'
import { useAuth } from '../lib/auth.js'

export function useSignedIn() {
  const { session } = useStudentSession()
  const { role } = useAuth()
  return { signedIn: !!session || !!role, session, role }
}

export default function RequireSignIn() {
  const { signedIn } = useSignedIn()
  const location = useLocation()
  if (signedIn) return <Outlet />
  return (
    <Navigate
      to="/login"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  )
}
