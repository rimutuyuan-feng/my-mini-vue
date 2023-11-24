import { ref } from "../../lib/my-mini-vue.esm.js"
import { h } from "../../lib/my-mini-vue.esm.js"

export const TextToText = {
  setup(){
    const isChanged = ref(false)
    window.isChanged = isChanged
    return {
      isChanged
    }
  },
  render(){
    return h("div", null, this.isChanged ? "newTextToText" : "oldTextToText")
  }
}
