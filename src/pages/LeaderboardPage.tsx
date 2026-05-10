import { LeaderboardTable } from '../features/leaderboard/LeaderboardTable'
import { useLeaderboard } from '../features/leaderboard/useLeaderboard'

export function LeaderboardPage() {
  const { data, loading, error } = useLeaderboard()

  if (loading && data.length === 0) return <div className="center-msg">LOADING...</div>
  if (error) return <div className="center-msg">ERROR: {error}</div>
  if (data.length === 0) {
    return (
      <div className="match-list">
        <h2>Leaderboard</h2>
        <div className="match-list__empty">No finished matches yet.</div>
      </div>
    )
  }

  return (
    <div className="match-list">
      <h2>Leaderboard</h2>
      <LeaderboardTable rows={data} />
    </div>
  )
}
