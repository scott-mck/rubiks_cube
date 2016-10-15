import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import server from 'rollup-plugin-serve'
import liveReload from 'rollup-plugin-livereload'

export default {
  entry: './src/js/main.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpers: true,
      runtimeHelpers: true
    }),
    resolve({
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    server({
      port: 8080
    }),
    liveReload({
      watch: 'dist'
    })
  ]
}
