export function generate(ast) {
  const context = createGenerateContext()
  const push = context.push
  push("return ")
  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signatrue = args.join(", ")
  push(`function ${functionName}(${signatrue}){`)
  const node = ast.codegenNode
  push("return ")
  genNode(context, node)
  push("}")
  return {
    code: context.code
  }
}
function genNode(context, node) {
  context.push(`'${node.content}'`)
}
function createGenerateContext() {
  const context= {
    code: "",
    push(source) {
      context.code += source
    }
  }
  return context
}
