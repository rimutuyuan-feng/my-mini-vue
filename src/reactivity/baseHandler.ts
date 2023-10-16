import { track ,trigger} from "./effect";
import {ReactiveFlags} from "./reactive"
function createGetter(isReadonly=false){
  return function get(target, key){
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }
    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if(!isReadonly){
      track(target, key)
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