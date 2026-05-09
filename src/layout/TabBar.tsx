import { Link, useLocation } from 'react-router-dom'
import { TABS } from './tabs'

export function TabBar() {
  const { pathname } = useLocation()

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
    </nav>
  )
}
