import { NodeTypes, createVnodeCall } from "../ast";

export function transformElement(node, context) {
  if (node.type === NodeTypes.ElEMENT) {
    return () => {
      const vnodeTag = `"${node.tag}"`
      let props
      const vnodeChildren = node.children[0]
      node.codegenNode = createVnodeCall(vnodeTag, props, vnodeChildren, context)
    }
  }
}
