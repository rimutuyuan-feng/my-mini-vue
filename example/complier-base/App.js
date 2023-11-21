import { ref } from "../../lib/my-mini-vue.esm.js"
export const App = {
  setup() {
    const count = window.count = ref(1)

    return {
      count
    }
  },
  template: "<div>hi, {{count}}</div>"
}
