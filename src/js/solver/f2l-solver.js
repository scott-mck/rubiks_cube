import rubiksCube from '../rubiks-cube'
import promiseChainer from '../utils/promise-chainer'
import { getColorString, getCubieColors } from '../utils/color'
import {
	getCubeState,
	getRelativeFace,
	getRelativeDirection,
	getRelativeFacesOfCubie
} from '../utils/relative-finder'

class F2LSolver {
  constructor() {}

  solve() {
		return new Promise(async (resolve) => {
			await rubiksCube.moveFaceToTop('yellow')
			this._cubeState = getCubeState()

			let corners = grabber.getAllCorners().filter((edge) => {
				return !getCubieColors(edge).includes('yellow')
			})
			let edges = grabber.getAllEdges().filter((edge) => {
				let colors = getCubieColors(edge)
				return !colors.includes('white') && !colors.includes('yellow')
			})

			corners.forEach((corner) => {
				let cornerColors = getCubieColors(corner).filter(color => color !== 'white')
				let edge = edges.find((edge) => {
					let edgeColors = getCubieColors(edge)
					return edgeColors.includes(cornerColors[0]) && edgeColors.includes(cornerColors[1])
				})
				promiseChainer.chain(() => this.solvePair(corner, edge))
			})

			promiseChainer.chain(resolve)
		})
  }

	cubieIsSolved(cubie) {
		let cubieData = getRelativeFacesOfCubie(cubie)
		let otherColors = getCubieColors(cubie).filter(color => color !== 'white')
		for (let color of otherColors) {
			if (cubieData[color] !== this._cubeState[color]) {
				return false
			}
		}
		return true
	}

	isMatched(corner, edge) {
		let isAttached = this.isAttached(corner, edge)
		let colors = getCubieColors(corner).filter(color => color !== 'white')
		let relativeCornerFaces = getRelativeFacesOfCubie(corner)
		let relativeEdgeFaces = getRelativeFacesOfCubie(edge)

		return isAttached &&
					 relativeCornerFaces[colors[0]] === relativeEdgeFaces[colors[0]] &&
					 relativeCornerFaces[colors[1]] === relativeEdgeFaces[colors[1]]
	}

	isAttached(corner, edge) {
		let whiteMesh = corner.children.find((color) => {
			return getColorString(color) === 'white'
		})
		let matrixWorld = whiteMesh.matrixWorld.clone()
		let globalPos = new THREE.Vector3().setFromMatrixPosition(matrixWorld)
		let shoot = globalPos.clone().sub(corner.position.clone()).negate().normalize()
		let raycaster = new THREE.Raycaster(globalPos, shoot)

		let intersects = raycaster.intersectObjects(scene.children)
		intersects = intersects.filter((data) => {
			return data.object !== corner
		})

		return intersects[0].object === edge
	}

	/**
	 * @return {object} data
	 * @prop {object} cornerData - The relative faces map of the corner
	 * @prop {object} edgeData - The relative faces map of the edge
	 * @prop {string} primaryColor - The edge color that isn't on the yellow face.
	 * @prop {string} secondaryColor - The edge color that is on the yellow face.
	 * @prop {string} relativeLeft - The face that is on the left (e.g. 'b')
	 * @prop {string} relativeRight - The face that is on the right (e.g. 'r')
	 */
	getData(corner, edge) {
		let cornerData = getRelativeFacesOfCubie(corner)
		let edgeData = getRelativeFacesOfCubie(edge)

		let colors = Object.keys(edgeData)
		edgeData[colors[0]] === 'u' ? colors : colors.reverse()
		let [secondaryColor, primaryColor] = colors

		let relativeFaces = Object.values(cornerData).filter(face => face !== 'd')
		let inOrder = getRelativeFace(relativeFaces[0], relativeFaces[1]) === 'r'
		let [relativeLeft, relativeRight] = inOrder ? relativeFaces : relativeFaces.reverse()

		return { cornerData, edgeData, primaryColor, secondaryColor, relativeLeft, relativeRight }
	}

	/**
	 * @param {object} corner - The corner to be solved.
	 * @param {object} edge - The associated edge that matches the corner.
	 */
	solvePair(corner, edge) {
		// let data = this.getData(corner, edge)
		this._data = this.getData(corner, edge)

		for (let color of Object.keys(this._data.cornerData)) {
			if (this._data.cornerData[color] === 'd') {
				return this.solveCornerOnWhiteLayer(corner, edge)
			}
		}
	}

	async solveCornerOnWhiteLayer(corner, edge) {
		let isSolved = this.cubieIsSolved(corner)
		let isMatched = this.isMatched(corner, edge)
		let isAttached = this.isAttached(corner, edge)

		if (isSolved && isMatched) {
			return Promise.resolve()
		} else if (isSolved && isAttached) {
			return Promise.resolve()
			// await this.releaseEdge(edge, edgeData)
			// return this.solveCorner(corner, edge)
		}

		await this.matchCornerOnWhiteLayerWithEdge(corner, edge)
	}

