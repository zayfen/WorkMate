import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MessagesView from '../messages-view.vue'

describe('MessagesView', () => {
  it('mounts and renders vue-advanced-chat', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/app/messages', name: 'messages', component: MessagesView }
      ]
    })
    await router.push({ name: 'messages', query: { to: 'peer-1' } })
    await router.isReady()
    const wrapper = mount(MessagesView, { global: { plugins: [router] } })
    // custom element renders
    expect(wrapper.find('vue-advanced-chat').exists()).toBeTruthy()
  })
})


