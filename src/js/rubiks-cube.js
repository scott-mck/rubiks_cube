import THREE from 'three'
import grabber from './grabber'
import animator from './animator'
import g from './globals'

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
    this._queue.push(move)
    animator.go()

    if (this._willAlter(move) && this._isScrambled()) {
      timer.start()
    }
  }

  nextMove() {
    let move = this._queue.shift()
    if (typeof move === 'string') {
      return this._getMoveDetails(move)
    } else if (typeof move === 'function') {
      return move()
    }
  }

  scramble() {
    this._scrambled = true

    for (let i = 0; i < 25; i++) {
      this._queue.push(this.randomMove())
    }
    animator.go()
  }

  randomMove() {
    let axes = ['x', 'y', 'z']
    let normal = axes.splice(~~(Math.random() * axes.length), 1)[0]
    let rayDirection = grabber.vectorFromAxis(normal, -1)

    let coord1 = g.startPos - (g.cubieDistance * ~~(Math.random() * g.dimensions))
    let coord2 = g.startPos - (g.cubieDistance * ~~(Math.random() * g.dimensions))

    let startPos = new THREE.Vector3()
    startPos[`set${axes[0].toUpperCase()}`](coord1)
    startPos[`set${axes[1].toUpperCase()}`](coord2)
    startPos[`set${normal.toUpperCase()}`](g.startPos)

    let raycaster = new THREE.Raycaster(startPos, rayDirection)
    let randomFillDir = axes.splice(~~(Math.random() * axes.length), 1)[0]

    return () => {
      let objects = grabber.raycast(raycaster)
      grabber.filterIntersects(objects)

      grabber.fillOutFace(objects, grabber.vectorFromAxis(randomFillDir))

      let dir = Math.random() < 0.5 ? 1 : -1

      return { objects, axis: axes[0], dir }
    }
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

  _willAlter(move) {
    return ['x', 'y'].indexOf(move[0]) === -1
  }

  _isScrambled() {
    return this._scrambled
  }

  _isValidMove(move) {
    // do things here
  }
}

export default new RubiksCube()
