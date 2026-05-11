import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { TABS } from './tabs'

export function TabBar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="tabbar" role="tablist">
      {TABS.map((tab) => {
        const active = pathname === tab.to || pathname.startsWith(tab.pathPrefix)
        if (!tab.enabled) {
          return (
            <span
              key={tab.id}
              className="tabbar__tab tabbar__tab--disabled"
              title="Coming soon"
              aria-disabled="true"
            >
              {tab.label}
            </span>
          )
        }
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`tabbar__tab ${active ? 'tabbar__tab--active' : ''}`}
            role="tab"
            aria-selected={active}
          >
            {tab.label}
          </Link>
        )
      })}
      <div className="tabbar__spacer" />
      {user ? (
        <>
          <span className="tabbar__user">@{user.login}</span>
          <button
            type="button"
            className="tabbar__tab"
            onClick={() => { logout(); navigate('/login') }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className={`tabbar__tab ${pathname === '/login' ? 'tabbar__tab--active' : ''}`}
        >
          Login
        </Link>
      )}
    </nav>
  )
}
