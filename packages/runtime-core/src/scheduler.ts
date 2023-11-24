const queue: any[] = []
const activePreFlushCbs:any[] = []
let isFlushPending = false
export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  flushQueue()
}
export function queuePreFlushCb(job) {
  activePreFlushCbs.push(job)
  flushQueue()
}
function flushQueue() {
  if (isFlushPending) return
  isFlushPending = true
  nextTick(flushJob)
}
function flushJob() {
  flushPreFlushCbs()
  let job
  while (job = queue.shift()) {
    job && job()
  }
  isFlushPending = false
}
function flushPreFlushCbs() {
  let job
  while (job = activePreFlushCbs.shift()) {
    job && job()
  }
}
const p = Promise.resolve()
export function nextTick(fn?) {
  return fn ? p.then(fn) : p
}
 