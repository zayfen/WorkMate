import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import DashboardView from '../dashboard-view.vue'
import WeeklyStats from '@/components/weekly-stats/weekly-stats.vue'

describe('DashboardView', () => {
  function makeRouter() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/app/dashboard', name: 'dashboard', component: DashboardView },
        { path: '/app/tasks', name: 'tasks', component: { template: '<div />' } },
        { path: '/app/calendar', name: 'calendar', component: { template: '<div />' } },
        { path: '/app/reports', name: 'reports', component: { template: '<div />' } }
      ]
    })
    return router
  }

  it('loads data from api and renders stats, alerts and today tasks; quick actions navigate', async () => {
    const now = Date.now()
    const twoH = 2 * 60 * 60 * 1000
    const fourH = 4 * 60 * 60 * 1000
    const sixH = 6 * 60 * 60 * 1000
    const thirtyH = 30 * 60 * 60 * 1000
    const lastWeek = now - 7 * 24 * 60 * 60 * 1000

    // projects map
    window.api!.listProjects = vi.fn(async () => ([
      { id: 1, title: '项目 A', description: null, created_at: now - 1, archived: false, estimated_end_at: null, participants: [], counts: { total: 0, done: 0, in_progress: 0, todo: 0 } },
      { id: 2, title: '项目 B', description: null, created_at: now - 1, archived: false, estimated_end_at: null, participants: [], counts: { total: 0, done: 0, in_progress: 0, todo: 0 } }
    ])) as any

    // tasks provider with behavior by filters
    window.api!.listTasks = vi.fn(async (filters?: any) => {
      if (filters?.due === 'today') {
        return [
          { id: 1, project_id: 1, title: '今天任务 1', description: null, participants: [], due_date: now + twoH, priority: 'medium', status: 'todo', note: null, created_at: now - 1000, updated_at: null },
          { id: 2, project_id: 2, title: '今天任务 2', description: null, participants: [], due_date: now + fourH, priority: 'high', status: 'in_progress', note: null, created_at: now - 2000, updated_at: null },
          { id: 3, project_id: 1, title: '今天任务 3（已完成）', description: null, participants: [], due_date: now - twoH, priority: 'low', status: 'done', note: null, created_at: now - 3000, updated_at: now - 1000 }
        ]
      }
      if (filters?.due === 'this_week' && filters?.includeDone) {
        // 10 tasks in week, 6 done
        const done = Array.from({ length: 6 }, (_, i) => ({ id: 100 + i, project_id: 1, title: `本周已完成 ${i+1}` , description: null, participants: [], due_date: now + (i+1) * twoH, priority: 'medium', status: 'done' as const, note: null, created_at: now - 5000, updated_at: now - 100 }))
        const notDone = Array.from({ length: 4 }, (_, i) => ({ id: 200 + i, project_id: 2, title: `本周未完成 ${i+1}`, description: null, participants: [], due_date: now + (i+1) * fourH, priority: 'low', status: (i % 2 === 0 ? 'todo' : 'in_progress') as const, note: null, created_at: now - 4000, updated_at: null }))
        return [...done, ...notDone]
      }
      if (filters?.due === 'this_week') {
        // upcoming alerts source
        return [
          { id: 11, project_id: 1, title: '即将到期任务', description: null, participants: [], due_date: now + sixH, priority: 'medium', status: 'in_progress', note: null, created_at: now - 3000, updated_at: null },
          { id: 12, project_id: 2, title: '超过 24 小时任务', description: null, participants: [], due_date: now + thirtyH, priority: 'low', status: 'todo', note: null, created_at: now - 3000, updated_at: null }
        ]
      }
      if (filters?.includeDone) {
        // last week done 3 tasks + this week
        const lastWeekDone = Array.from({ length: 3 }, (_, i) => ({ id: 300 + i, project_id: 1, title: `上周完成 ${i+1}`, description: null, participants: [], due_date: lastWeek + (i+1) * twoH, priority: 'medium', status: 'done' as const, note: null, created_at: lastWeek - 5000, updated_at: lastWeek + 100 }))
        const thisWeekAll = await (window.api!.listTasks as any)({ due: 'this_week', includeDone: true })
        return [...lastWeekDone, ...thisWeekAll]
      }
      return []
    }) as any

    const router = makeRouter()
    await router.push({ name: 'dashboard' })
    await router.isReady()
    const pushSpy = vi.spyOn(router, 'push')

    // spy updateTask to observe advance behavior
    window.api!.updateTask = vi.fn(async () => true) as any

    const wrapper = mount(DashboardView, { global: { plugins: [router] } })

    // allow mounted hooks and async API calls to resolve
    await nextTick()
    await Promise.resolve()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    await nextTick()

    // today tasks rendered
    expect(wrapper.text()).toContain('今天任务 1')
    expect(wrapper.text()).toContain('今天任务 2')

    // checkbox advance flow
    // 1) 未开始 -> 进行中（按排序，第二个复选框对应 todo）
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    await checkboxes[1].setValue(true)
    expect(window.api!.updateTask).toHaveBeenCalledWith(expect.objectContaining({ id: 1, status: 'in_progress' }))
    // 2) 进行中 -> 已完成（按排序，第一个复选框对应 in_progress）
    await checkboxes[0].setValue(true)
    const calls = (window.api!.updateTask as any).mock.calls
    const last = calls[calls.length - 1][0]
    expect(last).toMatchObject({ id: 2, status: 'done' })

    // 3) 已完成显示在最后（只读，不触发 advance）
    const lastRow = wrapper.findAll('div').find((d) => d.text().includes('今天任务 3（已完成）'))
    expect(lastRow).toBeTruthy()

    // alerts rendered (contains remain text)
    expect(wrapper.text()).toContain('即将到期')
    expect(wrapper.text()).toContain('剩余')

    // weekly stats props
    const stats = wrapper.findComponent(WeeklyStats)
    expect(stats.exists()).toBe(true)
    const props = stats.props() as any
    expect(props.doneCount).toBeGreaterThan(0)
    expect(props.completionPercent).toBeGreaterThan(0)
    expect(props.completionPercent).toBeLessThanOrEqual(100)
    expect(typeof props.trendPercent).toBe('number')
    expect(props.trendPercent).toBeGreaterThanOrEqual(0)

    // quick actions navigate
    const actionButtons = wrapper.findAll('.actions .link')
    expect(actionButtons.length).toBe(3)
    await actionButtons[0].trigger('click')
    await nextTick(); await Promise.resolve(); await nextTick()
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'tasks' }))
    await actionButtons[1].trigger('click')
    await nextTick(); await Promise.resolve(); await nextTick()
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'calendar' }))
    await actionButtons[2].trigger('click')
    await nextTick(); await Promise.resolve(); await nextTick()
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'reports' }))
  })
})


