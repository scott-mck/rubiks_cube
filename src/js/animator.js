import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import grabber from './grabber'
import renderer from './renderer'
import rubiksCube from './rubiks-cube'

const DURATION = 0.3

class Animator {
  constructor() {
    this._rotater = new THREE.Object3D()
    scene.add(this._rotater)
  }

  start() {
    TweenMax.ticker.addEventListener('tick', this.render.bind(this))
  }

  end() {
    TweenMax.ticker.removeEventListener('tick', this.render.bind(this))
  }

  continue() {
    if (this.animating) {
      return
    }
    this._next()
  }

  animate(objects, axis, dir) {
    let animation = this._animate.bind(this, objects, axis, dir)
  }

  _next() {
    let nextMove = rubiksCube.nextMove()
    if (!nextMove) {
      return
    }

    this._animate(nextMove)
  }

  _animate({ move, axis, dir }) {
    let objects = grabber.grab(move)

    let i
    for (i = 0; i < objects.length; i++) {
      THREE.SceneUtils.attach(objects[i], scene, this._rotater)
    }

    let finishAnimation = () => {
      this._rotater.rotation[axis] = Math.PI / 2 * dir
    }

    TweenMax.to(this._rotater.rotation, DURATION, {
      [axis]: `+=${Math.PI / 2 * dir}`,
      onComplete: () => {
        finishAnimation()
        this._wait(this._complete.bind(this))
      }
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

  _wait(callback) {
    let count = 2

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
