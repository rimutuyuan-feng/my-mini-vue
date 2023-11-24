import { effect } from "../src/effect"
import { reactive } from "../src/reactive"
import { isRef, proxyRefs, ref, unRef } from "../src/ref"
describe("ref", () => {
  it("happy path", () => {
    const foo = ref(1)
    expect(foo.value).toBe(1)
  })
  it("should be reactive", () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(dummy).toBe(1)
    a.value++
    expect(dummy).toBe(2)
    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
  })
  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count++
    expect(dummy).toBe(2)
  })
  it("isRef", () => {
    const a = ref(1)
    const user = reactive({
      age: 2
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })
  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
  it("proxyRefs", () => {
    const user = {
      name: "zhangsan",
      age: ref(10)
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe("zhangsan")

    proxyUser.age = 11
    expect(proxyUser.age).toBe(11)
    expect(user.age.value).toBe(11)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})
