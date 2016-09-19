import THREE from 'three'
import grabber from './grabber'
import animator from './animator'

class RubiksCube {
  constructor() {
    this._rotateMap = {
      r: { axis: 'x', dir: -1 },
      l: { axis: 'x', dir: -1 },
      u: { axis: 'y', dir: -1 },
      d: { axis: 'y', dir: 1 },
      f: { axis: 'z', dir: -1 },
      b: { axis: 'z', dir: 1 }
    }

    this._rotateMap.x = this._rotateMap.r
    this._rotateMap.y = this._rotateMap.u

    this._queue = []
  }

  move(move) {
    if (animator.animating) {
      this._queue.push(move)
    } else {
      animator.animate(this._getMoveDetails(move))
    }
  }

  nextMove() {
    let move = this._queue.shift()
    if (!move) {
      return false
    }

    return this._getMoveDetails(move)
  }

  _getMoveDetails(move) {
    let face = move[0]
    let faceDetails = this._rotateMap[face]

    let objects = grabber.grabFace(face)
    let axis = faceDetails.axis
    let dir = faceDetails.dir

    if (move.indexOf('Prime') > -1) {
      dir *= -1
    }

    return { objects, axis, dir }
  }
}

export default new RubiksCube()
