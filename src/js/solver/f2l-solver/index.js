import THREE from 'three'
import rubiksCube from '../../rubiks-cube'
import grabber from '../../grabber'
import scene from '../../scene'
import g from '../../globals'
import cornerAndEdgeInSlotSolver from './corner-and-edge-in-slot'
import cornerAndEdgeOnTopSolver from './corner-and-edge-on-top-solver'
import cornerOnBottomEdgeOnTopSolver from './corner-on-bottom-edge-on-top-solver'
import cornerOnTopEdgeInMiddleSolver from './corner-on-top-edge-in-middle-solver'
import { getColorString, getCubieColors } from '../../utils/color'
import {
	getCubeState,
	getRelativeFace,
	getRelativeDirection,
	getRelativeFacesOfCubie
} from '../../utils/relative-finder'

const R = (move) => rubiksCube.reverseMove(move)

class F2LSolver {
  async solve() {
		await rubiksCube.moveFaceToTop('yellow')

		let corners = grabber.getAllCorners().filter((edge) => {
			return !getCubieColors(edge).includes('yellow')
		})

		let edges = grabber.getAllEdges().filter((edge) => {
			let colors = getCubieColors(edge)
			return !colors.includes('white') && !colors.includes('yellow')
		})

		let promise = Promise.resolve()
		for (let corner of corners) {
			let cornerColors = getCubieColors(corner).filter(color => color !== 'white')
			let edge = edges.find((edge) => {
				let edgeColors = getCubieColors(edge)
				return edgeColors.includes(cornerColors[0]) && edgeColors.includes(cornerColors[1])
			})

			promise = promise.then(() => this.solvePair(corner, edge))
		}

		return promise
  }

	isMatched(corner, edge) {
		let isAttached = this.isAttached(corner, edge)
		let colors = getCubieColors(corner).filter(color => color !== 'white')
		let cornerFaces = getRelativeFacesOfCubie(corner)
		let edgeFaces = getRelativeFacesOfCubie(edge)

		return isAttached &&
					 cornerFaces.color[colors[0]] === edgeFaces.color[colors[0]] &&
					 cornerFaces.color[colors[1]] === edgeFaces.color[colors[1]]
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

		if (!intersects[0]) {
			return false
		}
		return intersects[0].object === edge
	}

	_updateState(corner, edge) {
		this._data = this.getData(corner, edge)
	}

	/**
	 * @return {object} data
	 * @prop {object} data.corner.color - A map in the form of [color]: [relativeFace]
	 * @prop {object} data.corner.face - A map in the form of [relativeFace]: [color]
	 * @prop {object} data.corner.left - Holds the color and face of the "left" side of the corner
	 * @prop {object} data.corner.right - Holds the color and face of the "right" side of the corner
	 * @prop {object} data.edge.color - A map in the form of [color]: [relativeFace]
	 * @prop {object} data.edge.face - A map in the form of [relativeFace]: [color]
	 * @prop {object} data.edge.primary - Holds color and face of the "primary" side of the edge
	 * @prop {object} data.edge.secondary - Holds color and face of the "secondary" side of the edge
	 * @prop {object} data.cube - The cube state
	 */
	getData(corner, edge) {
		return {
			corner: this.getCornerData(corner),
			edge: this.getEdgeData(edge),
			cube: getCubeState()
		}
	}

	getCornerData(corner) {
		// get corner data - color map + face map, relativeLeft, relativeRight
		let cornerData = getRelativeFacesOfCubie(corner)
		let faces = Object.keys(cornerData.face).filter(face => !['u', 'd'].includes(face))
		let firstIsLeft = getRelativeFace(faces[0], 'r') === faces[1]
		let [leftFace, rightFace] = firstIsLeft ? faces : faces.reverse()

		let left = { color: cornerData.face[leftFace], face: leftFace }
		let right = { color: cornerData.face[rightFace], face: rightFace }

		return Object.assign(cornerData, { left, right })
	}

