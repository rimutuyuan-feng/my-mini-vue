import { NodeTypes } from "./ast"
const enum TagType {
  START,
  END
}
export function baseParse(content: string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
}
function parseChildren(context, ancestors) {
  const nodes: any[] = []
  let node
  let s = context.source
  while (!isEnd(s, ancestors)) {
    if (s.startsWith("{{")) {
      node = parseInterpolation(context)
    } else if (s[0] === "<"){
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    } else {
      node= parseText(context)
    }
    nodes.push(node)
    s = context.source
  }
 
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
function advanceBy(context: any, index: number) {
  context.source = context.source.slice(index)
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT
  }
}
function createParseContext(content: string) {
  return {
    source: content
  }
}
//解析element
function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.START) 
  ancestors.push(element.tag)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.END)
  } else {
    throw new Error(`缺少结束标签${element.tag}`)
  }
  
  return element
}
function startsWithEndTagOpen(source, tag) {
  return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag
}
function parseTag(context, tag: TagType) {
  const match: any = (/^<\/?([a-z]*)/i).exec(context.source)
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (tag === TagType.END) return
  return {
    type: NodeTypes.ElEMENT,
    tag: match[1]
  }
}
function parseText(context: any) {
  const endToken = ["{{", "<"]
  let endIndex = context.source.length
  for(let i = endToken.length-1; i >=0; i-- ){
    const index = context.source.indexOf(endToken[i])
    if (index !== -1) {
      endIndex = Math.min(endIndex, index)
    }
  }
  const content = parseTextData(context, endIndex)
  
  return {
    type : NodeTypes.TEXT,
    content
  }
}
function parseTextData(context, index) {
  const content = context.source.slice(0, index)
  advanceBy(context, index)
  return content
}
function isEnd(s, ancestors) {
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i]
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
 
  return !s
}
