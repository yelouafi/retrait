import babel from "rollup-plugin-babel";

export default {
  entry: "src/index.js",
  dest: "dist/retrait.dev.js",
  format: "umd",
  moduleName: "retrait",
  sourceMap: "inline",
  plugins: [
    babel({
      presets: [["env", { modules: false }]],
      exclude: "node_modules/**"
    })
  ]
};
