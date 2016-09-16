import THREE from 'three'
import grabber from './grabber'
import animator from './animator'

class RubiksCube {
  constructor() {
    this._rotateMap = {
      r: { axis: 'x', dir: 1 },
      l: { axis: 'x', dir: -1 },
      u: { axis: 'y', dir: 1 },
      d: { axis: 'y', dir: -1 },
      f: { axis: 'z', dir: 1 },
      b: { axis: 'z', dir: -1 },
    }
  }

  move(move) {
    let face = move[0]
    let faceData = this._rotateMap[face]
    let objects = grabber.getFace(face)
    animator.rotate(objects, faceData.axis, faceData.dir)
  }
}

export default new RubiksCube()
