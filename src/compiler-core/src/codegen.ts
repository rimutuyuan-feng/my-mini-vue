import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers"

export function generate(ast) {
  const context = createGenerateContext()
  const push = context.push
  if (ast.helpers.length) {
    genFunctionPreamble(push, ast)
  }
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
function genFunctionPreamble(push: (source: any) => void, ast: any) {
  const VueBinging = "Vue"
  const alias = (str) => `${helperMapName[str]}: _${helperMapName[str]}`
  push(`const { ${ast.helpers.map(alias).join(", ")} } = ${VueBinging}`)
  push("\n")
}

function genNode(context, node) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(context, node)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(context, node)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(context, node)
      break
  }
}
function genText(context: any, node: any) {
  context.push(`'${node.content}'`)
}

function createGenerateContext() {
  const context= {
    code: "",
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}
function genInterpolation(context: any, node: any) {
  const { push ,helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(context, node.content)
  push(")")
}

function genExpression(context: any, node: any) {
  context.push(node.content)
}

