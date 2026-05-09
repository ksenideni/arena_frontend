import type { BotView } from '../../api/types'

const BOT_COLORS = [
  '#d83018', '#2068dc', '#38a050', '#f0c040',
  '#58c8f8', '#b048a0', '#f08030', '#787878',
]

interface Props {
  bots: BotView[]
}

export function ScoreBoard({ bots }: Props) {
  const sorted = [...bots].sort((a, b) => b.score - a.score)
  const top = sorted[0]?.score ?? 0

  return (
    <div className="nes-panel">
      <h3>Score</h3>
      <div className="scoreboard">
        {sorted.map((bot) => {
          const color = BOT_COLORS[bot.id % BOT_COLORS.length]
          const leader = bot.score === top && top > 0
          return (
            <div
              key={bot.id}
              className={`scoreboard__row ${leader ? 'scoreboard__row--leader' : ''}`}
              style={{ borderLeftColor: color }}
            >
              <span className="scoreboard__chip" style={{ background: color }} />
              <span className="scoreboard__name">{bot.name}</span>
              <span className="scoreboard__score">{bot.score}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
