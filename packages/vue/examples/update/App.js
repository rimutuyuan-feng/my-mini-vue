import { createTextVNode, h, ref } from "../../lib/my-mini-vue.esm.js"
export const App = {
  setup(){
    const count = ref(0)
    function addCount() {
      count.value++
    }
    const props = ref({
      foo: "foo",
      bar: "bar"
    })
    function onChangePropsDemo1() {
      props.value.foo = "new-foo"
    }
    function onChangePropsDemo2() {
      props.value.foo = undefined
    }
    function onChangePropsDemo3() {
      props.value = {
        foo: "foo"
      }
    }
    return {
      count,
      props,
      addCount,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3
    }
  },
  render(){
    return h("div", {...this.props}, [
      createTextVNode("count: "+this.count), 
      h("button", {"onClick": this.addCount}, "click +1"), 
      h("button", {onClick: this.onChangePropsDemo1}, "change"),
      h("button", {onClick: this.onChangePropsDemo2}, "change undefind"),
      h("button", {onClick: this.onChangePropsDemo3}, "delete bar"),
    ])
  }
}
