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
    if (move === 'scramble') {
      this.scramble()
      return
    }

    this._queue.push(move)
    animator.go()

    if (this._willAlter(move) && this._isScrambled) {
      timer.start()
    }
  }

  nextMove() {
    if (this.checkIfSolved()) {
      return
    }

    let move = this._queue.shift()
    if (typeof move === 'string') {
      return this._getMoveDetails(move)
    } else if (typeof move === 'function') {
      return move()
    }
  }

  scramble() {
    for (let i = 0; i < 25; i++) {
      this._queue.push(this.randomMove())
    }
    animator.go()

    this._isScrambled = true
    timer.reset()
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

  checkIfSolved() {
    if (!this._isScrambled) {
      return false
    }

    if (this.isSolved()) {
      timer.stop()
      this._queue = []
      this._isScrambled = false
      return true
    }

    return false
  }

  isSolved() {
    return this._isFaceSolved('r') && this._isFaceSolved('u') && this._isFaceSolved('f')
  }

  _isFaceSolved(face) {
    let cubes = grabber.grabFace(face)
    let axis = this._rotateMap[face].axis
    let normal = grabber.vectorFromAxis(axis)

    let color
    let isSolved = true

    cubes.forEach((cube, idx) => {
      let raycaster = new THREE.Raycaster(cube.position.clone(), normal)
      let cubeColor = raycaster.intersectObjects(scene.children)[0].face.color

      if (!color) {
        color = cubeColor
      } else if (!cubeColor.equals(color)) {
        isSolved = false
      }
    })

    return isSolved
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

  _isValidMove(move) {
    // do things here
  }
}

export default new RubiksCube()
