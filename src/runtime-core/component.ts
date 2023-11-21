import { shallowReadonly } from "../reactivity/reactive"
import { proxyRefs } from "../reactivity/ref"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlots"
import { publicInstanceProxyHandler } from "./publicComponentInstance"
let currentInstance = null
export function createComponentInstance(vnode, parent) {
  const instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    update: null,
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: null,
    next: null
  }
  instance.emit = emit.bind(null, instance) as any
  return instance
}
function setCurrrentInstance(instance) {
  currentInstance = instance
}
export function getCurrentInstance() {
  return currentInstance
}
export function setupComponent(instance) {
  //TODO init props
  initProps(instance)
  //TODO init slots
  initSlots(instance)
  setupStatefulComponent(instance)

}

function setupStatefulComponent(instance) {
  const component = instance.type
  //定义组件代理对象
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler)
  if (component.setup && component.setup()) {
    setCurrrentInstance(instance)
    const res = proxyRefs(component.setup(shallowReadonly(instance.props), { emit: instance.emit }))
    handleSetupResult(res, instance)
    setCurrrentInstance(null)
  } else {
    finishComponentSetup(instance)
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
  } else if (compiler && component.template) {
    instance.render = compiler(component.template)
  }
}
let compiler
export function registerRuntimeComplier(_complier) {
  compiler = _complier
}
