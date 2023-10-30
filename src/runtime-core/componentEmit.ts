import { hasOwn, toHandlerKey } from "../shared/index"

export function emit(instance, event, ...args) {
  const { props } = instance
  const handerKey = toHandlerKey(event)
  if (hasOwn(props, handerKey)) {
    props[handerKey](...args)
  }
}
