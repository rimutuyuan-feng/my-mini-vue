//复制对象属性
export const extend = Object.assign
export const EMPTY_OBJ = {}
//判断是否是对象
export function isObject(raw) {
  return raw !== null && typeof raw === "object"
}
export function isString(value) {
  return typeof value === "string"
}
//判断是否改变
export function hasChanged(value, newValue) {
  return !Object.is(value, newValue)
}
//判断对象是由有相应的key
export function hasOwn(obj, key){
  return Object.prototype.hasOwnProperty.call(obj, key)
}
 //xx-xx->xxXx
 function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : ""
  })
}
//event->Event
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
//Event->onEvent
export function toHandlerKey(str) {
  return str ? "on" + capitalize(camelize(str)) : ""
}

export { ShapeFlags } from "./ShapeFlags"
export { toDisplayString } from "./toDisplayString"
