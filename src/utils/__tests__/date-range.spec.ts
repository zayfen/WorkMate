import { computeDateRange, splitIntoBuckets } from '@/utils/date-range'

describe('date-range utils', () => {
  it('computes week range ISO Monday-Sunday', () => {
    const anchor = new Date('2024-05-15') // Wednesday
    const r = computeDateRange({ granularity: 'week', anchor })
    expect(new Date(r.from).getDay()).toBe(1) // Monday
    expect(new Date(r.to).getDay()).toBe(0) // Sunday
  })

  it('splits months into buckets', () => {
    const from = new Date('2024-01-01').getTime()
    const to = new Date('2024-03-31').getTime()
    const buckets = splitIntoBuckets('month', from, to)
    expect(buckets.length).toBe(3)
    expect(buckets[0].label).toBe('2024-01')
  })
})


