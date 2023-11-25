import { trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "@my-mini-vue/shared"
/**
 * 返回一个响应式的、可更改的ref对象
 * @param value 
 * @returns 
 */
export function ref(value) {
  return new RefImpl(value)
}
/**
 * ref对象
 */
class RefImpl {
  private _value
  private _rawValue
  deps = new Set()
  private __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }
  get value() {
    trackEffect(this.deps)
    return this._value
  }
  set value(newValue) {
    if (hasChanged(this._value, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffect(this.deps)
    }

  }
}
/**
 * 非对象直接返回，对象返回reactive()的结果
 * @param value 
 * @returns 
 */
function convert(value) {
  return isObject(value) ? reactive(value) : value
}
/**
 * 检查某个值是否为ref
 * @param ref 
 * @returns 
 */
export function isRef(ref) {
  return !!ref.__v_isRef
}
/**
 * 如果参数是 ref，则返回内部值，否则返回参数本身
 * @param ref 
 * @returns 
 */
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}
/**
 * 返回一个有ref属性对象的代理对象
 * @param objectWithRefs 
 * @returns 
 */
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(traget, key, value){
      if(isRef(traget[key]) && !isRef(value)){
        return traget[key].value = value
      }else{
        return Reflect.set(traget, key, value)
      }
    }
  })
}
