import { h, ref } from "../../lib/my-mini-vue.esm.js"
import { Child } from "./child.js"
export const App = {
  setup() { 
    const msg = ref("123")
    const count = ref(0)
    function changeMsg() {
      msg.value = "456"
    }
    function changeCount() {
      count.value++
    }
    return {
      msg,
      changeMsg,
      count,
      changeCount
    }
  },
  render() { 
    return h("div", null, [
      h("button", {onClick: this.changeMsg}, "click change ChildProps"),
      h(Child, {msg: this.msg}),
      h("button", {onClick: this.changeCount}, "click change count"),
      h("p", null, `${this.count}`)
    ])
  }
}