	async matchCornerOnWhiteFaceWithEdge(corner, edge) {
		let cornerPrimaryFace = this._data.cornerData[this._data.primaryColor]
		let cornerSecondaryFace = this._data.cornerData[this._data.secondaryColor]
		let currentEdgeFace = this._data.edgeData[this._data.primaryColor]

		let r = (arg) => rubiksCube.reverseMove(arg)
		let isLeftFace = cornerPrimaryFace === this._data.relativeLeft

		let relativePrepFace = getRelativeFace(cornerPrimaryFace, isLeftFace ? 'l' : 'r')
		let cornerToTopMove = isLeftFace ? cornerSecondaryFace : r(cornerSecondaryFace)
		let topLayerMove = isLeftFace ? 'uPrime' : 'u'

		let prepMove = this._getDirectionToFace(currentEdgeFace, relativePrepFace, 'u')

		let moves = `${prepMove} ${cornerToTopMove} ${topLayerMove} ${r(cornerToTopMove)}`
		await rubiksCube.move(moves)

		// need to update once moves are made
		this._cubeState = getCubeState()
		this._data = this.getData(corner, edge)
		return this.solveMatchedPair(corner, edge)
	}

	async matchCornerOnWhiteLayerWithEdge(corner, edge) {
		let cornerWhiteFace = this._data.cornerData.white
		let currentEdgeFace = this._data.edgeData[this._data.primaryColor]

		if (cornerWhiteFace === 'd') {
			return this.matchCornerOnWhiteFaceWithEdge(corner, edge)
		}

		let r = (arg) => rubiksCube.reverseMove(arg)

		// get cornerToTopMove and topLayerMove
		let cornerToTopMove = this._data.cornerData.white
		let isLeft = cornerToTopMove === this._data.relativeLeft
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		// get the prep face
		let colorOnWhite = Object.keys(this._data.cornerData).find((color) => {
			return this._data.cornerData[color] === 'd'
		})
		let willMatch = colorOnWhite === this._data.primaryColor
		let relativePrepFace = willMatch ? getRelativeFace(cornerToTopMove, isLeft ? 'r' : 'l') : cornerToTopMove
		let prepMove = this._getDirectionToFace(currentEdgeFace, relativePrepFace, 'u')

		cornerToTopMove = isLeft ? 	r(cornerToTopMove) : cornerToTopMove
		let moves = `${prepMove} ${cornerToTopMove} ${topLayerMove} ${r(cornerToTopMove)}`
		await rubiksCube.move(moves)

		this._cubeState = getCubeState()
		this._data = this.getData(corner, edge)
		return willMatch ? this.solveMatchedPair(corner, edge) : this.solveSeparatedPair(corner, edge)
	}

	/**
	 * Assumes the edge is adjacent to the corner, with both colors matching up.
	 */
	solveMatchedPair(corner, edge) {
		let r = (arg) => rubiksCube.reverseMove(arg)

		let targetFace = this._cubeState[this._data.primaryColor]
		let secondaryFace = this._cubeState[this._data.secondaryColor]

		let isLeft = getRelativeFace(secondaryFace, 'l') === targetFace
		let openingMove = isLeft ? r(targetFace) : targetFace
		let topLayerMove = isLeft ? 'u' : 'uPrime'

		let currentEdgeFace = this._data.edgeData[this._data.primaryColor]
		let prepMove = this._getDirectionToFace(currentEdgeFace, secondaryFace, 'u')

		let moves = `${prepMove} ${openingMove} ${topLayerMove} ${r(openingMove)}`
		return rubiksCube.move(moves)
	}

	solveSeparatedPair(corner, edge) {
		let r = (arg) => rubiksCube.reverseMove(arg)

		let targetFace = this._cubeState[this._data.primaryColor]
		let secondaryFace = this._cubeState[this._data.secondaryColor]

		let isLeft = getRelativeFace(secondaryFace, 'l') === targetFace
		let topLayerMove = isLeft ? 'uPrime' : 'u'
		let openingMove = isLeft ? r(targetFace) : targetFace

		let cornerColor = this._data.cornerData[this._data.secondaryColor]
		let prepMove = this._getDirectionToFace(cornerColor, secondaryFace, 'u')

		let moves = `${prepMove} ${openingMove} ${topLayerMove} ${r(openingMove)}`
		return rubiksCube.move(moves)
	}

	releaseEdge(edge, edgeData) {
		let edgeColors = getCubieColors(edge)
		let relativeFaces = Object.values(edgeData)

		// out of the two relative faces the edge belongs to, only a clockwise
		// rotation of the one on the right will move the edge to the yellow face
		let releaseMove
		for (let color of edgeColors) {
			let rightRelativeFace = getRelativeFace(edgeData[color], 'r')
			if (relativeFaces.includes(rightRelativeFace)) {
				releaseMove = rightRelativeFace
				break
			}
		}

		let moves = `${releaseMove} u ${rubiksCube.reverseMove(releaseMove)}`
		return rubiksCube.move(moves)
	}

	/**
	 * Helper method. Finds the relative direction to the target face and returns
	 * the correct moves based on `moveFace`.
	 * @param {string} fromFace - The relative from face.
	 * @param {string} toFace - The relative to face.
	 * @param {string} moveStr - The base move to return.
	 */
	_getDirectionToFace(fromFace, toFace, moveFace) {
		let dirToTargetFace = getRelativeDirection(fromFace, toFace)
		if (dirToTargetFace === 1) return `${moveFace}Prime`
		if (dirToTargetFace === -1) return `${moveFace}`
		if (dirToTargetFace === 0) return ``
		if (dirToTargetFace === 2) return `${moveFace} ${moveFace}`
	}
}

export default new F2LSolver()
