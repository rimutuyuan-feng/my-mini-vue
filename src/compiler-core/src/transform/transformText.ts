import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node) {
  if (node.type === NodeTypes.ElEMENT) {
    return () => {
      const children = node.children
      let currentNode
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const nextChild = children[j]
            if (isText(nextChild)) {
              if (!currentNode) {
                currentNode = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }
              currentNode.children.push("+")
              currentNode.children.push(nextChild)
              children.splice(j, 1)
              j--
            } else {
              currentNode = undefined
              break
            }
          }
        }
      }
    }
  }
}

