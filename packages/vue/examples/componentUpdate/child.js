import { h } from "../../lib/my-mini-vue.esm.js"

export const Child = {
  render(){
    return h("div", null, `msg: ${this.$props.msg}`)
  }
}
