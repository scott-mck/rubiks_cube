import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'

class Animator {
  constructor() {

  }

  start() {
    TweenMax.ticker.addEventListener('tick', this.render.bind(this))
  }

  end() {
    TweenMax.ticker.removeEventListener('tick', this.render.bind(this))
  }

  rotate(objects, axis, dir) {
    let timeline = new TimelineLite({ paused: true })
    let i
    for (i = 0; i < objects.length; i++) {
      timeline.to(objects[i].rotation, 2, {
        ['axis']: `+=${Math.PI / 4 * dir}`
      })
    }
  }

  render() {
    renderer.render(scene, camera)
  }
}

export default new Animator()
