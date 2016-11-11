import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import rubiksCube from './rubiks-cube'

let DURATION = 0.1
const EASE = 'linear'
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
    this._callbacks = []
  }

  init() {
    TweenMax.ticker.addEventListener('tick', () => this.render())
  }

  duration(dur) {
    if (dur) {
      DURATION = dur
    } else {
      return DURATION
    }
  }

  _ready(callback) {
    if (callback != undefined) {
      this._callbacks.push(callback)
    } else {
      while (this._callbacks.length > 0) {
        let callback = this._callbacks.shift()
        callback && callback()
      }
    }
  }

  ready() {
    return new Promise((resolve) => {
      if (this.animating) {
        this._ready(resolve)
      } else {
        resolve()
      }
    })
  }

  rotate({ objects, rotationAxis, numTurns }) {
    return new Promise(async (resolve) => {
      if (this.animating) {
        return
      }

      await this._rotate({ objects, rotationAxis, numTurns })

      this._currentRotater.rotation[rotationAxis] = Math.PI / 2 * numTurns
      this._complete()
      resolve()
    })
  }

  _rotate({ objects, rotationAxis, numTurns }) {
    return new Promise((resolve) => {
      this.animating = true
      this._currentRotater = this._emptyRotaters.shift()

      for (let i = 0; i < objects.length; i++) {
        THREE.SceneUtils.attach(objects[i], scene, this._currentRotater)
      }

      TweenMax.to(this._currentRotater.rotation, DURATION * Math.abs(numTurns), {
        [rotationAxis]: `+=${Math.PI / 2 * numTurns}`,
        ease: EASE,
        onComplete: resolve
      })
    })
  }

  setRotation(axis, mag) {
    this._rotationAxis = this._rotationAxis || axis

    TweenMax.to(this._currentRotater.rotation, 0, {
      [axis]: `+=${mag}`
    })
  }

  render() {
    renderer.render(scene, camera)
  }

  _complete() {
    this.reset()
    this._ready()
  }

  grip(cubes, axis) {
    this._currentRotater = this._emptyRotaters.shift()

    for (let i = 0; i < cubes.length; i++) {
      THREE.SceneUtils.attach(cubes[i], scene, this._currentRotater)
    }
  }

  snap() {
    return new Promise((resolve) => {
      let currentRotation = this._currentRotater.rotation[this._rotationAxis]
      let negativeRotation = currentRotation < 0
      let angle = negativeRotation ? -Math.PI / 2 : Math.PI / 2

      let remainder = currentRotation % angle

      if (Math.abs(remainder) > Math.PI / 4) {
        remainder = angle - remainder
      } else {
        remainder *= -1
      }

      TweenMax.to(this._currentRotater.rotation, SNAP_DURATION, {
        [this._rotationAxis]: `+=${remainder}`,
        onComplete: () => {
          let totalRotation = this._currentRotater.rotation[this._rotationAxis]
          let dir = totalRotation > 0 ? 1 : -1
          let numTurns = Math.abs(totalRotation) / (Math.PI / 2) * dir

          this._complete()

          resolve(numTurns)
        }
      })
    })
  }

  reset() {
    while (this._currentRotater.children[0]) {
      THREE.SceneUtils.detach(this._currentRotater.children[0], this._currentRotater, scene)
    }

    this._rotationAxis = null
    this.animating = false

    this._currentRotater.rotation.set(0, 0, 0)
    this._emptyRotaters.push(this._currentRotater)
  }
}

export default new Animator()
