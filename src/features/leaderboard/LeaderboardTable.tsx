import { useMemo, useState } from 'react'
import type { LeaderboardEntry } from '../../api/types'

type SortKey = 'player' | 'matches' | 'wins' | 'winRate' | 'totalScore' | 'avgScore'

interface Props {
  rows: LeaderboardEntry[]
}

/**
 * Таблица лидерборда. Принимает плоский список (player, gameId) — рендерит
 * как есть, с возможностью сортировки по колонке и фильтра по gameId.
 */
export function LeaderboardTable({ rows }: Props) {
  const games = useMemo(() => Array.from(new Set(rows.map((r) => r.gameId))).sort(), [rows])
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('wins')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(
    () => (gameFilter === 'all' ? rows : rows.filter((r) => r.gameId === gameFilter)),
    [rows, gameFilter],
  )

  const sorted = useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [filtered, sortKey, sortDir])

  const onHeaderClick = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else {
      setSortKey(key)
      setSortDir(key === 'player' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="leaderboard">
      {games.length > 1 && (
        <div className="leaderboard__filters">
          <span className="leaderboard__filter-label">Game:</span>
          <button
            type="button"
            className={`leaderboard__chip ${gameFilter === 'all' ? 'leaderboard__chip--active' : ''}`}
            onClick={() => setGameFilter('all')}
          >
            all
          </button>
          {games.map((g) => (
            <button
              key={g}
              type="button"
              className={`leaderboard__chip ${gameFilter === g ? 'leaderboard__chip--active' : ''}`}
              onClick={() => setGameFilter(g)}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <table className="leaderboard__table">
        <thead>
          <tr>
            <Th label="#" />
            <Th label="Player" k="player" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
            {gameFilter === 'all' && <Th label="Game" />}
            <Th label="Matches" k="matches" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
            <Th label="Wins" k="wins" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
            <Th label="Draws" />
            <Th label="Win %" k="winRate" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
            <Th label="Total" k="totalScore" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
            <Th label="Avg" k="avgScore" sortKey={sortKey} sortDir={sortDir} onClick={onHeaderClick} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={`${r.player}|${r.gameId}`}>
              <td className="leaderboard__rank">{i + 1}</td>
              <td className="leaderboard__player">{r.player}</td>
              {gameFilter === 'all' && <td className="leaderboard__game">{r.gameId}</td>}
              <td>{r.matches}</td>
              <td className="leaderboard__wins">{r.wins}</td>
              <td>{r.draws}</td>
              <td>{(r.winRate * 100).toFixed(1)}%</td>
              <td>{r.totalScore}</td>
              <td>{r.avgScore.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ThProps {
  label: string
  k?: SortKey
  sortKey?: SortKey
  sortDir?: 'asc' | 'desc'
  onClick?: (k: SortKey) => void
}

function Th({ label, k, sortKey, sortDir, onClick }: ThProps) {
  if (!k || !onClick) return <th>{label}</th>
  const active = sortKey === k
  const arrow = active ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''
  return (
    <th
      className={`leaderboard__th--sortable ${active ? 'leaderboard__th--active' : ''}`}
      onClick={() => onClick(k)}
    >
      {label}{arrow}
    </th>
  )
}
