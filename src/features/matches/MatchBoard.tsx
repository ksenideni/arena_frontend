import { useEffect, useMemo, useRef } from 'react'
import type { MatchSnapshot } from '../../api/types'

interface Props {
  snapshot: MatchSnapshot | null
  cell?: number
}

const BOT_COLORS = [
  '#d83018', '#2068dc', '#38a050', '#f0c040',
  '#58c8f8', '#b048a0', '#f08030', '#787878',
]

/**
 * Pixel-art канвас игрового поля.
 *
 * Решения:
 * - Сетка рисуется ровными клетками с тонкой линией; внутренний фон — почти чёрный.
 * - Бот — закрашенный квадрат своего цвета с пиксельными «глазами» и номером.
 * - Монета — мерцающий жёлтый ромб.
 * - Анимация мерцания через requestAnimationFrame, плавная.
 */
export function MatchBoard({ snapshot, cell = 32 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const blinkRef = useRef(0)

  const dims = useMemo(() => {
    if (!snapshot) return null
    return { w: snapshot.width * cell, h: snapshot.height * cell }
  }, [snapshot, cell])

  useEffect(() => {
    if (!snapshot || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    let raf = 0
    const draw = () => {
      blinkRef.current = (blinkRef.current + 1) % 60
      drawBoard(ctx, snapshot, cell, blinkRef.current)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [snapshot, cell])

  if (!snapshot || !dims) {
    return <canvas className="match-board" width={320} height={320} />
  }

  return (
    <canvas
      ref={canvasRef}
      className="match-board"
      width={dims.w}
      height={dims.h}
      style={{ width: dims.w, height: dims.h }}
    />
  )
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  snap: MatchSnapshot,
  cell: number,
  tick: number,
) {
  ctx.imageSmoothingEnabled = false

  // Фон
  ctx.fillStyle = '#050a12'
  ctx.fillRect(0, 0, snap.width * cell, snap.height * cell)

  // Сетка
  ctx.strokeStyle = '#1a2230'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= snap.width; x++) {
    const px = x * cell + 0.5
    ctx.moveTo(px, 0)
    ctx.lineTo(px, snap.height * cell)
  }
  for (let y = 0; y <= snap.height; y++) {
    const py = y * cell + 0.5
    ctx.moveTo(0, py)
    ctx.lineTo(snap.width * cell, py)
  }
  ctx.stroke()

  // Items (монеты)
  for (const item of snap.items) {
    if (item.type === 'coin') drawCoin(ctx, item.x, item.y, cell, tick)
    else drawGenericItem(ctx, item.x, item.y, cell)
  }

  // Боты
  for (const bot of snap.bots) {
    drawBot(ctx, bot.x, bot.y, cell, bot.id, bot.active)
  }
}

function drawCoin(ctx: CanvasRenderingContext2D, gx: number, gy: number, cell: number, tick: number) {
  const px = gx * cell
  const py = gy * cell
  // Пульсация: 0..1
  const t = (Math.sin((tick / 60) * Math.PI * 2) + 1) / 2
  const inset = Math.round(cell * (0.30 - t * 0.06))
  const cx = px + cell / 2
  const cy = py + cell / 2
  const r = cell / 2 - inset

  ctx.fillStyle = '#f0c040'
  // ромб
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - r, cy)
  ctx.closePath()
  ctx.fill()

  // блик
  ctx.fillStyle = '#fff8a0'
  ctx.fillRect(cx - 2, cy - r + 4, 2, 2)
}

function drawGenericItem(ctx: CanvasRenderingContext2D, gx: number, gy: number, cell: number) {
  const px = gx * cell + cell / 4
  const py = gy * cell + cell / 4
  ctx.fillStyle = '#9a9a9a'
  ctx.fillRect(px, py, cell / 2, cell / 2)
}

function drawBot(
  ctx: CanvasRenderingContext2D,
  gx: number, gy: number, cell: number,
  id: number, active: boolean,
) {
  const px = gx * cell
  const py = gy * cell
  const inset = 4
  const color = BOT_COLORS[id % BOT_COLORS.length]

  // Тело
  ctx.fillStyle = active ? color : '#5a5a5a'
  ctx.fillRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2)

  // Тёмный нижний край (псевдо-объём)
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(px + inset, py + cell - inset - 4, cell - inset * 2, 4)

  // Светлый верхний край
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(px + inset, py + inset, cell - inset * 2, 2)

  // Глаза — два пикселя
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(px + inset + 5, py + inset + 6, 3, 4)
  ctx.fillRect(px + cell - inset - 8, py + inset + 6, 3, 4)

  // Номер id+1 в правом нижнем углу
  ctx.fillStyle = '#0d0d0d'
  ctx.font = `bold ${Math.floor(cell / 3)}px monospace`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(String(id + 1), px + cell - inset - 1, py + cell - inset - 1)
}
