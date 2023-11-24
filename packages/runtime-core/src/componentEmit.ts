import { hasOwn, toHandlerKey } from "@my-mini-vue/shared"

export function emit(instance, event, ...args) {
  const { props } = instance
  const handerKey = toHandlerKey(event)
  if (hasOwn(props, handerKey)) {
    props[handerKey](...args)
  }
}
