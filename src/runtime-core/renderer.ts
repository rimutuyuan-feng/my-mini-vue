import { ShapeFlags } from "../shared/ShapeFlags"
import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
  patch(vnode, container)
}
function patch(vnode, container) {
  const { type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        //处理元素
        processElement(vnode, container)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //处理组件
        processComponent(vnode, container)
      }
  }
}
function processFragment(vnode, container) {
  mountchildren(vnode.children, container)
}
function processText(vnode, container) {
  mountText(vnode, container)
}
function mountText(vnode, container){
  const text = document.createTextNode(vnode.children)
  container.append(text)
}
function processElement(vnode, container) {
  mountElement(vnode, container)
}
//挂载元素
function mountElement(vnode, container) {
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
    mountchildren(children, el)
  }
  container.append(el)
}
function mountchildren(children, container) {
  children.forEach(vnode => {
    patch(vnode, container)
  })
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


