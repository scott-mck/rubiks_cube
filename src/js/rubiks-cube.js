import THREE from 'three'
import grabber from './grabber'
import animator from './animator'
import g from './globals'
import { vectorFromString } from './utils/vector'

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
    this._recordMove(move)

    if (this._willAlter(move) && this._isScrambled) {
      timer.start()
    }
  }

  // @param {string|object} move - A notation string or instructions to grab the correct face
  _queueMove(move, flag) {
    this._moves.push(move)
    if (flag) {
      animator.run()
    }
  }

  _recordMove(move) {
    this._solveMoves.push(move)
  }

  nextMove() {
    if (this.checkIfSolved()) {
      return
    }

    let move = this._moves.shift()
    if (!move) {
      return
    }

    return this._prepareForAnimation(move)
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

    return { startCoord, shoot, fill, rotationAxis, numTurns }
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

  // @param {string|object} move - A notation string or instructions to grab the correct face
  recordMove(moveData) {
    this._solveMoves.push(moveData)
  }

  reverseMove(moveData) {
    if (typeof moveData === 'string') {
      moveData = this.reverseNotation(moveData)
    } else {
      moveData.numTurns *= -1
    }

    return moveData
  }

  solve() {
    this._moves = []
    while (this._solveMoves.length > 0) {
      let reverseMove = this.reverseMove(this._solveMoves.pop())
      this._queueMove(reverseMove)
    }
    animator.run()
  }

  reverseNotation(move) {
    if (move.indexOf('Prime') > -1) {
      return move[0]
    } else {
      return `${move[0]}Prime`
    }
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

  _prepareForAnimation(move) {
    if (typeof move === 'string') {
      return this._getAnimationDataFromNotation(move)
    } else {
      return this._getAnimationData(move)
    }
  }

  _getAnimationDataFromNotation(move) {
    let face = move[0]
    let faceDetails = this._rotateMap[face]

    let doubleMove = move.indexOf('Double') > -1
    let objects = grabber.grabFace(face, doubleMove)

    let rotationAxis = faceDetails.axis
    let numTurns = faceDetails.dir

    if (move.indexOf('Prime') > -1) {
      numTurns *= -1
    }

    return { objects, rotationAxis, numTurns }
  }

  _getAnimationData({ allCubes, startCoord, shoot, fill, rotationAxis, numTurns }) {
    let objects = allCubes ? allCubes: grabber.slice(startCoord, shoot, fill)
    return { objects, rotationAxis, numTurns }
  }

  _willAlter(move) {
    return ['x', 'y'].indexOf(move[0]) === -1
  }
}

export default new RubiksCube()
