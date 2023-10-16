//复制对象属性
export const extend = Object.assign
//判断是否是对象
export function isObject(raw){
  return raw !== null && typeof raw === "object"
}
