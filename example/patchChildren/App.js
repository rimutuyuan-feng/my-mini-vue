import { h } from "../../lib/my-mini-vue.esm.js"
import { ArrayToText } from "./ArrayToText.js"
import { TextToArray } from "./TextToArray.js"
import { TextToText } from "./TextToText.js"
export const App = {
  render(){
    return h("div", null, [
      h(ArrayToText)
      // h(TextToText)
      // h(TextToArray)
    ])
  }
}
