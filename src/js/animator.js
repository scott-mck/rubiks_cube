import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import rubiksCube from './rubiks-cube'

const DURATION = 0.1
const EASE = 'linear'
const WAIT_COUNT = 1
const SNAP_DURATION = 0.3

class Animator {
  constructor() {
    // let material = new THREE.MeshBasicMaterial({
    //   color: 0xd3d3d3,
    //   vertexColors: THREE.FaceColors,
    //   transparent: true,
    //   opacity: 0.5
    // })
    //
    // let geometry = new THREE.BoxGeometry(10, 100, 100)
    //
    this._rotater = new THREE.Object3D()
    this._rotater.name = 'rotater'
    scene.add(this._rotater)
  }

  init() {
    TweenMax.ticker.addEventListener('tick', this.render.bind(this))
  }

  animate({ objects, axis, dir }) {
    if (this.animating) {
      return
    }

    this._animate({ objects, axis, dir })
  }

  _animate({ objects, axis, dir }) {
    this.animating = true

    let i
    for (i = 0; i < objects.length; i++) {
      THREE.SceneUtils.attach(objects[i], scene, this._rotater)
    }

    let onComplete = () => {
      this._rotater.rotation[axis] = Math.PI / 2 * dir
      this._wait(this._complete.bind(this))
    }

    TweenMax.to(this._rotater.rotation, DURATION, {
      [axis]: `+=${Math.PI / 2 * dir}`,
      ease: EASE,
      onComplete: onComplete
    })
  }

  setRotation(axis, mag) {
    TweenMax.to(this._rotater.rotation, 0, {
      [axis]: `+=${mag}`
    })
  }

  _next() {
    let nextMove = rubiksCube.nextMove()
    if (!nextMove) {
      return
    }

    this._animate(nextMove)
  }

  render() {
    renderer.render(scene, camera)
  }

  _complete() {
    this.reset()

    this._wait(() => {
      this.animating = false
      this._next()
    })
  }

  _wait(callback, count = WAIT_COUNT) {
    let loop = () => {
      if (count === 0) {
        callback()
        return
      }

      count -= 1
      requestAnimationFrame(loop)
    }

    loop()
  }

  grip(cubes, axis) {
    let i
    for (i = 0; i < cubes.length; i++) {
      THREE.SceneUtils.attach(cubes[i], scene, this._rotater)
    }
    this._rotatingAxis = axis
  }

  snap() {
    let currentRotation = this._rotater.rotation[this._rotatingAxis]
    let negativeRotation = currentRotation < 0
    let angle = negativeRotation ? -Math.PI / 2 : Math.PI / 2

    let remainder = currentRotation % angle
    // let remainder = Math.abs(currentRotation % angle)

    if (Math.abs(remainder) > Math.PI / 4) {
      remainder = angle - remainder
    } else {
      // remainder *= negativeRotation ? -1 : 1
      remainder *= -1
    }

    TweenMax.to(this._rotater.rotation, SNAP_DURATION, {
      [this._rotatingAxis]: `+=${remainder}`,
      onComplete: () => {
        this.reset()
      }
    })
  }

  reset() {
    while (this._rotater.children[0]) {
      THREE.SceneUtils.detach(this._rotater.children[0], this._rotater, scene)
    }

    this._rotater.rotation.set(0, 0, 0)
    this._rotatingAxis = null
  }
}

export default new Animator()
