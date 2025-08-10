import { mount } from '@vue/test-utils'
import ChatWindow from '../chat-window.vue'

describe('ChatWindow', () => {
  it('renders header and messages scroll container', async () => {
    const wrapper = mount(ChatWindow, { props: { peerId: 'peer-1' } })
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.list').exists()).toBe(true)
  })
})


