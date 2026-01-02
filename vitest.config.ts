import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.config.{ts,js}", "**/*.d.ts", "**/types/"],
    },
  },
  esbuild: false,
  plugins: [
    {
      name: "swc",
      transform(code, id) {
        if (!/\.(m?[jt]sx?|json)$/.test(id)) return null
        if (id.includes("node_modules")) return null

        const { transform } = require("@swc/core")
        return transform(code, {
          filename: id,
          jsc: {
            parser: {
              syntax: id.endsWith(".ts") || id.endsWith(".tsx") ? "typescript" : "ecmascript",
              tsx: id.endsWith(".tsx"),
            },
            target: "es2022",
          },
          module: {
            type: "es6",
          },
          sourceMaps: true,
        })
      },
    },
  ],
})
