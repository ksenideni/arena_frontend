interface Props {
  cursor: number
  total: number
  playing: boolean
  speed: number
  isLive: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (cursor: number) => void
  onStepBack: () => void
  onStepForward: () => void
  onJumpEnd: () => void
  onCycleSpeed: () => void
}

export function ReplayControls({
  cursor, total, playing, speed, isLive,
  onPlay, onPause, onSeek, onStepBack, onStepForward, onJumpEnd, onCycleSpeed,
}: Props) {
  const max = Math.max(0, total - 1)
  const round = total > 0 ? cursor : 0

  return (
    <div className="nes-panel">
      <h3>{isLive ? 'Live playback' : 'Replay'}</h3>
      <div className="replay">
        <div className="replay__round">ROUND {round} / {Math.max(0, total - 1)}</div>
        <input
          className="replay__scrub"
          type="range"
          min={0}
          max={max}
          step={1}
          value={cursor}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={total === 0}
        />
        <div className="replay__row">
          <button onClick={onStepBack} disabled={cursor <= 0}>◀</button>
          {playing ? (
            <button onClick={onPause} disabled={total === 0}>PAUSE</button>
          ) : (
            <button onClick={onPlay} disabled={total === 0}>PLAY</button>
          )}
          <button onClick={onStepForward} disabled={cursor >= max}>▶</button>
          <button onClick={onJumpEnd} disabled={cursor >= max}>⏭ NOW</button>
          <button onClick={onCycleSpeed}>×{speed}</button>
        </div>
      </div>
    </div>
  )
}
