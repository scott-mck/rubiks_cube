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
      // this._rotater.add(objects[i])
      THREE.SceneUtils.attach(objects[i], scene, this._rotater)
    }

    TweenMax.to(this._rotater.rotation, 0.5, {
      [axis]: `+=${Math.PI / 2 * dir}`,
      onComplete: this._reset.bind(this)
    })
  }

  render() {
    renderer.render(scene, camera)
  }

  _reset() {
    let i = 0
    while (this._rotater.children[i]) {
      // this._rotater.remove(this._rotater.children[i])
      THREE.SceneUtils.detach(this._rotater.children[i], this._rotater, scene)
    }

    this._animating = false
    this._rotater.rotation.x = this._rotater.rotation.y = this._rotater.rotation.z = 0
  }
}

export default new Animator()
