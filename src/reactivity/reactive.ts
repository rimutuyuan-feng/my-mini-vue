import { mutableHandlers, readonlyHandler } from './baseHandler'
export function reactive(raw){
  return createActiveObject(raw, mutableHandlers)
}
export function readonly(raw){
  return createActiveObject(raw, readonlyHandler)
}

function createActiveObject(raw, handlers){
  return new Proxy(raw, handlers)
}
