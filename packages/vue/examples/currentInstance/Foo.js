import { h, getCurrentInstance } from "../../lib/my-mini-vue.esm.js"

export const Foo = {
  name: "Foo",
  render() {
    return h("div", {name: "Foo"}, "foo")
  },
  setup(){
    const instance = getCurrentInstance()
    console.log(instance)
  }
}
