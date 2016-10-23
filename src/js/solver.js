import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import grabber from './grabber'
import scene from './scene'
import g from './globals'
import keyMap from './key-map'
import { vectorFromString } from './utils/vector'
import { getColorString, getCubieColors } from './utils/color'

class Solver {
  constructor() {
    this._relativeDirections = {
      r: { b: 1, f: -1, l: 2, r: 0 },
      f: { r: 1, l: -1, b: 2, f: 0 },
      l: { f: 1, b: -1, r: 2, l: 0 },
      b: { l: 1, r: -1, f: 2, b: 0 }
    }
    this._relativeFaces = {
      r: { r: 'b', l: 'f', b: 'l' },
      f: { r: 'r', l: 'l', b: 'b' },
      l: { r: 'f', l: 'b', b: 'r' },
      b: { r: 'l', l: 'r', b: 'f' }
    }
		this._callbacks = []
		this._promises = []
  }

	async solve() {
		await this.moveWhiteFaceToTop()
		this.completeCross()
	}

  getRelativeDirection(fromFace, toFace) {
    return this._relativeDirections[fromFace][toFace]
  }

  getRelativeFace(fromFace, dir) {
    return this._relativeFaces[fromFace][dir]
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
		let whiteEdges = this.findAllWhiteEdges()

		whiteEdges.forEach((edge) => {
			this.chainPromise(() => {
        return this.solveWhiteEdge(edge)
      })
		})
	}

	solveWhiteEdge(cubie) {
    let cubieData = this.getDataForWhiteEdge(cubie)
    if (cubieData.containingMiddleColor === 'white') {
      // return this.solveWhiteEdgeOnWhiteFace(cubie, cubieData)
    } else if (cubieData.containingMiddleColor === 'yellow') {
      return this.solveWhiteEdgeOnYellowFace(cubie, cubieData)
    } else if (cubieData.alignedMiddleColor === 'white' ||
               cubieData.alignedMiddleColor === 'yellow') {
     return this.solveWhiteEdgeFacingOut(cubie, cubieData)
   } else {
     // do some error catching sometime
    //  return this.solveWhiteEdgeOnMiddleLayer(cubie, cubieData)
   }
	}

  /**
   * @param {object} cubie - An edge cubie with white as one color
   * @return {object}
   * @prop {string} object.edgeColor - The other color on this white edge
   * @prop {string} object.alignedMiddleColor - The color of the middle this edge alignes with
   * @prop {string} object.containingMiddleColor - The color of the middle that contians the white edge
   * @prop {number} object.alignedRelativeFace - The relative face of alignedMiddleColor
   * @prop {number} object.containingRelativeFace - The relative face of containingMiddleColor
   */
  getDataForWhiteEdge(cubie) {
    let edgeColor = getCubieColors(cubie).find(color => color !== 'white')

    let alignedMiddleColor = getColorString(this.findMiddleWhiteEdgeSitsOn(cubie))
    let containingMiddleColor = getColorString(this.findMiddleWhiteEdgeSitsOn(cubie, true))

    let alignedRelativeFace = this.findMiddleOfColor(alignedMiddleColor, true)
    let containingRelativeFace = this.findMiddleOfColor(containingMiddleColor, true)

    return { edgeColor, alignedMiddleColor, containingMiddleColor, alignedRelativeFace, containingRelativeFace }
  }

  solveWhiteEdgeOnYellowFace(cubie, cubieData) {
    let targetMiddle = this.findMiddleOfColor(cubieData.edgeColor, true)
    let targetDir = this.getRelativeDirection(cubieData.alignedRelativeFace, targetMiddle)

    let targetMove
    if (targetDir === 1) targetMove = 'd'
    else if (targetDir === -1) targetMove = 'dPrime'
    else if (targetDir === 2) targetMove = 'd d'
    else if (targetDir === 0) targetMove = ''

    let whiteEdgeToTopMove = `${targetMiddle} ${targetMiddle}`

    let moves = `${targetMove} ${whiteEdgeToTopMove}`
    return rubiksCube.move(moves)
  }

  solveWhiteEdgeOnWhiteFace(cubie, cubieData) {
    let currentFace = cubieData.alignedRelativeFace
    let targetFace = this.findMiddleOfColor(cubieData.edgeColor, true)

    let targetDir = this.getRelativeDirection(currentFace, targetFace)
    if (targetDir === 0) {
      return
    }

    // find the direction cubie needs to go to end up on the correct face
    let targetMove = 'u'
    if (targetDir === 1) targetMove += 'Prime'
    else if (targetDir === 2) targetMove += ' u'
    let reverseTargetMove = rubiksCube.reverseMove(targetMove)

    // "hide" this edge, then rotate the white face so other solved edges are
    // correct relative to this edge, "unhide" this edge, then re-align all edges
    let hidingMove = currentFace
    let reverseHidingMove = rubiksCube.reverseMove(currentFace)

    let moves = `${hidingMove} ${reverseTargetMove} ${reverseHidingMove} ${targetMove} ${hidingMove}`
    return rubiksCube.move(moves)
  }

  solveWhiteEdgeOnMiddleLayer(cubie, cubieData) {
    let targetFace = this.findMiddleOfColor(cubieData.edgeColor, true)
    let targetDir = this.getRelativeDirection(cubieData.alignedRelativeFace, targetFace)

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
    let relativeDir = this.getRelativeDirection(cubieData.containingRelativeFace, cubieData.alignedRelativeFace)
    if (relativeDir === 1) {
      moveToWhiteFace = cubieData.alignedRelativeFace
    } else if (relativeDir === -1) {
      moveToWhiteFace = rubiksCube.reverseMove(cubieData.alignedRelativeFace)
    }

    let moves = `${reverseTargetMove} ${moveToWhiteFace} ${targetMove}`
    return rubiksCube.move(moves)
  }

