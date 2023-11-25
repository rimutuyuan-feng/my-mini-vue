import { extend } from "@my-mini-vue/shared";
/**
 * 用于依赖收集
 */
export class ReactiveEffect {
  private _fn: any;
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  //用于触发fn
  run() {
    //用于收集的依赖
    activeEffect = this
    const res = this._fn()
    activeEffect = null
    return res
  }
  stop() {
    if (this.active) {
      //清空依赖
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }

  }
}

export function effect(fn, options: any = {}) {
  const { scheduler } = options
  //封装fn
  const _effect = new ReactiveEffect(fn, scheduler)
  //复制options的所有property到_effect
  extend(_effect, options)
  //执行
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

//存储所有依赖
const targetMap = new Map()
//用于获取当前依赖
let activeEffect
//收集依赖
export function track(target, key) {
  //获取target对应的依赖
  let depsMap = targetMap.get(target)
  //初始化
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  //获取key对应的依赖
  let deps = depsMap.get(key)
  //初始化
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  //收集依赖
  trackEffect(deps)
}
/**
 * 收集依赖的process
 * @param deps 
 * @returns 
 */
export function trackEffect(deps) {
  if (!activeEffect) return
  if (deps.has(activeEffect)) return
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}
/**
 * 触发依赖
 * @param target 
 * @param key 
 */
export function trigger(target, key) {
  //获取target对应依赖
  let depsMap = targetMap.get(target)
  //获取key对应依赖
  let deps = depsMap.get(key)
  triggerEffect(deps)

}

/**
 * 触发依赖的process
 * @param deps 
 */
export function triggerEffect(deps) {
  //遍历dpes
  for (const dep of deps) {
    if (dep.scheduler) {
      //调度执行
      dep.scheduler()
    } else {
      //执行依赖函数
      dep.run()
    }
  }
}

/**
 * 通知跟踪依赖
 * @param runner 
 */
export function stop(runner) {
  runner.effect.stop()
}

/**
 * 清空依赖
 * @param effect 
 */
function cleanupEffect(effect) {
  effect.deps.forEach((item) => {
    item.delete(effect)
  })
  console.log("--------", effect)
  effect.deps.length = 0
}
