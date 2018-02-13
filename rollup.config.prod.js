import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  entry: "src/index.js",
  dest: "dist/retrait.min.js",
  format: "umd",
  moduleName: "retrait",
  sourceMap: "dist/retrait.min.map",
  plugins: [
    babel({
      presets: [["env", { modules: false }]],
      exclude: "node_modules/**",
      plugins: ["external-helpers"]
    }),
    uglify()
  ]
};
