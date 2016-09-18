import $ from 'jquery'
import THREE from 'three'
import rubiksCube from './rubiks-cube'
import renderer from './renderer'
import camera from './camera'
import scene from './scene'
import keyMap from './key-map'

class inputHandler {
  constructor() {
    // Captures correct cubes when clicking on a given face (or normal)
    this._normalMap = {
      x: { horizontal: 'z', vertical: 'y'},
      y: { horizontal: 'x', vertical: 'z'},
      z: { horizontal: 'x', vertical: 'y'}
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

    // 2) Shoot through normal and save cubes to this._shotCubes
    this._shotCubes = grabber.shoot(this._clickData.object, this._clickData.normal)

    // 3) On mousemove, determine whether user moves vertically or horizontally,
    //    save to this._clickDirection
    this._currentX = e.clientX
    this._currentY = e.clientY
    $(window).one('mousemove', this.mousemove.bind(this))
  }

  mousemove(e) {
    // 3) On mousemove, determine whether user moves vertically or horizontally,
    //    save to this._clickDirection
    let magX = e.clientX - this._currentX
    let magY = e.clientY - this._currentY

    // dir: along which axis the mouse moves
    // mag: positive or negative, used for animation (not grabbing correct cubes)

    let dir
    let mag
    if (Math.abs(magX) >= Math.abs(magY)) {
      dir = 'horizontal'
      mag = magX > 0 ? 1 : -1
    } else {
      dir = 'vertical'
      mag = magY > 0 ? 1 : -1
    }

    let normalStr = grabber._getAxisString(this._clickData.normal)
    let clickDir = this._normalMap[normalStr][dir].toUpperCase()
    this._clickDirection = new THREE.Vector3()[`set${clickDir}`](1)

    // 4) "Fiil out face" and save to this._currentFace
    grabber.fillOutFace(this._shotCubes, this._clickDirection)
    this._shotCubes.forEach(object => scene.remove(object))

    // 5) Animate this._currentFace based on mouse movement
    // ---- On Mouseup
    // 1) Animate this._currentFace to nearest "clicked" position
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
