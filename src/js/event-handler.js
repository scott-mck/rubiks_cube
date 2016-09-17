import $ from 'jquery'
import THREE from 'three'
import g from './globals'
import rubiksCube from './rubiks-cube'
import renderer from './renderer'
import camera from './camera'
import scene from './scene'
import keyMap from './key-map'
import grabber from './grabber'

class EventHandler {
  constructor() {

  }

  start() {
    this.addEvents()
  }

  addEvents() {
    $(window).on('keyup', this.type.bind(this))
    $(window).on('click', this.click.bind(this))
  }

  click(e) {
    let canvasBox = renderer.domElement.getBoundingClientRect()
    let canvasMouseX = event.clientX - canvasBox.left
    let canvasMouseY = event.clientY - canvasBox.top

    let mouse = new THREE.Vector2()
    mouse.x = (canvasMouseX / renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(canvasMouseY / renderer.domElement.clientHeight) * 2 + 1

    let raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    let objects = raycaster.intersectObjects(scene.children)
  }

  type(e) {
    let letter = String.fromCharCode(e.keyCode).toLowerCase()
    let move = keyMap.getNotation(letter)

    if (!move) {
      return
    }

    rubiksCube.move(move)
  }
}

export default EventHandler
