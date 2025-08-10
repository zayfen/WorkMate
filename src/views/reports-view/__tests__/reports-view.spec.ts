import { mount } from '@vue/test-utils'
import ReportsView from '@/views/reports-view/reports-view.vue'

describe('ReportsView', () => {
  it('generates and exports without crash', async () => {
    const wrapper = mount(ReportsView)
    // click generate inside child
    await wrapper.find('button.primary').trigger('click')
    // export buttons
    const buttons = wrapper.findAll('button.btn')
    for (const b of buttons) {
      await b.trigger('click')
    }
    expect(true).toBe(true)
  })
})


