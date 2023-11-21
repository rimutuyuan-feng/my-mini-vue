import { baseCompile } from "./compiler-core/src"
import * as runtimeDom from "./runtime-dom"
export * from "./runtime-dom"

export function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function("Vue", code)(runtimeDom)
  return render
}
runtimeDom.registerRuntimeCompiler(compileToFunction)
