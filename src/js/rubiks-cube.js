import THREE from 'three'
import timer from './timer'
import scene from './scene'
import grabber from './grabber'
import animator from './animator'
import g from './globals'
import solver from './solver'
import { vectorFromString, cross } from './utils/vector'
import { getCubeState, getRelativeFacesOfCubie } from './utils/relative-finder'

class RubiksCube {
  _moves = []
  _solveMoves = []
  _callbacks = []
  _rotateMap = {
    r: { axis: 'x', dir: -1 },
    l: { axis: 'x', dir: 1 },
    u: { axis: 'y', dir: -1 },
    d: { axis: 'y', dir: 1 },
    f: { axis: 'z', dir: -1 },
    b: { axis: 'z', dir: 1 },
    x: { axis: 'x', dir: -1 },
    y: { axis: 'y', dir: -1 },
  }

  move(move) {
    return new Promise((resolve) => {
      let moves = move.split(' ').filter(move => !!move)
      while (moves.length > 0) {
        let currentMove = moves.shift()
        this._queueMove(currentMove)
        this._recordMove(currentMove)
      }

      // When animator is ready, start animating through the move chain
      // Make sure to `await animator.ready()` only once, otherwise #_nextMove
      // gets called multiple times
      if (this._isWaiting) {
        return
      }
      this._isWaiting = true
      this.afterMovesCompletion().then(() => {
        this._isWaiting = false
        animator.ready().then(resolve)
      })
      animator.ready().then(() => this._nextMove())
    })
  }

  // @param {string|object} move - A notation string or instructions to grab the correct face
  _queueMove(move) {
    this._moves.push(move)
  }

  _recordMove(move) {
    this._solveMoves.push(move)
  }

  async _nextMove() {
    let isSolved = this.isSolved()

    if (isSolved && this._moves.length === 0) {
      this.reset()
    }

    if (isSolved && timer.timing) {
      timer.stop()
      this.reset()
    }

    let move = this._moves.shift()
    if (!move) {
      this._afterMovesCompletion()
      return
    }

    let animationData = this._getAnimationData(move)

    if (this.isReadyToTime && this._willAlter(animationData)) {
      this.isReadyToTime = false
      timer.start()
    }

    await animator.rotate(animationData)
    this._nextMove()
  }

  moveFaceToTop(faceColor) {
    let cubeState = getCubeState()

    let targetSide = cubeState.color[faceColor]
    let moves
    if (targetSide === 'r') moves = 'y x'
    else if (targetSide === 'l') moves = 'y xPrime'
    else if (targetSide === 'f') moves = 'x'
    else if (targetSide === 'b') moves = 'xPrime'
    else if (targetSide === 'd') moves = 'x x'
    else return

    return this.move(moves)
  }

  scramble() {
    for (let i = 0; i < 25; i++) {
      let randomMove = this.randomMove()
      this._queueMove(randomMove)
      this.recordMove(randomMove)
    }

    animator.ready().then(() => {
      this._nextMove()
      timer.reset()
    })

    this.afterMovesCompletion().then(() => this.isReadyToTime = true)
  }

  afterMovesCompletion() {
    return new Promise((resolve) => {
      if (this._moves.length > 0) {
        this._afterMovesCompletion(resolve)
      } else {
        resolve()
      }
    })
  }

  _afterMovesCompletion(callback) {
    if (callback != undefined) {
      this._callbacks.push(callback)
    } else {
      while (this._callbacks.length) {
        let callback = this._callbacks.shift()
        callback && callback()
      }
    }
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
    let rotationAxis = cross(shoot, fill)
    let numTurns = Math.random() < 0.5 ? 1 : -1

    return { startCoord, shoot, fill, rotationAxis, numTurns }
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
    if (g.dimensions === 3) {
      return solver.solve()
    }

    this._moves = []
    while (this._solveMoves.length > 0) {
      let reverseMove = this.reverseMove(this._solveMoves.pop())
      this._queueMove(reverseMove)
    }
    this._nextMove()
  }

  reset() {
    this._moves = []
    this._solveMoves = []
  }

  reverseNotation(moves) {
    let reverseMoves = []
    moves = moves.split(' ')

    while (moves.length > 0) {
      let move = moves.shift()

      if (move === '') {
        reverseMoves.push('')
        continue
      }

      let reversedMove = move[0]

      if (move.includes('Double')) {
        reversedMove += 'Double'
      }
      if (!move.includes('Prime')) {
        reversedMove += 'Prime'
      }

      reverseMoves.push(reversedMove)
    }

    return reverseMoves.join(' ')
  }

  _isFaceSolved(face) {
    let cubies = grabber.grabFace(face)

    let faceColor
    for (let cubie of cubies) {
      let cubieColor = getRelativeFacesOfCubie(cubie).face[face]

      if (!faceColor) {
        faceColor = cubieColor
      } else if (cubieColor !== faceColor) {
        return false
      }
    }

    return true
  }

  _getAnimationData(move) {
    if (typeof move === 'string') {
      return this._getAnimationDataFromNotation(move)
    } else {
      return this._getAnimationDataFromInstructions(move)
    }
  }

  _getAnimationDataFromNotation(move) {
    let face = move[0]
    let faceDetails = this._rotateMap[face]

    let objects = grabber.grabFace(move)
    let rotationAxis = faceDetails.axis
    let numTurns = faceDetails.dir

    if (move.indexOf('Prime') > -1) {
      numTurns *= -1
    }

    return { objects, rotationAxis, numTurns }
  }

  _getAnimationDataFromInstructions({ allCubes, startCoord, shoot, fill, rotationAxis, numTurns }) {
    let objects = allCubes ? allCubes: grabber.slice(startCoord, shoot, fill)
    return { objects, rotationAxis, numTurns }
  }

  _willAlter(move) {
    if (typeof move === 'string') {
      return ['x', 'y'].indexOf(move[0]) === -1
    } else {
      return move.objects.length <= Math.pow(g.dimensions, 2)
    }
  }
}

export default new RubiksCube()
