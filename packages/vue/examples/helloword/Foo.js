import { h } from "../../dist/my-mini-vue.esm.js"
export const Foo = {
  name: "FOO",
  setup(props, { emit }) {
    function clickHandler() {
      emit("add", 1, 2),
      emit("add-foo")
    }
    return {
      clickHandler
    }
  },
  render() {
    const btn = h("button", { "onClick": this.clickHandler }, "click emit")
    const content = h("p", {}, "foo: " + this.count)
    return h("div", {}, [content, btn])
  }
}
