import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/ShapeFlags"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"
export function createRender(options) {

  const { 
    createElement: hostCreateElement, 
    patchProp: hostPatchProp, 
    insert: hostInsert, 
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options
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
      patchElement(n1, n2, container, parentComponent)
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
  function patchElement(n1, n2, container, parentComponent) {
    console.log("patchElement")
    console.log(n1, n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    //更新props
    patchProps(el, oldProps, newProps)
    //更新children
    patchChildren(n1, n2, el, parentComponent)
  }
  //更新props
  function patchProps(el, oldPorps, newProps) {
    if (oldPorps != newProps) {
      //修改
      for (const key in newProps) {
        const preProp = oldPorps[key]
        const nextProp = newProps[key]
        if (preProp !== nextProp) {
          hostPatchProp(el, key, preProp, nextProp)
        }
      }
      //删除
      if (oldPorps === EMPTY_OBJ) return
      for (const key in oldPorps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldPorps[key], undefined)
        }
      }
    }
  }
  //更新Children
  function patchChildren(n1, n2, container, parentComponent) {
    const { shapeFlag } = n2
    const preShapeFlag = n1.shapeFlag
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //array to text
        //将原children清空
        unmountChildren(n1.children)
      } 
      //text to text
      hostSetElementText(container, n2.children)
    } else {
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        //text to array
        //text清空
        hostSetElementText(container, "")
        mountchildren(n2.children, container, parentComponent)
      }
    }
  }
  //清空元素
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
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
        patch(null, subTree, container, instance)
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

