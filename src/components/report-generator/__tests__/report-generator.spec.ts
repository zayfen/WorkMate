import { mount } from '@vue/test-utils'
import ReportGenerator from '@/components/report-generator/report-generator.vue'

describe('ReportGenerator', () => {
  it('emits generate with week default', async () => {
    const wrapper = mount(ReportGenerator)
    await wrapper.find('button.primary').trigger('click')
    const emits = wrapper.emitted('generate')
    expect(emits).toBeTruthy()
    const payload = emits![0][0] as { granularity: string; from: number; to: number }
    expect(payload.granularity).toBe('week')
    expect(payload.from).toBeLessThanOrEqual(payload.to)
  })
})


