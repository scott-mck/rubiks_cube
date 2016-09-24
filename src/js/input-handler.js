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
    this._normalMap = {
      // "normal of clicked face": { "drag direction": "axis of rotation" }
      // e.x.: Clicking on the right face returns a normal 'x'
      // Dragging vertically ('y') will "fill out" the face in the 'y' direction
      x: { x: 'z', y: 'y'},
      y: { x: 'x', y: 'z'},
      z: { x: 'x', y: 'y'}
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

    let clickData = grabber.getClickData(canvasMouseX, canvasMouseY)

    if (!clickData) {
      this._clickOffCube(clickData)
    } else {
      this._clickOnCube(clickData)
    }

    this.$canvas.one('mouseup', this._mouseup.bind(this))
  }

  _clickOffCube(clickData) {
    this._detectClickDirection().then(() => {
      this._rotationAxis = this._clickDirection === 'x' ? 'y' : 'x'
      animator.grip(g.allCubes, this._rotationAxis)

      this.$canvas.on('mousemove.input', this._mousemove.bind(this))
      this.$canvas.one('mouseup', this._mouseup.bind(this))
    })
  }

  _clickOnCube(clickData) {
    this._cubes = grabber.shoot(clickData.object, clickData.normal)

    this._detectClickDirection().then(() => {
      let normalVector = grabber.vectorFromAxis(clickData.normal)
      let fillOutAxis = this._normalMap[clickData.normal][this._clickDirection]
      let fillOutVector = grabber.vectorFromAxis(fillOutAxis)

      this._rotationAxis = grabber.axisFromVector(normalVector.cross(fillOutVector))
      grabber.fillOutFace(this._cubes, fillOutVector)

      animator.grip(this._cubes, this._rotationAxis)
      this.$canvas.on('mousemove.input', this._mousemove.bind(this))
    })
  }

  _detectClickDirection() {
    let promise = new Promise((resolve) => {
      this.$canvas.one('mousemove', (e) => {
        let magX = e.clientX - this._currentX
        let magY = e.clientY - this._currentY

        this._clickDirection = Math.abs(magX) >= Math.abs(magY) ? 'x' : 'y'
        resolve()
      })
    })

    return promise
  }

  _mousemove(e) {
    let magX = e.clientX - this._currentX
    let magY = e.clientY - this._currentY

    this._currentX = e.clientX
    this._currentY = e.clientY

    let mag = this._clickDirection === 'x' ? magX : magY
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

    this._currentX = null
    this._currentY = null
    this._cubes = null
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
