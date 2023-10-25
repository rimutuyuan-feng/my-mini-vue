import { h } from "../../lib/my-mini-vue.esm.js"
export const App = {
  render(){
    return h("div", {id: "container"}, [h("div", {name: "a1"}, "hello"), h("div", {name: "a2"}, "mini-vue")])
  },
  setup(){
    return {
      msg: "mine-vue"
    }
  }
}
