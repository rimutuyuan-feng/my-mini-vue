const queue: any[] = []
let isFlushPending = false
export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  flushQueue()
}
function flushQueue() {
  if (isFlushPending) return
  isFlushPending = true
  nextTick(flushJob)
}
function flushJob() {
  let job
  while (job = queue.shift()) {
    job && job()
  }
  isFlushPending = false
}
const p = Promise.resolve()
export function nextTick(fn) {
  return fn ? p.then(fn) : p
}
 