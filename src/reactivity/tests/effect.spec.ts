import {reactive} from '../reactive'
import {effect} from '../effect'

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
})
