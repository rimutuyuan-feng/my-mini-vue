import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createCodegenNode(root)
  root.helpers = [...context.helpers.keys()]
}
function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms
  const exitFn: any[] = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodeTransform = nodeTransforms[i]
    const exit= nodeTransform(node, context)
    if (exit) {
      exitFn.push(exit)
    }
  }
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ElEMENT:
      traverseChildren(node, context)
      break
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
  }
  let i = exitFn.length
  while (i--) {
    exitFn[i]()
  }
}

function traverseChildren(node: any, context: any) {
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNode(node, context)
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

function createCodegenNode(root: any) {
  const child = root.children[0]
  if (child.codegenNode) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = child
  }
}

