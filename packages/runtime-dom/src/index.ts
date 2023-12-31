import { createRender } from "@my-mini-vue/runtime-core"

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
function insert(el, container, achor) {
  container.insertBefore(el, achor || null)
}
function remove(el) {
  const parent = el.parentNode
  if (parent) {
    parent.removeChild(el)
  }
}
function setElementText(el, text){
  el.textContent = text
}
const render: any = createRender({ createElement, patchProp, insert, remove, setElementText })
export function createApp(...arg) {
  return render.createApp(...arg)
}
export * from "@my-mini-vue/runtime-core"
