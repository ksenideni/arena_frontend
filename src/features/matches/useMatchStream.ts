import { useEffect, useReducer, useRef } from 'react'
import { liveSocketUrl } from '../../api/client'
import type { MatchResultDto, MatchSnapshot, MatchSummary, WsMessage } from '../../api/types'

/**
 * Поток состояния матча: WS забирает историю и лайв-события, фронт
 * отдельно ведёт «курсор воспроизведения» — какой именно раунд показан в данный
 * момент. Для активного матча курсор автоматически догоняет последний снимок;
 * для завершённого пользователь сам пролистывает реплей.
 */
export interface MatchStreamState {
  matchId: string
  status: 'connecting' | 'live' | 'finished' | 'error' | 'closed'
  summary: MatchSummary | null
  width: number
  height: number
  /** Все собранные снимки в порядке round-ов. Дедуплицируются. */
  snapshots: MatchSnapshot[]
  result: MatchResultDto | null
  /** Индекс текущего показываемого снимка. */
  cursor: number
  /** Запущен ли автопроигрыш реплея. Для лайв-матчей всегда true. */
  playing: boolean
  speed: number
  errorMessage: string | null
}

type Action =
  | { kind: 'history'; matchId: string; summary: MatchSummary; width: number; height: number; snapshots: MatchSnapshot[]; result: MatchResultDto | null }
  | { kind: 'round'; snapshot: MatchSnapshot }
  | { kind: 'finished'; result: MatchResultDto }
  | { kind: 'closed' }
  | { kind: 'error'; message: string }
  | { kind: 'cursor'; cursor: number }
  | { kind: 'play' }
  | { kind: 'pause' }
  | { kind: 'speed'; speed: number }
  | { kind: 'tick' }

const SPEEDS = [0.5, 1, 2, 4]

function initialState(matchId: string): MatchStreamState {
  return {
    matchId,
    status: 'connecting',
    summary: null,
    width: 0,
    height: 0,
    snapshots: [],
    result: null,
    cursor: 0,
    playing: true,
    speed: 1,
    errorMessage: null,
  }
}

function insertSnapshot(list: MatchSnapshot[], snap: MatchSnapshot): MatchSnapshot[] {
  if (list.some((s) => s.round === snap.round)) return list
  // снимки приходят в порядке round-ов в почти всех случаях;
  // на всякий случай поддержим out-of-order
  const next = [...list, snap]
  next.sort((a, b) => a.round - b.round)
  return next
}

function reducer(state: MatchStreamState, action: Action): MatchStreamState {
  switch (action.kind) {
    case 'history': {
      const isFinished = action.summary.status === 'finished'
      return {
        ...state,
        status: isFinished ? 'finished' : 'live',
        summary: action.summary,
        width: action.width,
        height: action.height,
        snapshots: action.snapshots.slice().sort((a, b) => a.round - b.round),
        result: action.result,
        cursor: isFinished ? 0 : Math.max(0, action.snapshots.length - 1),
        playing: !isFinished, // активный — катим автоматически; завершённый — пользователь сам нажимает Play
      }
    }
    case 'round': {
      const snapshots = insertSnapshot(state.snapshots, action.snapshot)
      // Если зритель смотрит «в реальном времени» (cursor был на последнем снимке) —
      // сдвигаем курсор на новый последний. Иначе оставляем курсор там, где пользователь остановился.
      const wasAtEnd = state.cursor >= state.snapshots.length - 1
      return {
        ...state,
        snapshots,
        cursor: wasAtEnd ? snapshots.length - 1 : state.cursor,
      }
    }
    case 'finished':
      return { ...state, status: 'finished', result: action.result, summary: state.summary ? { ...state.summary, status: 'finished', winner: action.result.winner } : state.summary }
    case 'closed':
      return state.status === 'error' ? state : { ...state, status: state.status === 'finished' ? 'finished' : 'closed' }
    case 'error':
      return { ...state, status: 'error', errorMessage: action.message }
    case 'cursor':
      return { ...state, cursor: clamp(action.cursor, 0, Math.max(0, state.snapshots.length - 1)) }
    case 'play':
      return { ...state, playing: true }
    case 'pause':
      return { ...state, playing: false }
    case 'speed':
      return { ...state, speed: action.speed }
    case 'tick':
      if (!state.playing) return state
      if (state.cursor >= state.snapshots.length - 1) {
        // догнали — для активного матча просто ждём, для завершённого — pause на конце
        return state.status === 'finished' ? { ...state, playing: false } : state
      }
      return { ...state, cursor: state.cursor + 1 }
    default:
      return state
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function useMatchStream(matchId: string) {
  const [state, dispatch] = useReducer(reducer, matchId, initialState)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(liveSocketUrl(matchId))
    wsRef.current = ws

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as WsMessage
        if (msg.type === 'history') {
          dispatch({ kind: 'history', matchId: msg.matchId, summary: msg.summary, width: msg.width, height: msg.height, snapshots: msg.snapshots, result: msg.result })
        } else if (msg.type === 'round') {
          dispatch({ kind: 'round', snapshot: msg.snapshot })
        } else if (msg.type === 'finished') {
          dispatch({ kind: 'finished', result: msg.result })
        }
      } catch (e) {
        dispatch({ kind: 'error', message: (e as Error).message })
      }
    }
    ws.onerror = () => dispatch({ kind: 'error', message: 'WebSocket error' })
    ws.onclose = () => dispatch({ kind: 'closed' })

    return () => {
      wsRef.current = null
      try { ws.close() } catch { /* ignore */ }
    }
  }, [matchId])

  // Тикалка проигрывания. Базовый интервал 400 мс на скорости 1.
  useEffect(() => {
    if (!state.playing) return
    const intervalMs = 400 / state.speed
    const id = window.setInterval(() => dispatch({ kind: 'tick' }), intervalMs)
    return () => window.clearInterval(id)
  }, [state.playing, state.speed])

  return {
    state,
    actions: {
      play: () => dispatch({ kind: 'play' }),
      pause: () => dispatch({ kind: 'pause' }),
      seek: (cursor: number) => dispatch({ kind: 'cursor', cursor }),
      stepForward: () => dispatch({ kind: 'cursor', cursor: state.cursor + 1 }),
      stepBack: () => dispatch({ kind: 'cursor', cursor: state.cursor - 1 }),
      jumpEnd: () => dispatch({ kind: 'cursor', cursor: state.snapshots.length - 1 }),
      cycleSpeed: () => {
        const idx = SPEEDS.indexOf(state.speed)
        const next = SPEEDS[(idx + 1) % SPEEDS.length]
        dispatch({ kind: 'speed', speed: next })
      },
    },
  }
}

export const PLAYBACK_SPEEDS = SPEEDS
