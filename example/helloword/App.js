import { h } from "../../lib/my-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
  render() {
    window.self = this
    return h("div", {
      id: "container",
      onClick() { 
        console.log("click")
      }
    }, [h("div", {}, "hello" + this.msg), h(Foo, {count: 1})])
  },
  setup() {
    return {
      msg: "mine-vue"
    }
  }
}
