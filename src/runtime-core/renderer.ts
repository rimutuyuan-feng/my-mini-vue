import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/ShapeFlags"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"
export function createRender(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options
  // n1：oldVnode, n2: newVnode
  function render(n1, n2, container, parentComponent) {
    patch(n1, n2, container, parentComponent)
  }
  function patch(n1, n2, container, parentComponent) {
    const { type } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素
          processElement(n1, n2, container, parentComponent)
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }
  function processFragment(n1, n2, container, parentComponent) {
    mountchildren(n2.children, container, parentComponent)
  }
  function processText(n1, n2, container) {
    mountText(n2, container)
  }
  function mountText(vnode, container) {
    const text = document.createTextNode(vnode.children)
    container.append(text)
  }
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }
  //挂载元素
  function mountElement(vnode, container, parentComponent) {
    const { type, props, children } = vnode
    //创建元素
    const el = hostCreateElement(type)
    vnode.el = el
    //设置元素属性
    if (isObject(props)) {
      for (const key in props) {

        hostPatchProp(el, key, null, props[key])
      }
    }
    //挂载元素子节点
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountchildren(children, el, parentComponent)
    }
    hostInsert(el, container)
  }
  function mountchildren(children, container, parentComponent) {
    children.forEach(vnode => {
      patch(null, vnode, container, parentComponent)
    })
  }
  //更新元素
  function patchElement(n1, n2, container){
    console.log("patchElement")
    console.log(n1, n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
  }
  function patchProps(el, oldPorps, newProps){
    if(oldPorps != newProps){
      //修改
      for (const key in newProps) {
        const preProp = oldPorps[key]
        const nextProp = newProps[key]
        if (preProp !== nextProp) {
          console.log(nextProp)
          hostPatchProp(el, key, preProp, nextProp)
        }
      }
      //删除
      if(oldPorps === EMPTY_OBJ) return
      for (const key in oldPorps) {
        if (!(key in newProps)){
          hostPatchProp(el, key, oldPorps[key], undefined)
        }
      }
    }
  }
  //处理组件
  function processComponent(n1, n2: any, container: any, parentComponent) {
    //挂载组件
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVnode: any, container: any, parentComponent) {
    //创建instance对象
    const instance = createComponentInstance(initialVnode, parentComponent)
    //初始化组件
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }

  function setupRenderEffect(instance, container) {
    effect(() => {
      const { isMounted } = instance
      if (!isMounted) {
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        patch(null,subTree, container, instance)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      } else {
        const subTree = instance.render.call(instance.proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      } 
      
    })
  }
  return {
    createApp: createAppAPI(render)
  }
}

