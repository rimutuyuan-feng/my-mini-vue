import { vi } from "vitest"
import { computed } from "../src/computed"
import { reactive } from "../src/reactive"

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10
    })
    const age = computed(() => user.age)
    expect(age.value).toBe(10)
  })
  it("should compute lazily", () => {
    const value = reactive({
      foo: 1
    })
    const getter = vi.fn(() => {
      return value.foo
    })
    const cValue = computed(getter)
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    //should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    //should not compute until needed
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    //now it should compute
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    //should not comute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
