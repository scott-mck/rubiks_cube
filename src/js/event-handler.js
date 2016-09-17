import $ from 'jquery'
import TweenMax from 'gsap'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import init from './init'

const SELECT_DURATION = 0.7
const CANVAS_SIZE = 0.9

let $window
let $backdrop
let $select
let $choices
let $canvas
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

    renderer.setPixelRatio(devicePixelRatio)
    $canvas.append(renderer.domElement)

    $window.resize(resizeWindow)
    $window.click(e => e.preventDefault())

    $choices.click((e) => {
      dimensions = parseInt($(e.currentTarget).find('.choice').attr('id'))
      timeline.reverse()
    })

    createTimeline()
    resizeWindow()
    timeline.play()
  }

}

let resizeWindow = () => {
  canvasWidth = $canvas.width()
  canvasHeight = $canvas.height()
  windowWidth = $window.width()
  windowHeight = $window.height()

  if (windowWidth > windowHeight) {
    scale = windowWidth / canvasWidth
    if (canvasHeight * scale > windowHeight) scale = windowHeight / canvasHeight
  } else {
    scale = windowHeight / canvasHeight
    if (canvasWidth * scale > windowWidth) scale = windowWidth / canvasWidth
  }

  $canvas.css('width', canvasWidth * scale * CANVAS_SIZE + 'px')
  $canvas.css('height', canvasHeight * scale * CANVAS_SIZE + 'px')

  camera.aspect = (canvasWidth * scale) / (canvasHeight * scale)
  camera.updateProjectionMatrix()
  renderer.setSize(canvasWidth * scale * CANVAS_SIZE, canvasHeight * scale * CANVAS_SIZE)
  renderer.render(scene, camera)
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
    init(dimensions)

    camera.position.x = 250;
    camera.position.y = 300;
    camera.position.z = 500;
    camera.lookAt(new THREE.Vector3());
  })
}
