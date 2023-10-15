import {readonly} from '../reactive'
describe("readonly", () => {
  it("happy path", () => {
    const original = {foo:1}
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
  })
  it("warn then call set", () => {
    console.warn=jest.fn()
    const obj=readonly({foo: 1})
    obj.foo=2
    expect(console.warn).toBeCalled()
  })
})
