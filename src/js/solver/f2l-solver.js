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
				promiseChainer.chain(() => this.solveCorner(corner, edge))
			})

			promiseChainer.chain(resolve)
		})
  }

	cubieIsSolved(cubie, cubieData) {
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

	getData(corner, edge) {
		let cornerData = getRelativeFacesOfCubie(corner)
		let edgeData = getRelativeFacesOfCubie(edge)

		// relativeLeftFace, relativeRightFace, primaryColor, secondaryColor
		let primaryColor, secondaryColor
		for (let color of Object.keys(edgeData)) {
			if (edgeData[color] !== 'u') {
				primaryColor = color
			} else {
				secondaryColor = color
			}
		}

		let relativeFaces = Object.values(cornerData).filter(face => face !== 'd')
		let inOrder = getRelativeFace(relativeFaces[0], relativeFaces[1]) === 'r'
		let [relativeLeft, relativeRight] = inOrder ? relativeFaces : relativeFaces.reverse()

		return { cornerData, edgeData, primaryColor, secondaryColor, relativeLeft, relativeRight }
	}

	/**
	 * @param {object} corner - The corner to be solved.
	 * @param {object} edge - The associated edge that matches the corner.
	 */
	solveCorner(corner, edge) {
		let data = this.getData(corner, edge)

		for (let color of Object.keys(data.cornerData)) {
			if (data.cornerData[color] === 'd') {
				return this.solveCornerOnWhiteLayer(corner, edge, data)
			}
		}
	}

	async solveCornerOnWhiteLayer(corner, edge, data) {
		let isSolved = this.cubieIsSolved(corner, data.cornerData)
		let isMatched = this.isMatched(corner, edge)
		let isAttached = this.isAttached(corner, edge)

		if (isSolved && isMatched) {
			return Promise.resolve()
		} else if (isSolved && isAttached) {
			return Promise.resolve()
			// await this.releaseEdge(edge, edgeData)
			// return this.solveCorner(corner, edge)
		}

		await this.matchCornerOnWhiteLayerWithEdge(corner, edge, data)
	}

	/**
	 * @param {object} data
	 * @prop {string} primaryColor - The edge color that isn't on the yellow face.
	 * @prop {string} secondaryColor - The edge color that is on the yellow face.
	 * @prop {string} relativeLeft - The face that is on the left (e.g. 'b')
	 * @prop {string} relativeRight - The face that is on the right (e.g. 'r')
	 * @prop {object} cornerData - The relative faces map of the corner
	 * @prop {object} edgeData - The relative faces map of the edge
	 */
	async matchCornerOnWhiteFaceWithEdge(corner, edge, data) {
		let relativePrepFace, topLayerMove, cornerToTopMove
		if (data.cornerData[data.primaryColor] === data.relativeLeft) {
			relativePrepFace = getRelativeFace(data.cornerData[data.primaryColor], 'l')
			topLayerMove = 'uPrime'
			cornerToTopMove = data.cornerData[data.secondaryColor]
		} else {
			relativePrepFace = getRelativeFace(data.cornerData[data.primaryColor], 'r')
			topLayerMove = 'u'
			cornerToTopMove = rubiksCube.reverseMove(data.cornerData[data.secondaryColor])
		}

		let dirToPrepFace = getRelativeDirection(data.edgeData[data.primaryColor], relativePrepFace)
		let prepMove
		if (dirToPrepFace === 1) prepMove = 'uPrime'
		if (dirToPrepFace === -1) prepMove = 'u'
		if (dirToPrepFace === 0) prepMove = ''
		if (dirToPrepFace === 2) prepMove = 'u u'

		let r = (arg) => rubiksCube.reverseMove(arg)

		let moves = `${prepMove} ${cornerToTopMove} ${topLayerMove} ${r(cornerToTopMove)}`
		await rubiksCube.move(moves)

		// need to update once moves are made
		this._cubeState = getCubeState()
		let updatedData = this.getData(corner, edge)
		return this.solveMatchedPair(corner, edge, updatedData)
	}

	async matchCornerOnWhiteLayerWithEdge(corner, edge, data) {
		if (data.cornerData.white === 'd') {
			return this.matchCornerOnWhiteFaceWithEdge(corner, edge, data)
		}

		let relativePrepFace, prepMove, cornerToTopMove, topLayerMove

		// relative prep face
		let colorOnWhite = Object.keys(data.cornerData).find(color => data.cornerData[color] === 'd')
		let willMatch = colorOnWhite === data.primaryColor
		relativePrepFace = willMatch ? data.cornerData[data.secondaryColor] : data.cornerData.white

		// corner to top move, top layer move
		cornerToTopMove = data.cornerData.white
		if (cornerToTopMove === data.relativeLeft) {
			cornerToTopMove = rubiksCube.reverseMove(cornerToTopMove)
			topLayerMove = 'uPrime'
		} else {
			topLayerMove = 'u'
		}

		// prep move
		let targetDir = getRelativeDirection(data.edgeData[data.primaryColor], relativePrepFace)
		prepMove
		if (targetDir === 1) prepMove = 'uPrime'
		if (targetDir === -1) prepMove = 'u'
		if (targetDir === 2) prepMove = 'u u'
		if (targetDir === 0) prepMove = ''

		let r = (arg) => rubiksCube.reverseMove(arg)
		let moves = `${prepMove} ${cornerToTopMove} ${topLayerMove} ${r(cornerToTopMove)}`
		await rubiksCube.move(moves)

		this._cubeState = getCubeState()
		let updatedData = this.getData(corner, edge)
		this.solveSeparatedPair(corner, edge, updatedData)
	}

	/**
	 * Assumes the edge is adjacent to the corner, with both colors matching up.
	 */
	solveMatchedPair(corner, edge, data) {
		let prepFace
		let prepMove, openingMove, topLayerMove

		let targetFace = this._cubeState[data.primaryColor]
		let secondaryFace = this._cubeState[data.secondaryColor]

		prepFace = secondaryFace
		openingMove = this._cubeState[data.primaryColor]

		if (getRelativeFace(secondaryFace, targetFace) === 'r') {
			topLayerMove = 'uPrime'
		} else {
			openingMove = rubiksCube.reverseMove(openingMove)
			topLayerMove = 'u'
		}

		let dirToPrepFace = getRelativeDirection(data.edgeData[data.primaryColor], prepFace)
		if (dirToPrepFace === 1) prepMove = 'uPrime'
		if (dirToPrepFace === -1) prepMove = 'u'
		if (dirToPrepFace === 0) prepMove = ''
		if (dirToPrepFace === 2) prepMove = 'u u'

		let r = (arg) => rubiksCube.reverseMove(arg)

		let moves = `${prepMove} ${openingMove} ${topLayerMove} ${r(openingMove)}`
		return rubiksCube.move(moves)
	}

	solveSeparatedPair(corner, edge, data) {
		let prepFace
		let prepMove, openingMove, topLayerMove

		let targetFace = this._cubeState[data.primaryColor]
		let secondaryFace = this._cubeState[data.secondaryColor]

		prepFace = secondaryFace
		openingMove = this._cubeState[data.primaryColor]

		if (getRelativeFace(secondaryFace, targetFace) === 'r') {
			topLayerMove = 'u'
		} else {
			openingMove = rubiksCube.reverseMove(openingMove)
			topLayerMove = 'uPrime'
		}

		let dirToPrepFace = getRelativeDirection(data.cornerData[data.secondaryColor], prepFace)
		if (dirToPrepFace === 1) prepMove = 'uPrime'
		if (dirToPrepFace === -1) prepMove = 'u'
		if (dirToPrepFace === 0) prepMove = ''
		if (dirToPrepFace === 2) prepMove = 'u u'

		let r = (arg) => rubiksCube.reverseMove(arg)

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
}

export default new F2LSolver()
