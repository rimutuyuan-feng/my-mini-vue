import { h } from "../../lib/my-mini-vue.esm.js"

export const App = {
  render(){
    return h("rect", { x: this.x, y: this.y })
  },
  setup(){
    return {
      x: 50,
      y: 50
    } 
  }
}
