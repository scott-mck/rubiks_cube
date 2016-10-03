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
    this._rotater1 = new THREE.Object3D()
    this._rotater2 = new THREE.Object3D()
    this._rotater1.name = 'rotater'
    this._rotater2.name = 'rotater'
    scene.add(this._rotater1)
    scene.add(this._rotater2)

    this._emptyRotaters = [this._rotater1, this._rotater2]
  }

  init() {
    TweenMax.ticker.addEventListener('tick', this.render.bind(this))
  }

  // jump-starts animation sequence: looking for rubiksCube#nextMove and
  // repeats on completion
  run() {
    if (!this.animating) {
      this._next()
    }
  }

  rotate(objects, rotationAxis, numTurns) {
    if (this.animating) {
      return
    }

    this._rotate(objects, rotationAxis, numTurns)
  }

  _rotate(objects, rotationAxis, numTurns) {
    this.animating = true

    this._currentRotater = this._emptyRotaters.shift()

    let i
    for (i = 0; i < objects.length; i++) {
      THREE.SceneUtils.attach(objects[i], scene, this._currentRotater)
    }

    let onComplete = () => {
      this._currentRotater.rotation[rotationAxis] = Math.PI / 2 * numTurns
      this._wait(this._complete.bind(this))
    }

    TweenMax.to(this._currentRotater.rotation, DURATION, {
      [rotationAxis]: `+=${Math.PI / 2 * numTurns}`,
      ease: EASE,
      onComplete: onComplete
    })
  }

  setRotation(axis, mag) {
    this._rotationAxis = this._rotationAxis || axis

    TweenMax.to(this._currentRotater.rotation, 0, {
      [axis]: `+=${mag}`
    })
  }

  _next() {
    let nextMove = rubiksCube.nextMove()
    if (!nextMove) {
      return
    }

    let { objects, rotationAxis, numTurns } = nextMove
    this._rotate(objects, rotationAxis, numTurns)
  }

  render() {
    renderer.render(scene, camera)
  }

  _complete() {
    this.reset()

    this.animating = false
    this._next()
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
    this._currentRotater = this._emptyRotaters.shift()

    let i
    for (i = 0; i < cubes.length; i++) {
      THREE.SceneUtils.attach(cubes[i], scene, this._currentRotater)
    }
  }

  snap() {
    let currentRotation = this._currentRotater.rotation[this._rotationAxis]
    let negativeRotation = currentRotation < 0
    let angle = negativeRotation ? -Math.PI / 2 : Math.PI / 2

    let remainder = currentRotation % angle

    if (Math.abs(remainder) > Math.PI / 4) {
      remainder = angle - remainder
    } else {
      remainder *= -1
    }

    let promise = new Promise((resolve) => {
      TweenMax.to(this._currentRotater.rotation, SNAP_DURATION, {
        [this._rotationAxis]: `+=${remainder}`,
        onComplete: () => {
          let totalRotation = this._currentRotater.rotation[this._rotationAxis]
          this.reset()
          resolve(totalRotation)
        }
      })
    })

    return promise
  }

  reset() {
    while (this._currentRotater.children[0]) {
      THREE.SceneUtils.detach(this._currentRotater.children[0], this._currentRotater, scene)
    }

    this._currentRotater.rotation.set(0, 0, 0)
    this._rotationAxis = null

    this._emptyRotaters.push(this._currentRotater)
  }
}

export default new Animator()
