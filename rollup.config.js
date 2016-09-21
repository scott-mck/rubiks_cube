import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: './src/js/main.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    uglify()
  ],
  targets: [
    {
      dest: 'dist/built.js',
      moduleName: 'built',
      format: 'umd'
    }
  ],
  globals: {
    three: 'THREE',
    jquery: '$',
    gsap: 'TweenMax'
  }
}
