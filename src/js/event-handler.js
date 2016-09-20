import $ from 'jquery'
import TweenMax from 'gsap'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import g, { init as initGlobals } from './globals'
import init from './init'

const SELECT_DURATION = 0.7

let $window
let $backdrop
let $select
let $choices
let $canvas
let $expand
let $sidebar

let canvasWidth
let canvasHeight
let windowWidth
let windowHeight
let scale
let dimensions

let timeline = new TimelineMax({ paused: true })

export default {

  init() {
    $window = $(window)
    $backdrop = $('.backdrop')
    $select = $('.select')
    $choices = $('.cube-size')
    $canvas = $('#canvas')
    $expand = $('#expand')
    $sidebar = $('#sidebar')

    renderer.setPixelRatio(devicePixelRatio)
    $canvas.append(renderer.domElement)

    // $window.resize(resizeWindow)
    $window.click(e => e.preventDefault())

    $choices.click((e) => {
      dimensions = parseInt($(e.currentTarget).find('.choice').attr('id'))
      timeline.reverse()
    })

    createTimeline()
    resizeWindow()
    timeline.play()
    renderer.render(scene, camera)
  }

}

let resizeWindow = () => {
  canvasWidth = $canvas.width()
  canvasHeight = $canvas.height()
  windowWidth = $window.width()
  windowHeight = $window.height()

  // if (windowWidth > windowHeight) {
  //   scale = windowWidth / canvasWidth
  //   if (canvasHeight * scale > windowHeight) scale = windowHeight / canvasHeight
  // } else {
  //   scale = windowHeight / canvasHeight
  //   if (canvasWidth * scale > windowWidth) scale = windowWidth / canvasWidth
  // }

  // $canvas.css('width', canvasWidth + 'px')
  // $canvas.css('height', canvasHeight + 'px')

  camera.aspect = (canvasWidth) / (canvasHeight)
  camera.updateProjectionMatrix()
  renderer.setSize(canvasWidth, canvasHeight)
}

let createTimeline = () => {
  timeline.to($select, SELECT_DURATION, {
    opacity: 1,
    y: 50,
    ease: Power3.easeOut
  })

  timeline.eventCallback('onReverseComplete', () => {
    $select.hide()
    $backdrop.hide()
    initGlobals(dimensions)
    init()
  })
}
