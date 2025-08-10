import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import LanMembersPanel from '../lan-members-panel.vue'

describe('LanMembersPanel', () => {
  it('shows online peers and can navigate', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/app/messages', name: 'messages', component: { template: '<div />' } }
      ]
    })
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(LanMembersPanel, { global: { plugins: [router] } })
    await new Promise((r) => setTimeout(r))
    const items = wrapper.findAll('li.member')
    expect(items.length).toBeGreaterThan(0)
    await items[0].trigger('click')
    expect(pushSpy).toHaveBeenCalled()
  })
})


