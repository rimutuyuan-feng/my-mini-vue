import { extend } from "./shared";

class ReactiveEffect{
  private _fn:any;
  deps = []
  active = true
  onStop?: ()=>void
  constructor(fn, public scheduler?){
    this._fn=fn
  }
  run(){
    return this._fn()
  }
  stop(){
    if(this.active){
      cleanupEffect(this)
      if(this.onStop){
        this.onStop()
      }
      this.active=false
    }
    
  }
}

export function effect(fn, options:any = {}){
  const { scheduler }=options
  //封装fn
  const _effect=new ReactiveEffect(fn, scheduler)
  extend(_effect, options)
  activeEffect=_effect
  _effect.run()
  activeEffect=null
  const runner: any=_effect.run.bind(_effect)
  runner.effect=_effect
  return runner
}

//存储所有依赖
const targetMap=new Map()
//用于获取当前依赖
let activeEffect
//收集依赖
export function track(target, key){
  if(!activeEffect) return
  //获取target对应的依赖
  let depsMap = targetMap.get(target)
  //初始化
  if(!depsMap){
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  //获取key对应的依赖
  let deps = depsMap.get(key)
  //初始化
  if(!deps){
    deps = new Set()
    depsMap.set(key, deps)
  }
  
  //收集依赖
  if(deps.has(activeEffect)) return
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}
//触发依赖
export function trigger(target, key){
  //获取target对应依赖
  let depsMap = targetMap.get(target)
  //获取key对应依赖
  let deps = depsMap.get(key)
  //遍历dpes
  for(const dep of deps){
    if(dep.scheduler){
      dep.scheduler()
    }else{
      //执行依赖函数
      dep.run()
    }
  }
    
}

//停止跟踪依赖
export function stop(runner){
  runner.effect.stop()
}

//清除依赖
function cleanupEffect(effect){
  effect.deps.forEach((item)=>{
    item.delete(effect)
  })
  effect.deps.length = 0
}
