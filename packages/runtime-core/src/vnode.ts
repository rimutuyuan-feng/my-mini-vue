import { ShapeFlags } from "@my-mini-vue/shared"
import { isObject } from "@my-mini-vue/shared"
export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")
export { createVNode as createElementVnode }
export function createTextVNode(text: string){
  return createVNode(Text, null, text)
}
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    key: props?.key,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
    component: null
  }
  if(typeof children === "string"){
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }
  return vnode
}
function getShapeFlag(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
