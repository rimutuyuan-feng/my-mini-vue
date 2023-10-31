import { createTextVNode, h } from "../../lib/my-mini-vue.esm.js"
import { Foo } from "./Foo.js"
export const App = {
  render() {
    const app = h("div", {}, "app")
    const foo = h(
      Foo,
      {},
      {
        header: ({ name }) => [h("div", {}, `header: ${ name }`), createTextVNode("TEXT")],
        footer: ({ name }) => h("div", {}, `footer: ${ name }`)
      }
    )
    return h(
      "div",
      {
        name: "app"
      },
      [app, foo]
    )
  },
  setup() {

  }
}
