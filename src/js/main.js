// REMEMBER TO KILL ME WHEN YOU NEED TO
import windows from './windows'

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

  addEvents()

})
