class ReactiveEffect{
  private _fn:any;
  constructor(fn, public scheduler?){
    this._fn=fn
  }
  run(){
    activeEffect=this
    return this._fn()
  }
}

export function effect(fn, options:any = {}){
  const { scheduler }=options
  //封装fn
  const _effect=new ReactiveEffect(fn, scheduler)
  _effect.run()
  return _effect.run.bind(_effect)
}

//存储所有依赖
const targetMap=new Map()
//用于获取当前依赖
let activeEffect
//收集依赖
export function track(target, key){
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
  deps.add(activeEffect)
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
