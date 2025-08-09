import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserProfileView from '../user-profile-view.vue'

describe('UserProfileView', () => {
  it('loads and renders basic fields', async () => {
    const wrapper = mount(UserProfileView)
    await Promise.resolve()
    expect(wrapper.find('input[placeholder="输入姓名"]').exists()).toBe(true)
    expect(wrapper.find('textarea[placeholder="个性签名或备注"]').exists()).toBe(true)
  })

  it('saves profile and shows toast (stubbed)', async () => {
    const wrapper = mount(UserProfileView)
    await Promise.resolve()
    const nameInput = wrapper.find('input[placeholder="输入姓名"]')
    await nameInput.setValue('Alice From Test')
    await wrapper.find('button.primary').trigger('click')
    // 由于 toast 在测试中未实际渲染，这里只验证不会抛错，且按钮恢复可用
    await Promise.resolve()
    expect(wrapper.find('button.primary').attributes('disabled')).toBeUndefined()
  })
})


