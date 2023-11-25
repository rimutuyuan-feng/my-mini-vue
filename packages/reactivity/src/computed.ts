import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
  private _value
  private _dirty = true
  private _effect
  constructor(getter) {
    this._effect = new ReactiveEffect(getter ,() => {
      this._dirty = true
    })
  }
  get value() {
    if (this._dirty) {
      this._value = this._effect.run()
      this._dirty = false
    }
    return this._value
  }
}
/**
 * 监听getter值的变化，并返回只读的响应式ref对象
 * @param getter 
 * @returns 
 */
export function computed(getter) {
  return new ComputedRefImpl(getter)
}
