import { createRender } from "../runtime-core/renderer"

function createElement(tag) {
  return document.createElement(tag)
}
function patchProp(el, key, preValue, nextValue) {
  function isOn(str) {
    return /^on[A-Z]/.test(str)
  }
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), nextValue)
  } else {
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue)
    }
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
