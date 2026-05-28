import { useState, useEffect } from 'react'
import { usePeriods, usePeriodRating } from '../features/rating/useRating'
import type { BotPeriodRating } from '../api/types'

function Tip({ text }: { text: string }) {
  if (!text) return null
  return (
    <span className="pixel-tooltip__box">
      {text.split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
    </span>
  )
}

type SortKey = keyof BotPeriodRating

interface ColDef {
  key: SortKey
  label: string
  tooltip: string
  format: (r: BotPeriodRating) => string
  color?: (r: BotPeriodRating, all: BotPeriodRating[]) => string | undefined
}

const COLS: ColDef[] = [
  {
    key: 'rank',
    label: '#',
    tooltip: '',
    format: r => String(r.rank),
  },
  {
    key: 'bot',
    label: 'Бот',
    tooltip: '',
    format: r => r.bot,
  },
  {
    key: 'totalScore',
    label: 'Очки за период',
    tooltip: 'Сумма всех очков за все матчи периода',
    format: r => String(r.totalScore),
    color: (r, all) => {
      const max = Math.max(...all.map(x => x.totalScore))
      return r.totalScore === max ? 'var(--nes-yellow)' : undefined
    },
  },
  {
    key: 'rTop',
    label: 'Стабильность',
    tooltip:
      'Число дней, когда бот входил в топ-3 по дневным очкам.\n' +
      'Показывает надёжность стратегии: бот с меньшей суммой очков\n' +
      'может опередить «флэш-игрока» по этой метрике.',
    format: r => `${r.rTop} / 7`,
    color: (r, all) => {
      const max = Math.max(...all.map(x => x.rTop))
      return r.rTop === max ? 'var(--nes-green)' : undefined
    },
  },
  {
    key: 'rWeighted',
    label: 'Прогресс',
    tooltip:
      'Взвешенная сумма нормированных дневных очков.\n' +
      'Поздние дни весят больше: день 7 важнее дня 1 в 7 раз.\n' +
      'Поощряет улучшение алгоритма к концу периода.',
    format: r => r.rWeighted.toFixed(3),
    color: (r, all) => {
      const max = Math.max(...all.map(x => x.rWeighted))
      return r.rWeighted === max ? 'var(--nes-cyan)' : undefined
    },
  },
  {
    key: 'rElo',
    label: 'Мастерство',
    tooltip:
      'Рейтинг Эло (K=32, старт 1000 в начале периода).\n' +
      'Обновляется попарно после каждого матча.\n' +
      'Победа над сильным соперником даёт больше очков.',
    format: r => String(Math.round(r.rElo)),
    color: r => (r.rElo >= 1000 ? 'var(--nes-cyan)' : 'var(--nes-red)'),
  },
]

function RatingTable({ ratings, periodsCount }: { ratings: BotPeriodRating[]; periodsCount: number }) {
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [asc, setAsc] = useState(true)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc(a => !a)
    else { setSortKey(key); setAsc(key === 'rank') }
  }

  const sorted = [...ratings].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    if (typeof va === 'number' && typeof vb === 'number') return asc ? va - vb : vb - va
    return asc
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va))
  })

  return (
    <table className="leaderboard__table">
      <thead>
        <tr>
          {COLS.map(col => {
            const active = sortKey === col.key
            return (
              <th
                key={col.key}
                className={`leaderboard__th--sortable pixel-tooltip${active ? ' leaderboard__th--active' : ''}`}
                onClick={() => toggleSort(col.key)}
              >
                {col.label}{active ? (asc ? ' ↑' : ' ↓') : ''}
                <Tip text={col.tooltip} />
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map(r => (
          <tr key={r.bot}>
            {COLS.map(col => (
              <td
                key={col.key}
                className={col.key === 'bot' ? 'leaderboard__player' : ''}
                style={{ color: col.color?.(r, ratings) }}
              >
                {col.format(r)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Legend() {
  return (
    <div style={{ fontSize: '10px', color: 'var(--nes-text-dim)', marginTop: '16px', lineHeight: '2' }}>
      <div>
        <span style={{ color: 'var(--nes-yellow)' }}>█</span>{' '}
        <b>Очки за период</b> — сырая сумма очков за все матчи. Большой балл в один день может обогнать
        по этой метрике стабильного соперника.
      </div>
      <div>
        <span style={{ color: 'var(--nes-green)' }}>█</span>{' '}
        <b>Стабильность</b> — сколько дней бот был в топ-3. Бот с меньшей суммой очков за период
        может выиграть здесь, если он стабильно в топе, а не «выстрелил» раз.
      </div>
      <div>
        <span style={{ color: 'var(--nes-cyan)' }}>█</span>{' '}
        <b>Прогресс</b> — поздние дни ценятся в 7× больше ранних. Поощряет улучшение алгоритма.
      </div>
      <div>
        <span style={{ color: 'var(--nes-red)' }}>█</span>{' '}
        <b>Мастерство (Эло)</b> — победа над сильным соперником даёт больше очков, чем над слабым.
      </div>
    </div>
  )
}

export function RatingPage() {
  const { periods, loading: loadingPeriods, error: errorPeriods } = usePeriods()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (periods.length > 0 && !selectedId) setSelectedId(periods[0].id)
  }, [periods, selectedId])

  const { data, loading: loadingRating, error: errorRating } = usePeriodRating(selectedId)

  if (loadingPeriods) return <div className="center-msg">LOADING...</div>
  if (errorPeriods) return <div className="center-msg">ERROR: {errorPeriods}</div>

  if (periods.length === 0) {
    return (
      <div className="match-list">
        <h2>Dynamic Rating</h2>
        <div className="match-list__empty">Нет данных — периоды ещё не созданы.</div>
      </div>
    )
  }

  const period = data?.period

  return (
    <div className="leaderboard">
      <h2>Dynamic Rating</h2>

      <div className="leaderboard__filters">
        {periods.map(p => (
          <button
            key={p.id}
            className={`leaderboard__chip${selectedId === p.id ? ' leaderboard__chip--active' : ''}`}
            onClick={() => setSelectedId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {period && (
        <div style={{ fontSize: '11px', color: 'var(--nes-text-dim)', marginBottom: '8px' }}>
          {period.periodsCount} {period.periodUnit === 'DAY' ? 'дней' : 'часов'} · старт{' '}
          {new Date(period.startedAt).toLocaleDateString('ru-RU')}
        </div>
      )}

      {loadingRating && <div className="center-msg">LOADING...</div>}
      {errorRating && <div className="center-msg">ERROR: {errorRating}</div>}

      {data && data.ratings.length === 0 && (
        <div className="match-list__empty">В этом периоде нет завершённых матчей.</div>
      )}

      {data && data.ratings.length > 0 && (
        <>
          <RatingTable ratings={data.ratings} periodsCount={data.period.periodsCount} />
          <Legend />
        </>
      )}
    </div>
  )
}
