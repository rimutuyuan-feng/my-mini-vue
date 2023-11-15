import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/ShapeFlags"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils"
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
  function render(n1, n2, container, parentComponent, achor) {
    patch(n1, n2, container, parentComponent, achor)
  }
  function patch(n1, n2, container, parentComponent, achor) {
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
          processElement(n1, n2, container, parentComponent, achor)
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent, achor)
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
  function processElement(n1, n2, container, parentComponent, achor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, achor)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }
  //挂载元素
  function mountElement(vnode, container, parentComponent, achor) {
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
    hostInsert(el, container, achor)
  }
  function mountchildren(children, container, parentComponent) {
    children.forEach(vnode => {
      patch(null, vnode, container, parentComponent, null)
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
    const c1 = n1.children
    const c2 = n2.children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //array to text
        //将原children清空
        unmountChildren(c1)
      }
      //text to text
      hostSetElementText(container, c2)
    } else {
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        //text to array
        //text清空
        hostSetElementText(container, "")
        mountchildren(c2, container, parentComponent)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent)
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
  function patchKeyedChildren(c1, c2, container, parentComponent) {
    const l1 = c1.length
    const l2 = c2.length
    let e1 = l1 - 1
    let e2 = l2 - 1
    let i = 0
    function isSameVNodeType(n1, n2) {
      return n1.key === n2.key && n1.type === n2.type
    }
    //左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, null)
        i++
      } else {
        break
      }
    }
    //右侧对比
    while (e1 >= i && e2 >= i) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, null)
        e1--
        e2--
      } else {
        break
      }
    }
    //新节点比旧节点多
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1
          const achor = nextPos < l2 ? c2[nextPos].el : null
          patch(null, c2[i], container, parentComponent, achor)
          i++
        }
      }
    } else if (i > e2) { //旧节点比新节点多
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else { //新旧节点均未完全遍历，中间对比
      const toBePatched = e2 - i + 1
      let patched = 0
      //新节点key index映射
      const keyToNewIndexMap = new Map()
      //新节点index和旧节点index映射
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
      //遍历填充keyToNewIndexMap
      for (let j = i; j <= e2; j++) {
        const nextChild = c2[j]
        keyToNewIndexMap.set(nextChild.key, j)
      }
      //是否需要移动节点
      let moved = false
      //遍历旧节点
      for (let j = i; j <= e1; j++) {
        const preChild = c1[j]
        //优化，当新节点都patch完毕后，剩余旧节点直接移除
        if (patched >= toBePatched) {
          hostRemove(preChild.el)
          continue
        }
        let newIndex
        //判断是否有key
        if (preChild.key !== null) {
          newIndex = keyToNewIndexMap.get(preChild.key)
          newIndexToOldIndexMap[newIndex - i] = j + 1
        } else {
          for (let l = i; l <= e2; l++) {
            if (isSameVNodeType(preChild, c2[l])) {
              newIndex = l
              break
            }
          }
        }
        if (newIndex === undefined) {
          //新节点没有对应节点直接移除
          hostRemove(preChild.el)
        } else {
          patch(preChild, c2[newIndex], container, parentComponent, null)
          patched++
          moved = true
        }
      }
      //获取最长递增子序列
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let seqIndex = increasingNewIndexSequence.length - 1
      for (let j = toBePatched - 1; j >= 0; j--) {
        const nextIndex = j + i
        const nextChild = c2[nextIndex]
        const achor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
        //新增
        if (newIndexToOldIndexMap[j] === 0) {
          patch(null, nextChild, container, parentComponent, achor)
        } else if (moved) {
          //移动
          if (j < 0 || increasingNewIndexSequence[seqIndex] !== j) {
            hostInsert(nextChild.el, container, achor)
          } else { //保持
            seqIndex--
          }
        }

      }
    }
  }
  function getSequence(arr: number[]): number[] {
    const length = arr.length
    //记录以数组中每一个当前位置数结尾的递增序列的前一个位置
    const tempArr = new Array(length).fill(0)
    //如果有resubt[i] = b 表示在所有长度为i+1的递增序列中，最小结尾数量为b
    const result = [0]
    for (let i = 1; i < length; i++) {
      if (arr[i] === 0) {
        continue
      }
      const arrI = arr[i]
      if (arrI > arr[result[result.length - 1]]) {
        tempArr[i] = result[result.length - 1]
        result.push(i)
      } else {
        let left = 0
        let right = result.length - 1
        while (left < right) {
          const mid = (left + right) >> 1
          if (arrI > arr[mid]) {
            left = mid + 1
          } else {
            right = mid
          }
        }
        if (arrI < arr[result[left]]) {
          if (left > 0) {
            tempArr[i] = result[left - 1]
          }
          result[left] = i
        }
      }
    }
    let index = result.length - 1
    while (index > 0) {
      const pre = tempArr[result[index]]
      result[index - 1] = pre
      index--
    }
    return result
  }

  //处理组件
  function processComponent(n1, n2: any, container: any, parentComponent, achor) {
    if (!n1) {
      //挂载组件
      mountComponent(n2, container, parentComponent, achor)
    } else {
      //更新组件
      updateComponent(n1, n2)
    }

  }
  //更新组件
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.node = n2
    }

  }

  function mountComponent(initialVnode: any, container: any, parentComponent, achor) {
    //创建instance对象
    const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent))
    //初始化组件
    setupComponent(instance)
    setupRenderEffect(instance, container, achor)
  }

  function setupRenderEffect(instance, container, achor) {
    instance.update = effect(() => {
      const { isMounted } = instance
      if (!isMounted) {
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, instance, achor)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      } else {
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }
        const subTree = instance.render.call(instance.proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance, achor)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      }

    })
  }
  function updateComponentPreRender(instance, nextVnode) {
    instance.props = nextVnode.props
    instance.vnode = nextVnode
    instance.next = null
  }
  return {
    createApp: createAppAPI(render)
  }
}

