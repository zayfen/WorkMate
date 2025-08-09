import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders props.msg', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Unit Test' } })
    expect(wrapper.text()).toContain('Unit Test')
  })
})


