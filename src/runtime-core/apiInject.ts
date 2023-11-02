import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    //第一次调用provide
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }


}
export function inject(key) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const { provides } = currentInstance.parent
    return provides[key]
  }

}
