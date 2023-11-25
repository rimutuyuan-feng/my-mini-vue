import { track ,trigger} from "./effect";
import {ReactiveFlags, reactive, readonly} from "./reactive"
import { extend, isObject } from "@my-mini-vue/shared";
/**
 * 返回一个用于创建代理对象的get函数
 * @param isReadonly 
 * @param isShallowReadonly 
 * @returns 
 */
function createGetter(isReadonly=false, isShallowReadonly=false){
  return function get(target, key){
    //特殊key，用于isReactive
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }
    //特殊key，用于isReadonly
    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }
    //通过反射拿到key对应的value
    const res = Reflect.get(target, key)
    //浅层次处理
    if(isShallowReadonly){
      return res
    }
    //非只读处理
    if(!isReadonly){
      //收集依赖
      track(target, key)
    }
    //深层次响应式
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}
/**
 * 返回一个用于创建代理对象的set函数
 * @returns 
 */
function createSetter(){
  return function set(target, key, value){
    //通过反射修改key对应的value
    const res = Reflect.set(target, key, value)
    //触发依赖
    trigger(target,key)
    return res
  }
}
//用于创建object和array响应式代理的handler
export const mutableHandlers={
  get: createGetter(),
  set: createSetter()
}
//用于创建object和array只读代理的handler
export const readonlyHandler={
  get: createGetter(true),
  set(target, key, value){
    console.warn(`${key} set 失败 因为 target 是 readonly`, target)
    return true
  }
}
//用于创建object和array浅层只读代理的handler
export const shallowReadonlyHanlder=extend({}, readonlyHandler, {get: createGetter(true,true)})
