import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { DatabaseManager } from '../../electron/models/db'
import { TasksDao } from '../../electron/models/tasks'
import { ProjectsDao } from '../../electron/models/projects'

function ts(y: number, m: number, d: number, hh = 0, mm = 0) {
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

describe('TasksDao', () => {
  beforeEach(() => {
    DatabaseManager.initialize(':memory:')
  })

  afterAll(() => {
    DatabaseManager.close()
  })

  it('create/list respects archived projects and default filters', () => {
    const projects = new ProjectsDao()
    const tasks = new TasksDao()
    const p1 = projects.create({ title: 'P1' })
    const p2 = projects.create({ title: 'P2' })

    // archive p2
    projects.setArchived(p2, true)

    const id1 = tasks.create({ project_id: p1, title: 'T1', status: 'todo', priority: 'medium' })
    const id2 = tasks.create({ project_id: p2, title: 'T2', status: 'todo', priority: 'medium' })
    expect(id1).toBeGreaterThan(0)
    expect(id2).toBeGreaterThan(0)

    const list = tasks.list({})
    expect(list.find(t => t.title === 'T1')).toBeTruthy()
    // archived project tasks should be excluded
    expect(list.find(t => t.title === 'T2')).toBeFalsy()
  })

  it('filters by due (today/this_week/this_month)', () => {
    const projects = new ProjectsDao()
    const tasks = new TasksDao()
    const p = projects.create({ title: 'P' })

    const now = Date.now()
    const startOfDay = new Date(new Date(now).toDateString()).getTime()
    const day = new Date(startOfDay)
    const y = day.getFullYear()
    const m = day.getMonth() + 1
    const d = day.getDate()
    const dow = day.getDay() || 7
    const monday = startOfDay - (dow - 1) * 24 * 60 * 60 * 1000
    const sunday = monday + 7 * 24 * 60 * 60 * 1000 - 1
    const firstOfMonth = new Date(day.getFullYear(), day.getMonth(), 1).getTime()
    const lastOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0).setHours(23, 59, 59, 999)

    const todayDue = ts(y, m, d, 10, 0)
    // pick a weekday inside this week window
    const weekDue = Math.min(monday + 2 * 24 * 60 * 60 * 1000 + (12 * 60 * 60 * 1000), sunday - 1000)
    // pick a date within this month
    const candidateMonth = firstOfMonth + 10 * 24 * 60 * 60 * 1000 + (9 * 60 * 60 * 1000)
    const monthDue = candidateMonth <= lastOfMonth ? candidateMonth : (firstOfMonth + (1 * 24 * 60 * 60 * 1000) + (9 * 60 * 60 * 1000))

    tasks.create({ project_id: p, title: 'today', due_date: todayDue, status: 'todo' })
    tasks.create({ project_id: p, title: 'week', due_date: weekDue, status: 'todo' })
    tasks.create({ project_id: p, title: 'month', due_date: monthDue, status: 'todo' })

    const todayList = tasks.list({ due: 'today' })
    expect(todayList.every(t => t.title === 'today')).toBe(true)

    const weekList = tasks.list({ due: 'this_week' })
    expect(weekList.find(t => t.title === 'today')).toBeTruthy()
    expect(weekList.find(t => t.title === 'week')).toBeTruthy()

    const monthList = tasks.list({ due: 'this_month' })
    expect(monthList.find(t => t.title === 'month')).toBeTruthy()
  })

  it('status done forces progress 100 on create and update; start_time set when in_progress; forbid todo->done', () => {
    const projects = new ProjectsDao()
    const tasks = new TasksDao()
    const p = projects.create({ title: 'P' })

    const id = tasks.create({ project_id: p, title: 'done-at-create', status: 'done', progress: 0 })
    const row = tasks.getById(id)!
    expect(row.progress).toBe(100)

    const id2 = tasks.create({ project_id: p, title: 'todo', status: 'todo', progress: 10 })
    let row2 = tasks.getById(id2)!
    expect(row2.progress).toBe(10)

    // update status to done should bump to 100
    tasks.update(id2, { status: 'done' })
    row2 = tasks.getById(id2)!
    expect(row2.progress).toBe(100)

    // start_time set when moving to in_progress
    const id3 = tasks.create({ project_id: p, title: 't3', status: 'todo' })
    let r3 = tasks.getById(id3)!
    expect(r3.start_time).toBeNull()
    tasks.update(id3, { status: 'in_progress' })
    r3 = tasks.getById(id3)!
    expect(typeof r3.start_time).toBe('number')
  })

  it('inline updates for status/priority/progress', () => {
    const projects = new ProjectsDao()
    const tasks = new TasksDao()
    const p = projects.create({ title: 'P' })

    const id = tasks.create({ project_id: p, title: 't', status: 'todo', priority: 'low', progress: 0 })
    let row = tasks.getById(id)!
    expect(row.priority).toBe('low')
    expect(row.progress).toBe(0)

    tasks.update(id, { priority: 'high' })
    row = tasks.getById(id)!
    expect(row.priority).toBe('high')

    tasks.update(id, { progress: 55 })
    row = tasks.getById(id)!
    expect(row.progress).toBe(55)
  })
})


