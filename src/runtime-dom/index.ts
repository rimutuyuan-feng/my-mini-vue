import { createRender } from "../runtime-core/renderer"

function createElement(tag) {
  return document.createElement(tag)
}
function patchProp(el, key, value) {
  function isOn(str) {
    return /^on[A-Z]/.test(str)
  }
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), value)
  } else {
    el.setAttribute(key, value)
  }
}
function insert(el, container){
  container.append(el)
}
const render :any= createRender({ createElement, patchProp, insert})
export function createApp(...arg) {
  return render.createApp(...arg)
}
export * from "../runtime-core"
