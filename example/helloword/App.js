import { h } from "../../lib/my-mini-vue.esm.js"
export const App = {
  render(){
    return h("div", "hi，"+this.msg)
  },
  setup(){
    return {
      msg: "mine-vue"
    }
  }
}
