import toArray from 'to-array'
import TweenMax from 'gsap'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import g, { init as initGlobals } from './globals'
import init from './init'

const SELECT_DURATION = 0.7

let select
let choices
let canvas
let dimensions
let timeline = new TimelineMax({ paused: true })

export default {

  init() {
    select = document.querySelector('.select')
    choices = toArray(document.querySelectorAll('.cube-size'))
    canvas = document.querySelector('#canvas')

    renderer.setPixelRatio(devicePixelRatio)
    canvas.appendChild(renderer.domElement)

    // $window.resize(resizeWindow)
    window.addEventListener('click', e => e.preventDefault())

    choices.forEach((choice) => {
      choice.addEventListener('click', (e) => {
        dimensions = parseInt(e.currentTarget.querySelector('.choice').getAttribute('id'))
        timeline.reverse()
      })
    })

    createTimeline()
    resizeWindow()
    timeline.play()
    renderer.render(scene, camera)
  }

}

let resizeWindow = () => {
  let canvasWidth = canvas.clientWidth
  let canvasHeight = canvas.clientHeight
  let windowWidth = window.clientWidth
  let windowHeight = window.clientHeight

  camera.aspect = (canvasWidth) / (canvasHeight)
  camera.updateProjectionMatrix()
  renderer.setSize(canvasWidth, canvasHeight)
}

let createTimeline = () => {
  timeline.to(select, SELECT_DURATION, {
    opacity: 1,
    y: 50,
    ease: Power3.easeOut
  })

  timeline.eventCallback('onReverseComplete', () => {
    select.style.display = 'none'
    initGlobals(dimensions)
    init()
  })
}
