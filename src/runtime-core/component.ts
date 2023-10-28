import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandler } from "./publicComponentInstance"

export function createComponentInstance(vnode) {
  return {
    vnode,
    type: vnode.type,
    setupState: {}
  }
}

export function setupComponent(instance) {
  //TODO init props
  initProps(instance)
  //TODO init slots
  setupStatefulComponent(instance)

}

function setupStatefulComponent(instance) {
  const component = instance.type
  //定义组件代理对象
  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandler)
  if (component.setup) {
    const res = component.setup(shallowReadonly(instance.props))
    handleSetupResult(res, instance)
  }
}
function handleSetupResult(res, instance) {
  //TODO function res
  if (typeof res === "object") {
    instance.setupState = res
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type
  if (component.render) {
    instance.render = component.render
  }
}
