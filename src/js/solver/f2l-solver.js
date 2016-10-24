import rubiksCube from '../rubiks-cube'
import promiseChainer from '../utils/promise-chainer'
import { getCubieColors } from '../utils/color'
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

	cornerIsSolved(corner, cornerData) {
		let otherColors = getCubieColors(corner).filter(color => color !== 'white')
		for (let color of otherColors) {
			if (cornerData[color] !== this._cubeState[color]) {
				return false
			}
		}
		return true
	}

	isAttached(corner, edge) {
		let whiteMesh = corner.children.find((color) => {
			return getColorString(color) === 'white'
		})
		let matrixWolrd = whiteMesh.matrixWorld.clone()
		let globalPos new THREE.Vector3().setFromMatrixPosition(matrixWorld)
		let raycaster = new THREE.Raycaster(globalPos, globalPos.clone().sub(corner.position.clone()))

		let intersects = raycaster.intersectObjects(scene.children).filter((data) => {
			return data.object !== corner
		})

		return intersects[0].object === edge
	}

	/**
	 * @param {object} corner - The corner to be solved.
	 * @param {object} edge - The associated edge that matches the corner.
	 */
	solveCorner(corner, edge) {
		let cornerData = getRelativeFacesOfCubie(corner)
		let edgeData = getRelativeFacesOfCubie(edge)

		let isAttached = this.isAttached(corner, edge)

		return isAttached

		if (this.cornerIsSolved(corner, cornerData)) {
			return this.solveEdge(edge, edgeData)
		}

		if (cornerData.white === 'd') {
			return this.solveCornerOnWhiteFace(corner, cornerData, edge, edgeData)
		}
	}

	async solveEdge(edge, edgeData) {
		// if the edge is stuck on the middle layer, release it
		// need to recalculate edgeData because its position changed
		if (!Object.values(edgeData).includes('u')) {
			await this.releaseEdge(edge, edgeData)
			edgeData = getRelativeFacesOfCubie(edge)
		}

		let targetColor, secondaryColor
		for (let color of Object.keys(edgeData)) {
			if (edgeData[color] !== 'u') {
				targetColor = color
			} else {
				secondaryColor = color
			}
		}

		let prepFace = getRelativeFace(this._cubeState[secondaryColor], 'b')
		let targetDir = getRelativeDirection(edgeData[targetColor], prepFace)

		let prepMove
		if (targetDir === 1) prepMove = 'uPrime'
		if (targetDir === -1) prepMove = 'u'
		if (targetDir === 2) prepMove = 'u u'
		if (targetDir === 0) prepMove = ''

		// matching the corner with the edge
		let moveSet1 = this._cubeState[secondaryColor]
		let moveSet2 = this._cubeState[targetColor]

		let adjustingMove
		let secondaryToTargetDir = getRelativeDirection(moveSet1, moveSet2)
		if (secondaryToTargetDir === 1) {
			moveSet1 = rubiksCube.reverseMove(moveSet1)
			adjustingMove = 'u'
		} else {
			moveSet2 = rubiksCube.reverseMove(moveSet2)
			adjustingMove = 'uPrime'
		}

		let r = (arg) => rubiksCube.reverseMove(arg)

		let moves = `${prepMove} ${moveSet1} ${adjustingMove} ${r(moveSet1)} `
		moves += `${adjustingMove} ${moveSet2} ${r(adjustingMove)} ${r(moveSet2)}`
		return rubiksCube.move(moves)
	}

	async solveCornerOnWhiteFace(corner, cornerData, edge, edgeData) {
		// if the edge is stuck on the middle layer, release it
		if (!Object.values(edgeData).includes('u')) {
			await this.releaseEdge(edge, edgeData)
		}
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
