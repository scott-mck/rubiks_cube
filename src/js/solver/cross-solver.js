import THREE from 'three'
import rubiksCube from '../rubiks-cube'
import animator from '../animator'
import grabber from '../grabber'
import scene from '../scene'
import g from '../globals'
import keyMap from '../key-map'
import { vectorFromString } from '../utils/vector'
import { getColorString, getCubieColors } from '../utils/color'
import {
  getRelativeDirection,
  getRelativeFace,
  getRelativeFacesOfCubie,
  getCubeState
} from '../utils/relative-finder'

class CrossSolver {
  constructor() {
		this._callbacks = []
		this._promises = []
  }

	async solve() {
    this._cubeState = getCubeState()
		await this.moveWhiteFaceToTop()
    this._cubeState = getCubeState()
		this.completeCross()
	}

  getGlobalPosition(mesh) {
    let matrixWorld = mesh.matrixWorld.clone()
    return new THREE.Vector3().setFromMatrixPosition(matrixWorld)
  }

	chainPromise(callback) {
    this._callbacks.push(callback)
    let lastPromise = this._promises.shift()

    if (!lastPromise) {
      this._promises.push(this._callbacks.shift()())
    } else {
      let newPromise = lastPromise.then(this._callbacks.shift())
      this._promises.push(newPromise)
    }
	}

	completeCross() {
    let whiteEdges = grabber.getAllEdges().filter((edge) => {
      return getCubieColors(edge).includes('white')
    })

		whiteEdges.forEach((edge) => {
			this.chainPromise(() => {
        return this.solveWhiteEdge(edge)
      })
		})
	}

	solveWhiteEdge(cubie) {
    let relativeCubieFaces = getRelativeFacesOfCubie(cubie)

    if (relativeCubieFaces.white === 'u') {
      return this.solveWhiteEdgeOnWhiteFace(cubie, relativeCubieFaces)
    } else if (relativeCubieFaces.white === 'd') {
      return this.solveWhiteEdgeOnYellowFace(cubie, relativeCubieFaces)
    }

    let otherColor = Object.keys(relativeCubieFaces).find(color => color !== 'white')

    if (relativeCubieFaces[otherColor] === 'u' ||
        relativeCubieFaces[otherColor] === 'd') {
      return this.solveWhiteEdgeFacingOut(cubie, relativeCubieFaces)
    } else {
      // do some error catching sometime
      return this.solveWhiteEdgeOnMiddleLayer(cubie, relativeCubieFaces)
    }
	}

  /**
   * @param {object} cubie - An edge cubie with white as one color
   * @return {object}
   * @prop {string} object.edgeColor - The other color on this white edge
   * @prop {string} object.aligningMiddleColor - The color of the middle this edge alignes with
   * @prop {string} object.containingMiddleColor - The color of the middle that contians the white edge
   * @prop {number} object.aligningRelativeFace - The relative face of aligningMiddleColor
   * @prop {number} object.containingRelativeFace - The relative face of containingMiddleColor
   */

  solveWhiteEdgeOnWhiteFace(cubie, relativeCubieFaces) {
    let edgeColor = getCubieColors(cubie).find(color => color !== 'white')

    let relativeCurrentFace = relativeCubieFaces[edgeColor]
    let relativeTargetFace = this._cubeState[edgeColor]

    let targetDir = getRelativeDirection(relativeCurrentFace, relativeTargetFace)
    if (targetDir === 0) {
      return
    }

    let targetMove = 'u'
    if (targetDir === 1) targetMove += 'Prime'
    else if (targetDir === 2) targetMove += ' u'
    let reverseTargetMove = rubiksCube.reverseMove(targetMove)

    let hidingMove = relativeCurrentFace
    let reverseHidingMove = rubiksCube.reverseMove(relativeCurrentFace)

    let moves = `${hidingMove} ${reverseTargetMove} ${reverseHidingMove} ${targetMove}`
    return rubiksCube.move(moves)
  }

  solveWhiteEdgeOnYellowFace(cubie, relativeCubieFaces) {
    let edgeColor = getCubieColors(cubie).find(color => color !== 'white')

    let relativeCurrentFace = relativeCubieFaces[edgeColor]
    let relativeTargetFace = this._cubeState[edgeColor]
    let targetDir = getRelativeDirection(relativeCurrentFace, relativeTargetFace)

    let targetMove
    if (targetDir === 1) targetMove = 'd'
    else if (targetDir === -1) targetMove = 'dPrime'
    else if (targetDir === 2) targetMove = 'd d'
    else if (targetDir === 0) targetMove = ''

    let whiteEdgeToTopMove = `${relativeTargetFace} ${relativeTargetFace}`

    let moves = `${targetMove} ${whiteEdgeToTopMove}`
    return rubiksCube.move(moves)
  }

