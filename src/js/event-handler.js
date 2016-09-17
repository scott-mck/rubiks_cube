import $ from 'jquery'
import TweenMax from 'gsap'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import inputHandler from './input-handler'
import init from './init'

let DURATION = 0.7

const resizeWindow = () => {
  let $canvas = $('#canvas')
  let width = $canvas.width()
  let height = $canvas.height()
  let windowWidth = window.innerWidth
  let windowHeight = window.innerHeight
  let canvasSize = 0.9
  let scale

  if (windowWidth > windowHeight) {
    scale = windowWidth / width
    if (height * scale > windowHeight) scale = windowHeight / height
  } else {
    scale = windowHeight / height
    if (width * scale > windowWidth) scale = windowWidth / width
  }

  $('#canvas').css('width', width * scale * canvasSize + 'px')
  $('#canvas').css('height', height * scale * canvasSize + 'px')

  camera.aspect = (width * scale) / (height * scale)
  camera.updateProjectionMatrix()
  renderer.setSize(width * scale * canvasSize, height * scale * canvasSize)
  renderer.render(scene, camera)
}

export default () => {

  resizeWindow()

  $(window).click((e) => {
    e.preventDefault()
  })

  $(window).resize(resizeWindow)

  $(document).ready(() => {
    let $backdrop = $('.backdrop')
    let $select = $('.select')

    TweenMax.to($select, DURATION, {
      opacity: 1,
      y: 50,
      ease: Power3.easeOut
    })

    $select.click((e) => {
      let dimensions = +e.target.getAttribute('id')

      TweenMax.to($select, DURATION, {
        opacity: 0,
        y: 0,
        ease: Power3.easeOut,
        onComplete: () => {
          $select.hide()
          $backdrop.hide()
          init(dimensions)
          inputHandler.start()
        }
      })

    })
  })

}
