import { reactive } from "@my-mini-vue/reactivity"
import { nextTick } from "../src/scheduler"
import { watchEffect } from "../src/apiWatch"

describe("api: watch", () => {

  it("effect", async () => {
    const value = reactive({count: 0})
    let dummy
    watchEffect(() => {
      dummy = value.count
    })
    value.count++
    await nextTick()
    expect(dummy).toBe(1)
  })
  
  it("stopping the watcher (effect)", async () => {
    const value = reactive({count: 0})
    let dummy
    const stop: any = watchEffect(() => {
      dummy = value.count
    })
    stop()
    value.count++
    await nextTick()
    expect(dummy).toBe(0)
  })
  it("cleanup registration (effect)", async () => {
    const value = reactive({count: 0})
    let dummy
    const cleanup = vi.fn()
    const stop: any = watchEffect((onCleanup) => {
      dummy = value.count
      onCleanup(cleanup)
    })
    expect(dummy).toBe(0)
    expect(cleanup).toHaveBeenCalledTimes(0)

    value.count++
    await nextTick()
    expect(dummy).toBe(1)
    expect(cleanup).toHaveBeenCalledTimes(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })
})