  findMiddleWhiteEdgeSitsOn(cubie, adjacent = false) {
    // if adjacent, do not shoot through white color
    let test = (color, white) => adjacent ? color !== white : color === white

    let whiteColor = cubie.children.find(color => {
      return test(getColorString(color), 'white')
    })
    let globalColorPos = this.getGlobalPosition(whiteColor)
    let shootDir = globalColorPos.clone().sub(cubie.position.clone()).normalize().negate()

    let raycaster = new THREE.Raycaster(globalColorPos, shootDir)
    let intersects = grabber.raycast(raycaster).filter(intersect => intersect !== cubie)

    return intersects[0]
  }

  solveWhiteEdgeFacingOut(cubie, cubieData) {
    // let currentFace = this.findMiddleOfColor(cubieData.containingMiddleColor, true)
    let currentFace = cubieData.containingRelativeFace
    let targetFace = this.findMiddleOfColor(cubieData.edgeColor, true)
    let targetDir = this.getRelativeDirection(currentFace, targetFace)

    // by default, the first move (the move that aligns it with a not-white and
    // no-yellow color) aligns the cubie with the middle on the right
    let firstMove
    if (cubieData.alignedMiddleColor === 'white') {
      firstMove = currentFace // clockwise if cubie is on top layer
    } else if (cubieData.alignedMiddleColor === 'yellow') {
      firstMove = rubiksCube.reverseMove(currentFace) // counter-clockwise if cubie is on bottom layer
    }

    // because of the default first move, the move that puts the white edge on
    // the top layer is 'r'
    let whiteEdgeToTopMove = this.getRelativeFace(currentFace, 'r')
    if (targetDir === -1) {
      firstMove = rubiksCube.reverseMove(firstMove)
      whiteEdgeToTopMove = this.getRelativeFace(currentFace, 'l')
      whiteEdgeToTopMove = rubiksCube.reverseMove(whiteEdgeToTopMove)
    }

    let targetMove = ''
    if (targetDir === 0) targetMove = 'uPrime'
    if (targetDir === 2) targetMove = 'u'
    let reverseTargetMove = rubiksCube.reverseMove(targetMove)

    let moves = `${firstMove} ${targetMove} ${whiteEdgeToTopMove} ${reverseTargetMove}`
    return rubiksCube.move(moves)
  }

	findAllWhiteEdges() {
		let edges = []
		// ordered by top, right, bottom, left
		let startCoords = [
			// first half are vertical
      new THREE.Vector3(0, g.startPos + g.cubieSize, -g.startPos),
      new THREE.Vector3(g.startPos, g.startPos + g.cubieSize, 0),
      new THREE.Vector3(0, g.startPos + g.cubieSize, g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos + g.cubieSize, 0),
			// first half are horizontal
			new THREE.Vector3(0, g.startPos, g.startPos + g.cubieSize),
			new THREE.Vector3(g.startPos, 0, g.startPos + g.cubieSize),
			new THREE.Vector3(0, -g.startPos, g.startPos + g.cubieSize),
			new THREE.Vector3(-g.startPos, 0, g.startPos + g.cubieSize)
		]

		let shootDirs = [
			new THREE.Vector3(0, -1, 0),
			new THREE.Vector3(0, 0, -1)
		]

		let shootDir = shootDirs.shift()
		for (let startCoord of startCoords) {
			if (startCoords.indexOf(startCoord) === startCoords.length / 2) {
				shootDir = shootDirs.shift()
			}

			let raycaster = new THREE.Raycaster(startCoord, shootDir)
			let intersects = grabber.raycast(raycaster)

			// only the first and last cubes will be edges
			let possibleEdges = [intersects[0], intersects[intersects.length - 1]]
			possibleEdges.forEach((cubie) => {
				if (getCubieColors(cubie).includes('white') && !edges.includes(cubie)) {
					edges.push(cubie)
				}
			})
		}

		return edges
	}

  moveWhiteFaceToTop() {
    let whiteSide = this.findMiddleOfColor('white', true)
    let moves
    if (whiteSide === 'r') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('y')}`
    else if (whiteSide === 'l') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('n')}`
    else if (whiteSide === 'f') moves = `${keyMap.getNotation('y')}`
    else if (whiteSide === 'b') moves = `${keyMap.getNotation('n')}`
    else if (whiteSide === 'd') moves = `${keyMap.getNotation('y')} ${keyMap.getNotation('y')}`
    else return

    return rubiksCube.move(moves)
  }

  findMiddleOfColor(middleColor, returnRelative) {
    let middles = this.getAllMiddles()
    let found = Object.values(middles).find(middle => getColorString(middle.children[0]) === middleColor)
    if (!returnRelative) {
      return found
    }

    return Object.keys(middles).find(key => middles[key] === found)
  }

  getAllMiddles() {
    let middles = {}
    let faces = {
      r: new THREE.Vector3(g.startPos, 0, 0),
      l: new THREE.Vector3(-g.startPos, 0, 0),
      u: new THREE.Vector3(0, g.startPos, 0),
      d: new THREE.Vector3(0, -g.startPos, 0),
      f: new THREE.Vector3(0, 0, g.startPos),
      b: new THREE.Vector3(0, 0, -g.startPos)
    }

    for (let face of Object.keys(faces)) {
      middles[face] = grabber.getObjectByPosition(faces[face])
    }

    return middles
  }
}

export default Solver
