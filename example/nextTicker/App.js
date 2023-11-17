import { getCurrentInstance, h, nextTicker, ref } from "../../lib/my-mini-vue.esm.js"
export const App = {
  setup() {
    const count = ref(0)
    const instance = getCurrentInstance()
    function update() {
      for (let i = 0; i < 100; i++) {
        count.value++
      }
      console.log(instance)
      nextTick(() => {
        console.log(instance)
      })
    }
    return {
      count,
      update
    }
  },
  render() {
    return h("div", null, [
      h("div", null, `${this.count}`),
      h("button", {onClick: this.update}, "update")
    ])
  }
}
