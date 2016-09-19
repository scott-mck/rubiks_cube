import $ from 'jquery'
import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import renderer from './renderer'
import camera from './camera'
import scene from './scene'
import keyMap from './key-map'

const DRAG_COEFFICIENT = 1 / 200

class inputHandler {
  constructor() {
    // Captures correct cubes when clicking on a given face (or normal)
    this._normalMap = {
      x: { horizontal: 'z', vertical: 'y'},
      y: { horizontal: 'x', vertical: 'z'},
      z: { horizontal: 'x', vertical: 'y'}
    }

    this._rotationMap = {
      x: -1,
      y: -1,
      z: 1
    }
  }

  init() {
    this.addEvents()
  }

  addEvents() {
    $(window).on('keyup', this.type.bind(this))
    $(window).on('mousedown', this.mousedown.bind(this))
  }

  mousedown(e) {
    let canvasBox = renderer.domElement.getBoundingClientRect()
    let canvasMouseX = event.clientX - canvasBox.left
    let canvasMouseY = event.clientY - canvasBox.top

    /* THINGS TO DO */
    // ---- On MouseDown
    // 1) Get clicked cube and normal and save to this._clickData
    this._clickData = grabber.getClickData(canvasMouseX, canvasMouseY)

    // 2) Shoot through normal and save cubes to this._cubes
    let normal = grabber.vectorFromAxis(this._clickData.normal)
    this._cubes = grabber.shoot(this._clickData.object, normal)

    // 3) On mousemove, determine whether user moves vertically or horizontally,
    //    save to this._clickData
    this._currentX = e.clientX
    this._currentY = e.clientY
    $(window).one('mousemove', this._detectClickDirection.bind(this))
    $(window).on('mousemove', this._mousemove.bind(this))
  }

  _detectClickDirection(e) {
    // 3) On mousemove, determine whether user moves vertically or horizontally,
    //    save to this._clickData.direction
    let magX = e.clientX - this._currentX
    let magY = e.clientY - this._currentY

    this._lockAxis = Math.abs(magX) >= Math.abs(magY) ? 'horizontal' : 'vertical'

    let clickDir = this._normalMap[this._clickData.normal][this._lockAxis].toUpperCase()
    this._clickData.direction = clickDir

    let normal = grabber.vectorFromAxis(this._clickData.normal)
    let direction = grabber.vectorFromAxis(this._clickData.direction)
    this._clickData.rotationAxis = grabber.axisFromVector(normal.cross(direction))

    // 4) "Fiil out face"
    grabber.fillOutFace(this._cubes, direction)
  }

  _mousemove(e) {
    // 5) Animate this._cubes based on mouse movement
    let magX = e.clientX - this._currentX
    let magY = e.clientY - this._currentY

    let mag = this._lockAxis === 'horizontal' ? magX : magY
    mag *= (Math.PI / 2) * DRAG_COEFFICIENT

    mag *= this._rotationMap[this._clickData.rotationAxis]

    animator.setRotationOfFace(this._cubes, this._clickData.rotationAxis, mag)

    this._currentX = e.clientX
    this._currentY = e.clientY

    // ---- On Mouseup
    // 1) Animate this._cubes to nearest "clicked" position
    // 2) Reset()
  }

  type(e) {
    let letter = String.fromCharCode(e.keyCode).toLowerCase()

    // this is pretty annoying.
    if (e.keyCode === 186) letter = ';'

    let move = keyMap.getNotation(letter)
    if (!move) {
      return
    }

    rubiksCube.move(move)
  }
}

export default new inputHandler()
