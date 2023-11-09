import { createTextVNode, h, ref } from "../../lib/my-mini-vue.esm.js"
export const App = {
  setup(){
    const count = ref(0)
    function addCount() {
      count.value++
    }
    return {
      count,
      addCount
    }
  },
  render(){
    return h("div", null, [createTextVNode("count: "+this.count), h("button", {"onClick": this.addCount}, "click +1")])
  }
}
