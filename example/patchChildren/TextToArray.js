import { h, ref } from "../../lib/my-mini-vue.esm.js"

export const TextToArray = {
  setup() {
    const isChanged = ref(false)
    window.isChanged = isChanged
    return {
      isChanged
    }
  },
  render() {
    return h("div", null, this.isChanged ? [ h("div", null, "A"), h("div", null, "B")] : "TextToArray")
  }
}
