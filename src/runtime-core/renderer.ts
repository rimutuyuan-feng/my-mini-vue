import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}
function patch(vnode, container) {
  //处理组件
  processComponent(vnode, container)
}
function processComponent(vnode: any, container: any) {
  //挂载组件
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
  //创建instance对象
  const instance = createComponentInstance(vnode)
  //初始化组件
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container){
  const subTree = instance.render()
  patch(subTree, container)
}


