//复制对象属性
export const extend = Object.assign
//判断是否是对象
export function isObject(raw) {
  return raw !== null && typeof raw === "object"
}
//判断是否改变
export function hasChanged(value, newValue) {
  return !Object.is(value, newValue)
}
