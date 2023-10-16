import { track ,trigger} from "./effect";
import {ReactiveFlags, reactive, readonly} from "./reactive"
import { extend, isObject } from "./shared";
function createGetter(isReadonly=false, isShallowReadonly=false){
  return function get(target, key){
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }
    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if(isShallowReadonly){
      return res
    }
    if(!isReadonly){
      track(target, key)
    }
    //深层次响应式
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}
function createSetter(){
  return function set(target, key, value){
    const res = Reflect.set(target, key, value)
    //触发依赖
    trigger(target,key)
    return res
  }
}
export const mutableHandlers={
  get: createGetter(),
  set: createSetter()
}
export const readonlyHandler={
  get: createGetter(true),
  set(target, key, value){
    console.warn(`${key} set 失败 因为 target 是 readonly`, target)
    return true
  }
}
export const shallowReadonlyHanlder=extend({}, readonlyHandler, {get: createGetter(true,true)})
