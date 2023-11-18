import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe("transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>")
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += "mini-vue"
      }
    }
    transform(ast, {
      nodeTransforms: [plugin]
    })
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,mini-vue"
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message"
          }
        }
      ]
    })
  })
})
