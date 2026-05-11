import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useProfile } from '../features/profile/useProfile'
import { LeaderboardTable } from '../features/leaderboard/LeaderboardTable'
import type { MatchSummary } from '../api/types'

export function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const { data, loading, error } = useProfile()
  const navigate = useNavigate()

  if (authLoading) return <div className="center-msg">LOADING...</div>
  if (!user) {
    return (
      <div className="center-msg">
        Please <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>sign in</a>.
      </div>
    )
  }
  if (loading && !data) return <div className="center-msg">LOADING PROFILE...</div>
  if (error) return <div className="center-msg">ERROR: {error}</div>
  if (!data) return null

  return (
    <div className="profile">
      <header className="profile__header">
        <div>
          <h2 className="profile__name">{data.user.displayName}</h2>
          <div className="profile__login">@{data.user.login}</div>
        </div>
        <button className="profile__logout" type="button" onClick={() => { logout(); navigate('/login') }}>
          Logout
        </button>
      </header>

      <section className="profile__section">
        <h3>My bots</h3>
        {data.bots.length === 0 ? (
          <div className="match-list__empty">
            Не заклеймлено ни одного бота. Подключитесь TCP-клиентом с этими кредами —
            имя бота будет автоматически закреплено за вами.
          </div>
        ) : (
          <div className="profile__bots">
            {data.bots.map((b) => <span key={b} className="profile__bot">{b}</span>)}
          </div>
        )}
      </section>

      <section className="profile__section">
        <h3>Stats</h3>
        {data.stats.length === 0 ? (
          <div className="match-list__empty">Пока нет завершённых матчей.</div>
        ) : (
          <LeaderboardTable rows={data.stats} />
        )}
      </section>

      <section className="profile__section">
        <h3>Recent matches</h3>
        {data.recentMatches.length === 0 ? (
          <div className="match-list__empty">Здесь появятся матчи, в которых играли ваши боты.</div>
        ) : (
          <div className="match-list">
            {data.recentMatches.map((m) => (
              <RecentMatchItem key={m.matchId} m={m} mineBots={data.bots} onOpen={() => navigate(`/match/${m.matchId}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function RecentMatchItem({
  m,
  mineBots,
  onOpen,
}: {
  m: MatchSummary
  mineBots: string[]
  onOpen: () => void
}) {
  const myBotsInMatch = m.players.filter((p) => mineBots.includes(p))
  return (
    <div className="match-item" onClick={onOpen} role="button" tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <div>
        <div className="match-item__id">#{m.matchId}</div>
        <div className="match-item__players">
          {m.players.map((p, i) => (
            <span key={p} className={mineBots.includes(p) ? 'profile__mine' : undefined}>
              {p}{i < m.players.length - 1 ? ' vs ' : ''}
            </span>
          ))}
        </div>
      </div>
      <div className="match-item__round">R{m.currentRound}/{m.maxRounds}</div>
      <div className={`match-item__status match-item__status--${m.status}`}>
        {m.status === 'active'
          ? 'LIVE'
          : m.winner
            ? `WINNER: ${m.winner}${myBotsInMatch.includes(m.winner) ? ' ✓' : ''}`
            : 'TIE'}
      </div>
    </div>
  )
}
