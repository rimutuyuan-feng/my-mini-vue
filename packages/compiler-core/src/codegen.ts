import { isString } from "@my-mini-vue/shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers"

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
    case NodeTypes.ElEMENT:
      genElement(context, node)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompound(context, node)
  }
}
function genElement(context, node) {
  const { push, helper } = context
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  const {tag, props, children} = node
  genNodeList(context, genNullable([tag, props, children]))
  push(")")
}
function genNullable(arr :unknown[]) {
  return arr.map(item => (item || "null"))
}
function genNodeList(context ,list: unknown[]) {
  const { push } = context
  const length = list.length
  for( let i = 0; i < length; i++) {
    const node = list[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(context, node)
    }
    if (i < length -1) {
      push(", ")
    }
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

function genCompound(context: any, node: any) {
  const children = node.children
  const { push } = context
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(context, child)
    }
  }
}

