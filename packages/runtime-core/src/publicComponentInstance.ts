import { hasOwn } from "@my-mini-vue/shared"

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props
}
export const publicInstanceProxyHandler = {
  get({_: instance}, key) {
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    if(hasOwn(props, key)){
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
