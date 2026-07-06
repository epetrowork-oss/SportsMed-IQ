import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page page-narrow">
      <h1>Not found</h1>
      <p>That page or unit doesn't exist.</p>
      <Link className="button" to="/">
        Back to units
      </Link>
    </div>
  )
}
