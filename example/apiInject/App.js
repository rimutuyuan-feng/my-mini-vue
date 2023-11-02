import { createApp, h, provide, inject, createTextVNode} from "../../lib/my-mini-vue.esm.js"
const App = {
  name: "App",
  render() {
    return h("div", {}, [createTextVNode("App"), h(Provider)])
  }
}
const Provider = {
  name: "Provider",
  render(){
    return h("div", {}, [createTextVNode(`Provider: ${this.foo}`), h(ProviderTwo)])
  },
  setup(){
    let foo = "fooValue"
    provide("foo", foo)
    return {
      foo
    }
  }
}
const ProviderTwo = {
  render(){
    return h("div", null, [createTextVNode(`FromProvider: ${this.foo}`), h(Customer)])
  },
  setup(){
    provide("foo", "twoFooValue")
    const foo = inject("foo")
    return {
      foo
    }
  }
}

const Customer = {
  name: "Customer",
  render(){
    return h("div", null, "FromProviderTwo：" + this.foo)
  },
  setup(){
    const foo = inject("foo")
    // console.log(foo)
    return {
      foo
    }
  }
}
const container = document.querySelector("#app")
createApp(App).mount(container)
