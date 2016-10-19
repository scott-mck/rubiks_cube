import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import renderer from './renderer'
import grabber from './grabber'
import timer from './timer'
import camera from './camera'
import scene from './scene'
import keyMap from './key-map'
import g from './globals'
import { cross } from './utils/vector'

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

    this._moveRecord = {}

    this._mousedown = this._mousedown.bind(this)
    this._mousemove = this._mousemove.bind(this)
    this._mouseup = this._mouseup.bind(this)
  }

  init() {
    this.canvas = document.querySelector('#canvas')
    this.addEvents()
  }

  addEvents() {
    document.querySelector('#scramble').addEventListener('click', () => rubiksCube.scramble())
    document.querySelector('#solve').addEventListener('click', () => rubiksCube.solve())

    window.addEventListener('keyup', (e) => this.type(e))
    this.canvas.addEventListener('mousedown', this._mousedown)
  }

  /* Steps */
  // ---- On MouseDown:
  // 1) Get clicked cube and normal
  // 2) Determine shoot and fill direction based on mousemovement
  // 4) "Fill out face", save to this._cubes
  // 5) Animate this._cubes based on mouse movement
  // ---- On Mouseup:
  // 1) Snap face to nearest position
  // 2) Reset()
  _mousedown(e) {
    let canvasBox = renderer.domElement.getBoundingClientRect()
    let canvasMouseX = event.clientX - canvasBox.left
    let canvasMouseY = event.clientY - canvasBox.top

    this._currentX = e.clientX
    this._currentY = e.clientY

    let clickData = grabber.getClickData(canvasMouseX, canvasMouseY)

    if (!clickData) {
      this._recordMoveProperty('allCubes', g.allCubes)
      this._clickOffCube(clickData)
    } else {
      this._recordMoveProperty('startCoord', clickData.object.position.clone())
      this._recordMoveProperty('shoot', clickData.normal)
      this._clickOnCube(clickData)
    }

    this.canvas.addEventListener('mouseup', this._mouseup)
  }

  async _clickOffCube(clickData) {
    await this._detectClickDirection()

    this._rotationAxis = this._clickDirection === 'x' ? 'y' : 'x'
    this._recordMoveProperty('rotationAxis', this._rotationAxis)

    animator.grip(g.allCubes, this._rotationAxis)

    this.canvas.addEventListener('mousemove', this._mousemove)
    this.canvas.addEventListener('mouseup', this._mouseup)
  }

  async _clickOnCube(clickData) {
    await this._detectClickDirection()

    // grab correct cubes based on mouse click and movement
    let fillOutAxis = this._normalMap[clickData.normal][this._clickDirection]
    this._cubes = grabber.slice(clickData.object.position, clickData.normal, fillOutAxis)

    this._rotationAxis = cross(clickData.normal, fillOutAxis)

    // prepare animator for rotating correct cubes
    animator.grip(this._cubes, this._rotationAxis)
    this.canvas.addEventListener('mousemove', this._mousemove)

    this._recordMoveProperty('fill', fillOutAxis)
    this._recordMoveProperty('rotationAxis', this._rotationAxis)
  }

  _detectClickDirection() {
    return new Promise((resolve) => {
      let mouseMoveHandler = (e) => {
        this.canvas.removeEventListener('mousemove', mouseMoveHandler)
        let magX = e.clientX - this._currentX
        let magY = e.clientY - this._currentY

        this._clickDirection = Math.abs(magX) >= Math.abs(magY) ? 'x' : 'y'
        resolve()
      }

      this.canvas.addEventListener('mousemove', mouseMoveHandler)
    })
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

    // this._cubes is falsey when rotating the entire cube, and truthy when
    // rotating a specific face, which changes the cube state
    if (this._cubes && rubiksCube.isReadyToTime) {
      timer.start()
    }
  }

  async _mouseup(e) {
    this.canvas.removeEventListener('mousemove', this._mousemove)
    this.canvas.removeEventListener('mouseup', this._mouseup)

    let totalRotation = await animator.snap()
    if (totalRotation ===  0) {
      return
    }

    let dir = totalRotation > 0 ? 1 : -1
    let numTurns = Math.abs(totalRotation) / (Math.PI / 2)
    numTurns *= dir

    this._recordMoveProperty('numTurns', numTurns)

    let solved = rubiksCube.isSolved()
    if (solved) {
      timer.stop()
    } else {
      rubiksCube.recordMove(this._moveRecord)
    }

    this._reset()
  }

  _reset() {
    this._currentX = null
    this._currentY = null
    this._cubes = null
    this._rotationAxis = null
    this._moveRecord = {}
  }

  _recordMoveProperty(key, val) {
    this._moveRecord[key] = val
  }

  type(e) {
    let letter = String.fromCharCode(e.keyCode).toLowerCase()

    // this is pretty annoying.
    if (e.keyCode === 186) letter = ';'

    let move = keyMap.getNotation(letter)
    if (!move) {
      return
    } else if (move === 'scramble') {
      rubiksCube.scramble()
    } else {
      rubiksCube.move(move)
    }
  }
}

export default new inputHandler()
