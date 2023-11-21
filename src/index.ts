import { baseComplie } from "./compiler-core/src"
import * as runtimeDom from "./runtime-dom"
export * from "./runtime-dom"

export function complieToFunction(template) {
  const { code } = baseComplie(template)
  const render = new Function("Vue", code)(runtimeDom)
  return render
}
runtimeDom.registerRuntimeComplier(complieToFunction)
