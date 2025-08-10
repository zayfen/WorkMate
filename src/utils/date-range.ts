import type { ReportGranularity } from './report-types'

export interface DateRangeInput {
  granularity: ReportGranularity
  // For day/week/month: any date inside the target period
  // For half-year: pass month 0-5 for H1, 6-11 for H2 via anchor date
  anchor: Date
  // Optional explicit range override
  from?: Date
  to?: Date
}

export interface DateRangeResult {
  from: number
  to: number
  label: string
}

export function computeDateRange(input: DateRangeInput): DateRangeResult {
  const { granularity, anchor } = input

  if (input.from && input.to) {
    const start = startOfDay(input.from).getTime()
    const end = endOfDay(input.to).getTime()
    return { from: start, to: end, label: makeLabel(start, end, granularity) }
  }

  switch (granularity) {
    case 'day': {
      const start = startOfDay(anchor).getTime()
      const end = endOfDay(anchor).getTime()
      return { from: start, to: end, label: formatDate(anchor) }
    }
    case 'week': {
      const { start, end } = isoWeekRange(anchor)
      return { from: start.getTime(), to: end.getTime(), label: autoWeekTitle(start) }
    }
    case 'month': {
      const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
      const end = endOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0))
      return { from: start.getTime(), to: end.getTime(), label: `${anchor.getFullYear()}年${pad(anchor.getMonth() + 1)}月` }
    }
    case 'half-year': {
      const isH1 = anchor.getMonth() < 6
      const start = new Date(anchor.getFullYear(), isH1 ? 0 : 6, 1)
      const end = endOfDay(new Date(anchor.getFullYear(), isH1 ? 5 : 11, lastDayOfMonth(anchor.getFullYear(), isH1 ? 5 : 11)))
      return { from: start.getTime(), to: end.getTime(), label: `${anchor.getFullYear()}年${isH1 ? '上半年' : '下半年'}` }
    }
    case 'year': {
      const start = new Date(anchor.getFullYear(), 0, 1)
      const end = endOfDay(new Date(anchor.getFullYear(), 11, 31))
      return { from: start.getTime(), to: end.getTime(), label: String(anchor.getFullYear()) }
    }
  }
}

export function splitIntoBuckets(granularity: 'day' | 'week' | 'month' | 'half-year' | 'year', from: number, to: number): Array<{ start: number; end: number; label: string }> {
  const buckets: Array<{ start: number; end: number; label: string }> = []
  const cursor = new Date(from)
  while (cursor.getTime() <= to) {
    switch (granularity) {
      case 'day': {
        const start = startOfDay(cursor).getTime()
        const end = endOfDay(cursor).getTime()
        buckets.push({ start, end, label: formatDate(new Date(start)) })
        cursor.setDate(cursor.getDate() + 1)
        break
      }
      case 'week': {
        const { start, end } = isoWeekRange(cursor)
        buckets.push({ start: start.getTime(), end: end.getTime(), label: autoWeekTitle(start) })
        cursor.setDate(cursor.getDate() + 7)
        break
      }
      case 'month': {
        const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
        const end = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))
        buckets.push({ start: start.getTime(), end: end.getTime(), label: `${start.getFullYear()}-${pad(start.getMonth() + 1)}` })
        cursor.setMonth(cursor.getMonth() + 1)
        break
      }
      case 'half-year': {
        const isH1 = cursor.getMonth() < 6
        const start = new Date(cursor.getFullYear(), isH1 ? 0 : 6, 1)
        const end = endOfDay(new Date(cursor.getFullYear(), isH1 ? 5 : 11, lastDayOfMonth(cursor.getFullYear(), isH1 ? 5 : 11)))
        buckets.push({ start: start.getTime(), end: end.getTime(), label: `${cursor.getFullYear()} ${isH1 ? 'H1' : 'H2'}` })
        cursor.setMonth(cursor.getMonth() + 6)
        break
      }
      case 'year': {
        const start = new Date(cursor.getFullYear(), 0, 1)
        const end = endOfDay(new Date(cursor.getFullYear(), 11, 31))
        buckets.push({ start: start.getTime(), end: end.getTime(), label: `${start.getFullYear()}` })
        cursor.setFullYear(cursor.getFullYear() + 1)
        break
      }
    }
  }
  return buckets.filter((b) => b.start <= to)
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function isoWeekRange(d: Date): { start: Date; end: Date } {
  const date = new Date(d)
  const day = date.getDay() || 7 // 1..7, Monday is 1
  const start = new Date(date)
  start.setDate(date.getDate() - (day - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }

function lastDayOfMonth(year: number, monthZeroBased: number): number {
  return new Date(year, monthZeroBased + 1, 0).getDate()
}

export function clampRange(from: number, to: number): { from: number; to: number } {
  if (!Number.isFinite(from) || !Number.isFinite(to)) throw new Error('Invalid range')
  return from <= to ? { from, to } : { from: to, to: from }
}

function autoWeekTitle(anyDateInWeek: Date): string {
  // 标题示例：2024 年 第 32 周（08-05 ~ 08-11）
  const { start, end } = isoWeekRange(anyDateInWeek)
  const firstThursday = new Date(start)
  firstThursday.setDate(start.getDate() + 3)
  const weekYear = firstThursday.getFullYear()
  const oneJan = new Date(weekYear, 0, 1)
  const days = Math.floor((start.getTime() - oneJan.getTime()) / 86400000) + 1
  const weekNum = Math.ceil(days / 7)
  return `${weekYear} 年 第 ${weekNum} 周（${pad(start.getMonth() + 1)}-${pad(start.getDate())} ~ ${pad(end.getMonth() + 1)}-${pad(end.getDate())}）`
}


