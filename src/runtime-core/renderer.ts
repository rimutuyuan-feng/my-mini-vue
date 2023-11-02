import { ShapeFlags } from "../shared/ShapeFlags"
import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container, parentComponent) {
  patch(vnode, container, parentComponent)
}
function patch(vnode, container, parentComponent) {
  const { type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        //处理元素
        processElement(vnode, container, parentComponent)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //处理组件
        processComponent(vnode, container, parentComponent)
      }
  }
}
function processFragment(vnode, container, parentComponent) {
  mountchildren(vnode.children, container, parentComponent)
}
function processText(vnode, container) {
  mountText(vnode, container)
}
function mountText(vnode, container){
  const text = document.createTextNode(vnode.children)
  container.append(text)
}
function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}
//挂载元素
function mountElement(vnode, container, parentComponent) {
  const { type, props, children } = vnode
  //创建元素
  const el = document.createElement(type)
  function isOn(str) {
    return /^on[A-Z]/.test(str)
  }
  vnode.el = el
  //设置元素属性
  if (isObject(props)) {
    for (const key in props) {
      if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), props[key])
      } else {
        el.setAttribute(key, props[key])
      }
    }
  }
  //挂载元素子节点
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountchildren(children, el, parentComponent)
  }
  container.append(el)
}
function mountchildren(children, container, parentComponent) {
  children.forEach(vnode => {
    patch(vnode, container, parentComponent)
  })
}
//处理组件
function processComponent(vnode: any, container: any, parentComponent) {
  //挂载组件
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVnode: any, container: any, parentComponent) {
  //创建instance对象
  const instance = createComponentInstance(initialVnode, parentComponent)
  //初始化组件
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container, instance)
  instance.vnode.el = subTree.el
}


