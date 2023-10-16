import { mutableHandlers, readonlyHandler, shallowReadonlyHanlder } from './baseHandler'

export const enum ReactiveFlags{
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}
export function reactive(raw){
  return createActiveObject(raw, mutableHandlers)
}
export function readonly(raw){
  return createActiveObject(raw, readonlyHandler)
}
export function shallowReadonly(raw){
  return createActiveObject(raw, shallowReadonlyHanlder)
}

function createActiveObject(raw, handlers){
  return new Proxy(raw, handlers)
}

export function isReactive(raw){
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw){
  return !!raw[ReactiveFlags.IS_READONLY]
}
