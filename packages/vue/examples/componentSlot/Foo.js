import { h, renderSlots } from "../../lib/my-mini-vue.esm.js"
export const Foo = {
  render() {
    console.log(this.$slots)
    const foo = h("div", {}, "foo")
    const name = "hello"
    return h(
      "div",
      { name: "Foo" },
      [renderSlots(this.$slots, "header", { name }), foo, renderSlots(this.$slots, "footer", { name })]
    )
  },
  setup() {

  }
}
