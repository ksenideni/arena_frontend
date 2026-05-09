import { useNavigate } from 'react-router-dom'
import { useMatchesList } from '../features/matches/useMatchesList'
import type { MatchSummary } from '../api/types'

export function MatchesPage() {
  const { data, loading, error } = useMatchesList()
  const navigate = useNavigate()

  if (loading) return <div className="center-msg">LOADING...</div>
  if (error) return <div className="center-msg">ERROR: {error}</div>
  if (data.length === 0) {
    return (
      <div className="match-list">
        <h2>Active matches</h2>
        <div className="match-list__empty">No matches yet. Connect a bot to begin.</div>
      </div>
    )
  }

  const active = data.filter((m) => m.status === 'active')
  const finished = data.filter((m) => m.status === 'finished')

  return (
    <div className="match-list">
      <h2>Active</h2>
      {active.length === 0 ? (
        <div className="match-list__empty">No active matches.</div>
      ) : (
        active.map((m) => <MatchItem key={m.matchId} m={m} onOpen={() => navigate(`/match/${m.matchId}`)} />)
      )}

      <h2 style={{ marginTop: 32 }}>Finished</h2>
      {finished.length === 0 ? (
        <div className="match-list__empty">Nothing finished yet.</div>
      ) : (
        finished.map((m) => <MatchItem key={m.matchId} m={m} onOpen={() => navigate(`/match/${m.matchId}`)} />)
      )}
    </div>
  )
}

function MatchItem({ m, onOpen }: { m: MatchSummary; onOpen: () => void }) {
  return (
    <div className="match-item" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <div>
        <div className="match-item__id">#{m.matchId}</div>
        <div className="match-item__players">{m.players.join(' vs ')}</div>
      </div>
      <div className="match-item__round">R{m.currentRound}/{m.maxRounds}</div>
      <div className={`match-item__status match-item__status--${m.status}`}>
        {m.status === 'active' ? 'LIVE' : (m.winner ? `WINNER: ${m.winner}` : 'TIE')}
      </div>
    </div>
  )
}
