export function createComponentInstance(vnode) {
  return {
    vnode,
    type: vnode.type
  }
}

export function setupComponent(instance) {
  //TODO init props
  //TODO init slots
  setupStatefulComponent(instance)

}

function setupStatefulComponent(instance) {
  const component = instance.type
  if (component.setup){
    const res = component.setup()
    handleSetupResult(res, instance)
  }
}
function handleSetupResult(res, instance){
  //TODO function res
  if (typeof res === "object"){
    instance.setupState = res
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance
  if (component.render){
    instance.render = component.render
  }
}
