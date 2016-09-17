import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import rubiksCube from './rubiks-cube'

const DURATION = 0.1
const EASE = 'linear'
const WAIT_COUNT = 1

class Animator {
  constructor() {
    this._rotater = new THREE.Object3D()
    scene.add(this._rotater)
  }

  init() {
    TweenMax.ticker.addEventListener('tick', this.render.bind(this))
  }

  animate({ objects, axis, dir }) {
    if (this.animating) {
      return false
    } else {
      this._animate({ objects, axis, dir })
      return true
    }
  }

  _next() {
    let nextMove = rubiksCube.nextMove()
    if (!nextMove) {
      return
    }

    this._animate(nextMove)
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

  render() {
    renderer.render(scene, camera)
  }

  _complete() {
    this._reset()

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

  _reset() {
    let i = 0
    while (this._rotater.children[i]) {
      THREE.SceneUtils.detach(this._rotater.children[i], this._rotater, scene)
    }

    this._rotater.rotation.set(0, 0, 0)
  }
}

export default new Animator()
