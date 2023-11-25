import { mutableHandlers, readonlyHandler, shallowReadonlyHanlder } from './baseHandler'
//特殊的reactive对象的key
export const enum ReactiveFlags{
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}
/**
 * 返回一个对象的响应式代理
 * @param raw 
 * @returns 
 */
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}
/**
 * 返回对象的只读代理
 * @param raw 
 * @returns 
 */
export function readonly(raw: object){
  return createActiveObject(raw, readonlyHandler)
}
/**
 * 返回对象的浅层只读代理
 * @param raw 
 * @returns 
 */
export function shallowReadonly(raw){
  return createActiveObject(raw, shallowReadonlyHanlder)
}
/**
 * 根据参数返回一个代理对象
 * @param raw 
 * @param handlers 
 * @returns 
 */
function createActiveObject(raw, handlers){
  return new Proxy(raw, handlers)
}
/**
 * 检查对象是否由reactive创建的代理
 * @param raw 
 * @returns 
 */
export function isReactive(raw){
  return !!raw[ReactiveFlags.IS_REACTIVE]
}
/**
 * 检查是否是只读对象
 * @param raw 
 * @returns 
 */
export function isReadonly(raw){
  return !!raw[ReactiveFlags.IS_READONLY]
}
/**
 * 检查对象是否是由reactive()、readonly()、shallowReadonly()创建的代理
 * @param raw 
 * @returns 
 */
export function isProxy(raw){
  return isReactive(raw)||isReadonly(raw)
}
