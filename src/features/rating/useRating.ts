import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { CompetitionPeriod, PeriodRating } from '../../api/types'

export function usePeriods() {
  const [periods, setPeriods] = useState<CompetitionPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listPeriods()
      .then(setPeriods)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { periods, loading, error }
}

export function usePeriodRating(periodId: string | null) {
  const [data, setData] = useState<PeriodRating | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!periodId) return
    setLoading(true)
    setError(null)
    api.getPeriodRating(periodId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [periodId])

  return { data, loading, error }
}
