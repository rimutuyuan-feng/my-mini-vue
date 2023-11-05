import { h } from "../../lib/my-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
  name: "APP",
  render() {
    window.self = this
    return h("div", {
      id: "container",
    }, [h("div", {}, "hello" + this.msg), h(Foo, { count: 1, onAdd: this.add, onAddFoo: this.addFoo })])
  },
  setup() {
    function add(a, b) {
      console.log(a + b)
    }
    function addFoo() {
      console.log("add-foo")
    }
    return {
      msg: "mine-vue",
      add,
      addFoo
    }
  }
}