  solveWhiteEdgeFacingOut(cubie, relativeCubieFaces) {
    let edgeColor = getCubieColors(cubie).find(color => color !== 'white')

    let relativeCurrentFace = relativeCubieFaces.white
    let relativeTargetFace = this._cubeState[edgeColor]
    let targetDir = getRelativeDirection(relativeCurrentFace, relativeTargetFace)

    // by default, the first move (the move that aligns it with a non-white and
    // non-yellow color) aligns the cubie with the middle on the right
    let firstMove
    if (relativeCubieFaces[edgeColor] === 'u') {
      firstMove = relativeCurrentFace
    } else if (relativeCubieFaces[edgeColor] === 'd') {
      firstMove = rubiksCube.reverseMove(relativeCurrentFace)
    }

    // because of the default first move, the move that puts the white edge on
    // the top layer is 'r'
    let whiteEdgeToTopMove = getRelativeFace(relativeCurrentFace, 'r')
    if (targetDir === -1) {
      firstMove = rubiksCube.reverseMove(firstMove)
      whiteEdgeToTopMove = rubiksCube.reverseMove(getRelativeFace(relativeCurrentFace, 'l'))
    }

    let targetMove = ''
    if (targetDir === 0) targetMove = 'uPrime'
    if (targetDir === 2) targetMove = 'u'
    let reverseTargetMove = rubiksCube.reverseMove(targetMove)

    let moves = `${firstMove} ${targetMove} ${whiteEdgeToTopMove} ${reverseTargetMove}`

    // if cubie is on the bottom layer, it may mess up a correct one on top
    // to fix, just tack on the reverse of `firstMove` at the end
    if (relativeCubieFaces[edgeColor] === 'd' && targetDir !== 0) {
      moves += ` ${rubiksCube.reverseMove(firstMove)}`
    }

    return rubiksCube.move(moves)
  }

  solveWhiteEdgeOnMiddleLayer(cubie, relativeCubieFaces) {
    let edgeColor = getCubieColors(cubie).find(color => color !== 'white')

    let relativeCurrentFace = relativeCubieFaces[edgeColor]
    let relativeTargetFace = this._cubeState[edgeColor]
    let targetDir = getRelativeDirection(relativeCurrentFace, relativeTargetFace)

    let targetMove
    if (targetDir === 1) targetMove = 'uPrime'
    else if (targetDir === -1) targetMove = 'u'
    else if (targetDir === 0) targetMove = ''
    else if (targetDir === 2) targetMove = 'u u'

    let reverseTargetMove = rubiksCube.reverseMove(targetMove)

    // if the aligned face is to the right of the containing face, i.e. the edge
    // is to the right of the containing middle, the move to get the edge to the
    // white face is a clockwise rotation of `alignedFace`. otherwise it's a
    // counter-clockwise rotation of `alignedFace`
    let moveToWhiteFace
    let relativeDir = getRelativeDirection(relativeCubieFaces.white, relativeCubieFaces[edgeColor])
    if (relativeDir === 1) {
      moveToWhiteFace = relativeCubieFaces[edgeColor]
    } else if (relativeDir === -1) {
      moveToWhiteFace = rubiksCube.reverseMove(relativeCubieFaces[edgeColor])
    }

    let moves = `${reverseTargetMove} ${moveToWhiteFace} ${targetMove}`
    return rubiksCube.move(moves)
  }

  moveWhiteFaceToTop() {
    let whiteSide = this._cubeState.white
    let moves
    if (whiteSide === 'r') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('y')}`
    else if (whiteSide === 'l') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('n')}`
    else if (whiteSide === 'f') moves = `${keyMap.getNotation('y')}`
    else if (whiteSide === 'b') moves = `${keyMap.getNotation('n')}`
    else if (whiteSide === 'd') moves = `${keyMap.getNotation('y')} ${keyMap.getNotation('y')}`
    else return

    return rubiksCube.move(moves)
  }
}

export default new CrossSolver()
