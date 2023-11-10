import { h, ref } from "../../lib/my-mini-vue.esm.js"

export const ArrayToText = {
  setup(){
    const isChanged = ref(false)
    window.isChanged = isChanged
    return {
      isChanged
    }
  },
  render(){
    return h("div", null ,this.isChanged ? "ArrayToText" : [ h("div", null, "A"), h("div", null, "B")])
  }
}
