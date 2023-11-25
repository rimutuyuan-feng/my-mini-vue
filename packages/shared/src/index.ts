/**
 * 将可枚举的自身属性从一个或多个源对象复制到目标对象
 */
export const extend = Object.assign
/**
 * 空对象
 */
export const EMPTY_OBJ = {}
/**
 * 检查是否为object类型
 * @param raw 
 * @returns 
 */
export function isObject(raw) {
  return raw !== null && typeof raw === "object"
}
/**
 * 检查是否为string类型
 * @param value 
 * @returns 
 */
export function isString(value) {
  return typeof value === "string"
}
/**
 * 检查是否为不同值
 * @param value 
 * @param newValue 
 * @returns 
 */
export function hasChanged(value, newValue) {
  return !Object.is(value, newValue)
}
/**
 * 检查key是否为obj自身属性
 * @param obj 
 * @param key 
 * @returns 
 */
export function hasOwn(obj, key){
  return Object.prototype.hasOwnProperty.call(obj, key)
}
/**
 * 字符串连字符型转驼峰: xx-xx -> xxXx
 * @param str 
 * @returns 
 */
function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : ""
  })
}
/**
 * 字符串首字母转大写
 * @param str 
 * @returns 
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
/**
 *  字符串转换：xxx -> onXxx
 * @param str 
 * @returns 
 */
export function toHandlerKey(str) {
  return str ? "on" + capitalize(camelize(str)) : ""
}

export { ShapeFlags } from "./ShapeFlags"
export { toDisplayString } from "./toDisplayString"
