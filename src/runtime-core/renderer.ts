import { isObject } from "../reactivity/shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}
function patch(vnode, container) {
  if (typeof vnode.type === 'string') {
    //处理元素
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    //处理组件
    processComponent(vnode, container)
  }
}
function processElement(vnode, container) {
  mountElement(vnode, container)
}
//挂载元素
function mountElement(vnode, container) {
  const { type, props, children } = vnode
  //创建元素
  const el = document.createElement(type)
  vnode.el = el
  //设置元素属性
  if (isObject(props)) {
    for (const key in props) {
      el.setAttribute(key, props[key])
    }
  }
  //挂载元素子节点
  mountchildren(children, el)
  container.append(el)
}
function mountchildren(children, container) {
  if (typeof children === 'string') {
    container.textContent = children
  } else if (Array.isArray(children)) {
    children.forEach(vnode => {
      patch(vnode, container)
    })
  }
}
//处理组件
function processComponent(vnode: any, container: any) {
  //挂载组件
  mountComponent(vnode, container)
}

function mountComponent(initialVnode: any, container: any) {
  //创建instance对象
  const instance = createComponentInstance(initialVnode)
  //初始化组件
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container)
  instance.vnode.el = subTree.el
}


