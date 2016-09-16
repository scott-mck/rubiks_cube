import $ from 'jquery'
import THREE from 'three'
import scene from './scene'
import renderer from './renderer'
import camera, { setCamera } from './camera'

import addEvents from './add-events'
import init from './init'

$(document).ready(() => {

  let $canvas = $('#canvas')
  let canvasWidth = $canvas.width()
  let canvasHeight = $canvas.height()

  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(canvasWidth, canvasHeight)
  $canvas.append(renderer.domElement)

  setCamera(70, canvasWidth / canvasHeight, 1, 1000)

  let resizeWindow = () => {
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

  $(window).resize(resizeWindow)
  resizeWindow()

  addEvents()

})
