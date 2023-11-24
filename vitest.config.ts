import { defineConfig } from "vitest/config"
const path = require("path")
export default defineConfig({
  test: {
    globals: true
  },
  resolve: {
    alias: [
      {
        find: /@my-mini-vue\/(\w*)/,
        replacement: path.resolve(__dirname, "packages") + "/$1/src"
      }
    ]
  }
})
