import { vi } from 'vitest'
import {isProxy, isReadonly, readonly} from '../src/reactive'
describe("readonly", () => {
  it("happy path", () => {
    const original = {foo:1, bar: {baz: 2}}
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(observed.bar)).toBe(true)
    expect(isProxy(observed)).toBe(true)
  })
  it("warn then call set", () => {
    console.warn=vi.fn()
    const obj=readonly({foo: 1})
    obj.foo=2
    expect(console.warn).toBeCalled()
  })
})
