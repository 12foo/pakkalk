import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
    entry: "src/app.js",
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            include: "node_modules/**",
            sourceMap: false
        })
    ],
    format: "iife"
}
