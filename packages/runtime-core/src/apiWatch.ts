import { ReactiveEffect } from "../../reactivity/src/effect";
import { queuePreFlushCb } from "./scheduler";

export function watchEffect(source) {
  function job() {
    effect.run()
  }
  let cleanup
  function onCleanup(fn) {
    cleanup = effect.onStop = () => { fn() }
  }
  function getter() {
    source(onCleanup)
  }
  const effect = new ReactiveEffect(getter, () => {
    cleanup && cleanup()
    queuePreFlushCb(job)
  })
  effect.run()
  return () => {
    effect.stop()
  }
}
