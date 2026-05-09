import { Link, useParams } from 'react-router-dom'
import { MatchBoard } from '../features/matches/MatchBoard'
import { ReplayControls } from '../features/matches/ReplayControls'
import { ScoreBoard } from '../features/matches/ScoreBoard'
import { useMatchStream } from '../features/matches/useMatchStream'

export function MatchPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <div className="center-msg">NO MATCH ID</div>

  const { state, actions } = useMatchStream(id)

  if (state.status === 'connecting') return <div className="center-msg">CONNECTING TO {id}...</div>
  if (state.status === 'error') return <div className="center-msg">CONN ERROR: {state.errorMessage}</div>
  if (!state.summary) return <div className="center-msg">NO MATCH DATA</div>

  const snapshot = state.snapshots[state.cursor] ?? null
  const isLive = state.status === 'live'

  return (
    <div>
      <Link to="/matches" className="match-page__back">← BACK</Link>
      <div className="match-page__title">
        #{state.summary.matchId} · {state.summary.players.join(' VS ')} ·{' '}
        <span className={`status-pill status-pill--${state.status}`}>{state.status}</span>
      </div>

      <div className="match-page">
        <div className="match-page__board">
          <MatchBoard snapshot={snapshot} cell={32} />
        </div>
        <div className="match-page__side">
          <ScoreBoard bots={snapshot?.bots ?? []} />
          <ReplayControls
            cursor={state.cursor}
            total={state.snapshots.length}
            playing={state.playing}
            speed={state.speed}
            isLive={isLive}
            onPlay={actions.play}
            onPause={actions.pause}
            onSeek={actions.seek}
            onStepBack={actions.stepBack}
            onStepForward={actions.stepForward}
            onJumpEnd={actions.jumpEnd}
            onCycleSpeed={actions.cycleSpeed}
          />
          {state.result && (
            <div className="nes-panel nes-panel--accent">
              <h3>Final</h3>
              <div style={{ fontSize: 18 }}>
                {state.result.winner ? `Winner: ${state.result.winner}` : 'Tie'}
                <br />
                Rounds: {state.result.rounds}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
