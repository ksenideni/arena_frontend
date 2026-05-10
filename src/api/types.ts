// Типы соответствуют DTO из :web (web/src/main/kotlin/.../web/dto/Dto.kt).
// Если меняешь там — синхронизируй здесь.

export interface BotView {
  id: number
  name: string
  x: number
  y: number
  score: number
  active: boolean
}

export interface ItemView {
  type: string
  x: number
  y: number
}

export interface MatchSnapshot {
  round: number
  width: number
  height: number
  maxRounds: number
  bots: BotView[]
  items: ItemView[]
}

export type MatchStatus = 'active' | 'finished'

export interface MatchSummary {
  matchId: string
  gameId: string
  players: string[]
  status: MatchStatus
  startedAt: string
  finishedAt: string | null
  currentRound: number
  maxRounds: number
  winner: string | null
}

export interface MatchResultDto {
  winner: string | null
  finalScores: Record<string, number>
  rounds: number
}

export interface MatchDetail {
  summary: MatchSummary
  width: number
  height: number
  snapshots: MatchSnapshot[]
  result: MatchResultDto | null
}

export type WsMessage =
  | { type: 'history'; matchId: string; summary: MatchSummary; width: number; height: number; snapshots: MatchSnapshot[]; result: MatchResultDto | null }
  | { type: 'round'; matchId: string; snapshot: MatchSnapshot }
  | { type: 'finished'; matchId: string; result: MatchResultDto; finishedAt: string }

export interface LeaderboardEntry {
  player: string
  gameId: string
  matches: number
  wins: number
  draws: number
  totalScore: number
  avgScore: number
  winRate: number
}
