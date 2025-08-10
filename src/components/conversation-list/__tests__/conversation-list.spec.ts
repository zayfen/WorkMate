import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ConversationList from '../conversation-list.vue'

describe('ConversationList', () => {
  it('renders conversations from api and allows navigation', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/app/messages', name: 'messages', component: { template: '<div />' } }
      ]
    })
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(ConversationList, { global: { plugins: [router] } })
    await new Promise((r) => setTimeout(r))
    const items = wrapper.findAll('li.item')
    expect(items.length).toBeGreaterThan(0)
    await items[0].trigger('click')
    expect(pushSpy).toHaveBeenCalled()
  })
})


