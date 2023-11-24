import { baseCompile } from "@my-mini-vue/compiler-core"
import * as runtimeDom from "@my-mini-vue/runtime-dom"
export * from "@my-mini-vue/runtime-dom"

export function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function("Vue", code)(runtimeDom)
  return render
}
runtimeDom.registerRuntimeCompiler(compileToFunction)
