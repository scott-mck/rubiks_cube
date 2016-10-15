import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import server from 'rollup-plugin-serve'
import liveReload from 'rollup-plugin-livereload'

var plugins = [
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
  })
]

if (process.argv.indexOf('--serve') > -1) {
  plugins.push(
    server({
      port: 8080
    }),
    liveReload({
      watch: 'dist'
    })
  )
}

export default {
  entry: './src/js/main.js',
  plugins: plugins,
  targets: [{
    dest: 'dist/built.js',
    format: 'iife'
  }]
}
