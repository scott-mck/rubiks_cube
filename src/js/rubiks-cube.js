import THREE from 'three'
import grabber from './grabber'
import animator from './animator'
import g from './globals'
import { vectorFromString, cross } from './utils/vector'

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

    this._moves = []
    this._solveMoves = []
  }

  move(move) {
    this._queueMove(move, true)

    if (this._willAlter(move) && this._isScrambled) {
      timer.start()
    }
  }

  _queueMove(move, flag) {
    this._moves.push(move)
    if (flag) {
      animator.run()
    }
  }

  nextMove() {
    if (this.checkIfSolved()) {
      return
    }

    let move = this._moves.shift()
    if (!move) {
      return
    }

    if (typeof move === 'string') {
      return this._animationDataFromNotation(move)
    } else {
      return this._animationData(move)
    }
  }

  scramble() {
    for (let i = 0; i < 25; i++) {
      let randomMove = this.randomMove()
      this._queueMove(randomMove)
      this.recordMove(randomMove)
    }
    animator.run()

    this._isScrambled = true
    timer.reset()
  }

  randomMove() {
    let axes = ['x', 'y', 'z']
    let normal = axes.splice(~~(Math.random() * axes.length), 1)[0]

    let coord1 = g.startPos - (g.cubieDistance * ~~(Math.random() * g.dimensions))
    let coord2 = g.startPos - (g.cubieDistance * ~~(Math.random() * g.dimensions))

    let startCoord = new THREE.Vector3()
    startCoord[`set${axes[0].toUpperCase()}`](coord1)
    startCoord[`set${axes[1].toUpperCase()}`](coord2)
    startCoord[`set${normal.toUpperCase()}`](g.startPos)

    let shoot = normal
    let fill = axes.splice(~~(Math.random() * axes.length), 1)[0]
    let numTurns = Math.random() < 0.5 ? 1 : -1

    return { startCoord, shoot, fill, numTurns }
  }

  checkIfSolved() {
    if (!this._isScrambled) {
      return false
    }

    if (this.isSolved()) {
      timer.stop()
      this._moves = []
      this._isScrambled = false
      return true
    }

    return false
  }

  isSolved() {
    return this._isFaceSolved('r') && this._isFaceSolved('u') && this._isFaceSolved('f')
  }

  // { startCoord, shoot, fill, numTurns }
  recordMove(moveData) {
    this._solveMoves.push(moveData)
  }

  reverseMove({ startPos, normal, fillOutDir, rotationAxis, numTurns }) {
    let cubes = grabber.slice(startPos, normal, fillOutDir)
    animator.rotate(cubes, rotationAxis, numTurns * -1)
  }

  solve() {
    this._moves = []
    while (this._solveMoves.length > 0) {
      let reverseMove = this._solveMoves.pop()
      reverseMove.numTurns *= -1
      this._queueMove(reverseMove)
    }
    animator.run()
  }

  _isFaceSolved(face) {
    let cubes = grabber.grabFace(face)
    let axis = this._rotateMap[face].axis
    let normal = vectorFromString(axis)

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

  // FIXME!
  _animationDataFromNotation(move) {
    let face = move[0]
    let faceDetails = this._rotateMap[face]

    let doubleMove = move.indexOf('Double') > -1
    let objects = grabber.grabFace(face, doubleMove)

    let axis = faceDetails.axis
    let numTurns = faceDetails.dir

    if (move.indexOf('Prime') > -1) {
      numTurns *= -1
    }

    return { objects, axis, numTurns }
  }

  _animationData({ startCoord, shoot, fill, numTurns }) {
    shoot = vectorFromString(shoot, -1)
    let raycaster = new THREE.Raycaster(startCoord, shoot)
    let objects = grabber.raycast(raycaster)
    grabber.fillOutFace(objects, fill)

    let axis = cross(shoot, fill)

    return { objects, axis, numTurns }
  }

  _willAlter(move) {
    return ['x', 'y'].indexOf(move[0]) === -1
  }
}

export default new RubiksCube()
