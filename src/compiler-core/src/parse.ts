import { NodeTypes } from "./ast"
const enum TagType {
  START,
  END
}
export function baseParse(content: string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context))
}
function parseChildren(context) {
  const nodes: any[] = []
  let node
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterpolation(context)
  } else if (s[0] === "<"){
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  } else {
    node= parseText(context)
  }
  nodes.push(node)
  return nodes
}
//解析插值
function parseInterpolation(context) {
  const openDelimiter = "{{"
  const closeDelimiter = "}}"
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, closeDelimiter.length)
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}
//推进字符串
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children
  }
}
function createParseContext(content: string) {
  return {
    source: content
  }
}
//解析element
function parseElement(context) {
  const tag = parseTag(context, TagType.START)
  parseTag(context, TagType.END)
  return {
    type: NodeTypes.ElEMENT,
    tag: tag
  }
}
function parseTag(context, tag: TagType) {
  const match: any = (/^<\/?([a-z]*)/i).exec(context.source)
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (tag === TagType.END) return
  return match[1]
}
function parseText(context: any) {
  const content = parseTextData(context, context.source.length)
  
  return {
    type : NodeTypes.TEXT,
    content
  }
}
function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  advanceBy(context, length)
  return content
}