	getEdgeData(edge) {
		// get edge data - color map + face map, primary, secondary
		let edgeData = getRelativeFacesOfCubie(edge)
		let primaryColor, secondaryColor
		if (edgeData.face.u) {
			secondaryColor = edgeData.face.u
			primaryColor = Object.keys(edgeData.color).find(color => color !== secondaryColor)
		} else {
			let colors = getCubieColors(edge)
			let firstIsLeft = getRelativeFace(edgeData.color[colors[0]], 'r') === edgeData.color[colors[1]]; // semi-colon: important!
			[secondaryColor, primaryColor] = firstIsLeft ? colors : colors.reverse()
		}
		let primary = { color: primaryColor, face: edgeData.color[primaryColor] }
		let secondary = { color: secondaryColor, face: edgeData.color[secondaryColor] }

		return Object.assign(edgeData, { primary, secondary })
	}

	/**
	 * There are 5 top-level cases:
	 * 1) Both corner and edge are in a "slot"
	 * 2) Corner is on bottom and edge is in middle
	 * 3) Corner is on bottom and edge is on top
	 * 4) Corner is on top and edge is in middle
	 * 5) Both corner and edge are in the top face
	 *
	 * @param {object} corner - The corner to be solved.
	 * @param {object} edge - The associated edge that matches the corner.
	 */
	async solvePair(corner, edge) {
		let gStartPos = ~~g.startPos

		if (~~corner.position.x === ~~edge.position.x &&
			  ~~corner.position.z === ~~edge.position.z &&
				~~corner.position.y === -gStartPos) {
			return cornerAndEdgeInSlotSolver.solve(corner, edge)
		}
		if (~~corner.position.y === -gStartPos && ~~edge.position.y === 0) {
			await this.releaseEdge(edge)
			return cornerOnBottomEdgeOnTopSolver.solve(corner, edge)
		}
		if (~~corner.position.y === -gStartPos && ~~edge.position.y === gStartPos) {
			return cornerOnBottomEdgeOnTopSolver.solve(corner, edge)
		}
		if (~~corner.position.y === gStartPos && ~~edge.position.y === 0) {
			return cornerOnTopEdgeInMiddleSolver.solve(corner, edge)
		}
		if (~~corner.position.y === gStartPos && ~~edge.position.y === gStartPos) {
			return cornerAndEdgeOnTopSolver.solve(corner, edge)
		}
	}

	/**
	 * Assumes both the corner and edge are "matched" on the top layer
	 */
	async solveMatchedPair(corner, edge) {
		let data = this.getData(corner, edge)

		let isLeft = data.corner.left.color === 'white'
		let currentFace = data.edge.primary.face
		let targetFace = data.cube.color[data.edge.secondary.color]

		let prepMove = this.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = this.getData(corner, edge)

		let targetColor = data.edge.primary.color
		let openingMove = isLeft ? data.cube.color[targetColor] : R(data.cube.color[targetColor])
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		let moves = `${openingMove} ${topLayerMove} ${R(openingMove)}`
		return rubiksCube.move(moves)
	}

	/**
	 * Assumes both the corner and edge are "separated" on the top layer
	 */
	async solveSeparatedPair(corner, edge) {
		let data = this.getData(corner, edge)
		let isLeft = data.corner.left.color === 'white'
		let prepFace = data.cube.color[data.edge.primary.color]

		let prepMove = this.getDirectionToFace(data.corner.color.white, prepFace, 'u')
		await rubiksCube.move(prepMove)

		data = this.getData(corner, edge)
		let matchingMove = isLeft ? R(data.corner.color.white) : data.corner.color.white
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		let moves = `${matchingMove} ${topLayerMove} ${R(matchingMove)}`
		return rubiksCube.move(moves)
	}

	releaseEdge(edge) {
		let data = this.getEdgeData(edge)
		let edgeToTop = data.primary.face

		let moves = `${edgeToTop} u ${R(edgeToTop)}`
		return rubiksCube.move(moves)
	}

	/**
	 * Helper method. Finds the relative direction to the target face and returns
	 * the correct moves based on `moveFace`.
	 * @param {string} fromFace - The relative from face.
	 * @param {string} toFace - The relative to face.
	 * @param {string} moveFace - The base move to return.
	 */
	getDirectionToFace(fromFace, toFace, moveFace) {
		let dirToTargetFace = getRelativeDirection(fromFace, toFace)
		if (dirToTargetFace === 1) return `${moveFace}Prime`
		if (dirToTargetFace === -1) return `${moveFace}`
		if (dirToTargetFace === 0) return ``
		if (dirToTargetFace === 2) return `${moveFace} ${moveFace}`
	}
}

export default new F2LSolver()
