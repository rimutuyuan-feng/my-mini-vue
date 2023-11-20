import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers"

export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ElEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION
}
export function createVnodeCall(tag, props, children, context) {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.ElEMENT,
    tag,
    props,
    children
  }
}
