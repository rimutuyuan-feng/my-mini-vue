import { h } from "../../lib/my-mini-vue.esm.js"
window.self = null
export const App = {
  render() {
    window.self = this
    return h("div", { id: "container" }, "hello" + this.msg)
  },
  setup() {
    return {
      msg: "mine-vue"
    }
  }
}
