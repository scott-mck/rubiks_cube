import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'

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

  rotate(objects, axis, dir) {
    if (this._animating) {
      return
    }
    this._animating = true

    let face = new THREE.Object3D()
    let i

    for (i = 0; i < objects.length; i++) {
      THREE.SceneUtils.attach(objects[i], scene, this._rotater)
    }

    TweenMax.to(this._rotater.rotation, DURATION, {
      [axis]: `+=${Math.PI / 2 * dir}`,
      onComplete: () => {
        this._rotater.rotation[axis] = Math.PI / 2 * dir
        this._wait(this._reset.bind(this))
      }
    })
  }

  render() {
    renderer.render(scene, camera)
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

    this._wait(() => {
      this._animating = false
    })
  }
}

export default new Animator()
