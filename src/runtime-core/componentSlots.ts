import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(instance.slots, instance.vnode.children)
  }
}
function normalizeObjectSlots(slots, children) {
  for (const key in children) {
    slots[key] = (props) => normalizeSlotsValue(children[key](props))
  }
}
function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value]
}
