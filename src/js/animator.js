import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'

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

    TweenMax.to(this._rotater.rotation, 0.5, {
      [axis]: `+=${Math.PI / 2 * dir}`,
      onComplete: () => {
        this._complete(axis, dir)
      }
    })
  }

  render() {
    renderer.render(scene, camera)
  }

  _complete(axis, dir) {
    this._rotater.rotation[axis] = Math.PI / 2 * dir
    requestAnimationFrame(this._reset.bind(this))
  }

  _reset() {
    let i = 0
    while (this._rotater.children[i]) {
      THREE.SceneUtils.detach(this._rotater.children[i], this._rotater, scene)
    }

    this._animating = false
    this._rotater.rotation.x = this._rotater.rotation.y = this._rotater.rotation.z = 0
  }
}

export default new Animator()
