import { NodeTypes } from "./ast"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  createCodegenNode(root)
  traverseNode(root, context)
}
function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodeTransform = nodeTransforms[i]
    nodeTransform(node)
  }
  traverseChildren(node, context)
}

function traverseChildren(node: any, context: any) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
  return context
}

function createCodegenNode(root: any) {
  root.codegenNode = root.children[0]
}

