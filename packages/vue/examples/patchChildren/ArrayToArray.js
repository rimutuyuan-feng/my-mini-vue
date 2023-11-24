import { h, ref } from "../../lib/my-mini-vue.esm.js"
// const preChildren = [
//   h("p", {key: "A"}, "A"),
//   h("p", {key: "B"}, "B")
// ]
// const nextChildren = [
//   h("p", {key: "A"}, "A"),
//   h("p", {key: "B"}, "B"),
//   h("p", {key: "C"}, "C"),
//   h("p", {key: "D"}, "D"),
// ]
// const preChildren = [
//   h("p", {key: "A"}, "A"),
//   h("p", {key: "B"}, "B")
// ]
// const nextChildren = [
//   h("p", {key: "D"}, "D"),
//   h("p", {key: "C"}, "C"),
//   h("p", {key: "A"}, "A"),
//   h("p", {key: "B"}, "B")
// ]
const nextChildren = [
  h("p", {key: "A"}, "A"),
  h("p", {key: "B"}, "B"),
  h("p", {key: "D"}, "D"),
  h("p", {key: "C"}, "C"),
  h("p", {key: "Y"}, "Y"),
  h("p", {key: "E"}, "E"),
  h("p", {key: "F"}, "F"),
  h("p", {key: "G"}, "G"),
]

const preChildren = [
  h("p", {key: "A"}, "A"),
  h("p", {key: "B"}, "B"),
  h("p", {key: "C"}, "C"),
  h("p", {key: "D"}, "D"),
  h("p", {key: "E"}, "E"),
  h("p", {key: "Z"}, "Z"),
  h("p", {key: "F"}, "F"),
  h("p", {key: "G"}, "G")
]
export const ArrayToArray = {
  setup(){
    const isChanged = ref(false)
    window.isChanged = isChanged
    return {
      isChanged
    }
  },
  render(){
    return h("div", null, this.isChanged ? nextChildren : preChildren)
  }
}
