import { trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "./shared"

export function ref(value) {
  return new RefImpl(value)
}
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

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

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
