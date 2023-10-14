import {reactive} from '../reactive'
import {effect, stop} from '../effect'

describe("effect", () => {
  it("happy path", () => {
    const user= reactive({
      age: 10
    })
    let nextAge
    effect(()=>{
      nextAge = user.age+1
    })
    expect(nextAge).toBe(11)
    //update
    user.age++
    expect(nextAge).toBe(12)
  })
  it("return runner when effect called",() => {
    let foo=10
    const runner = effect(()=>{
      foo++
      return foo
    })
    expect(foo).toBe(11)
    const res=runner()
    expect(foo).toBe(12)
    expect(res).toBe(foo)
  })
  it("scheduler",() => {
    let dummy
    let run
    const obj = reactive({ foo: 1 })
    const scheduler = jest.fn(() => {
      run = runner
    })
    
    const runner = effect(() => {
      dummy=obj.foo
    },
    {scheduler})

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)

    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    run()
    expect(dummy).toBe(2)
  })

  it("stop", () => {
    let dummy
    const obj = reactive({props: 1})
    const runner = effect(() => {
      dummy = obj.props
    })
    obj.props = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.props = 3
    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)
  })

  it("onStop", () => {
    const obj=reactive({foo: 1})
    let dummy
    const onStop=jest.fn()
    const runner=effect(() => {
      dummy=obj.foo
    },
    { onStop }
    )
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
