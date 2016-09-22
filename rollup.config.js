import babel from 'rollup-plugin-babel'

export default {
  entry: './src/js/main.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  targets: [
    {
      dest: 'dist/built.js',
      moduleName: 'built.js',
      format: 'umd'
    }
  ],
  globals: {
    three: 'THREE',
    jquery: '$',
    gsap: 'TweenMax'
  }
}
