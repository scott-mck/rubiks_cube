import $ from 'jquery'
import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import renderer from './renderer'
import camera from './camera'
import scene from './scene'
import keyMap from './key-map'
import g from './globals'

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
      x: 1,
      y: 1,
      z: -1
    }
  }

  init() {
    this.$canvas = $('#canvas')
    this.addEvents()
  }

  addEvents() {
    $('#scramble').click(() => {
      rubiksCube.scramble()
    })
    $(window).on('keyup', this.type.bind(this))
    this.$canvas.on('mousedown', this.mousedown.bind(this))
  }

  /* Steps */
  // ---- On MouseDown:
  // 1) Get clicked cube and normal and save to this._clickData
  // 2) Shoot through normal and save cubes to this._cubes
  // 3) On mousemove, determine whether user moves vertically or horizontally,
  //    save to this._clickData
  // 4) "Fill out face"
  // 5) Animate this._cubes based on mouse movement
  // ---- On Mouseup:
  // 1) Snap face to nearest position
  // 2) Reset()
  mousedown(e) {
    let canvasBox = renderer.domElement.getBoundingClientRect()
    let canvasMouseX = event.clientX - canvasBox.left
    let canvasMouseY = event.clientY - canvasBox.top

    this._currentX = e.clientX
    this._currentY = e.clientY

    this._clickData = grabber.getClickData(canvasMouseX, canvasMouseY)

    if (!this._clickData) {
      this._detectClickDirection(() => {
        this._rotationAxis = this._lockAxis === 'horizontal' ? 'y' : 'x'
        animator.grip(g.allCubes, this._rotationAxis)
        this.$canvas.on('mousemove.input', this._mousemove.bind(this))
        this.$canvas.one('mouseup', this._mouseup.bind(this))
      })
      return
    }

    let normal = grabber.vectorFromAxis(this._clickData.normal)
    this._cubes = grabber.shoot(this._clickData.object, normal)

    this._detectClickDirection(() => {
      let clickDir = this._normalMap[this._clickData.normal][this._lockAxis].toUpperCase()
      this._clickData.direction = clickDir

      let normal = grabber.vectorFromAxis(this._clickData.normal)
      let direction = grabber.vectorFromAxis(this._clickData.direction)
      this._rotationAxis = grabber.axisFromVector(normal.cross(direction))

      grabber.fillOutFace(this._cubes, direction)
      animator.grip(this._cubes, this._rotationAxis)
    })

    this.$canvas.on('mousemove.input', this._mousemove.bind(this))
    this.$canvas.one('mouseup', this._mouseup.bind(this))
  }

  _detectClickDirection(callback) {
    this.$canvas.one('mousemove', (e) => {
      let magX = e.clientX - this._currentX
      let magY = e.clientY - this._currentY

      this._lockAxis = Math.abs(magX) >= Math.abs(magY) ? 'horizontal' : 'vertical'
      callback && callback()
    })
  }

  _mousemove(e) {
    let magX = e.clientX - this._currentX
    let magY = e.clientY - this._currentY

    this._currentX = e.clientX
    this._currentY = e.clientY

    let mag = this._lockAxis === 'horizontal' ? magX : magY
    mag *= (Math.PI / 2) * DRAG_COEFFICIENT

    mag *= this._rotationMap[this._rotationAxis]

    animator.setRotation(this._rotationAxis, mag)

    if (this._cubes && rubiksCube._isScrambled) {
      timer.start()
    }
  }

  _mouseup(e) {
    animator.snap().then(() => {
      rubiksCube.checkIfSolved()
    })
    this.$canvas.off('mousemove.input')

    this._clickData = null
    this._currentX = null
    this._currentY = null
    this._cubes = null
    this._lockAxis = null
    this._rotationAxis = null
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
