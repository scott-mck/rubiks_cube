import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  entry: './src/js/main.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    resolve({
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ],
  targets: [
    {
      dest: 'dist/built.js',
      moduleName: 'built.js',
      format: 'iife'
    }
  ]
}
