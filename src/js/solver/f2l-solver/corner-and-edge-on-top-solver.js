import THREE from 'three'
import f2lSolver from '../f2l-solver'
import rubiksCube from '../../rubiks-cube'
import { getRelativeFace } from '../../utils/relative-finder'

const R = (move) => rubiksCube.reverseMove(move)

// There are 10 cases: -- Tested!
// 1) Corner's white is on top face and the right color equals edge's primary color
// 2) Corner's white is on top face and the left color equals edge's primary color
// 3) Corner's white face equals edge's primary face, and colors on the top face are equal
// 4) Corner's white face equals edge's primary face, and colors on the top face are not equal
// 5) Corner and edge are attached and matched
// 6) Corner and edge are attached and not matched
// 7) Corner and edge are a separated pair
// 8) Corner and edge are separated but not matching
// 9) Corner and edge are "far apart" and corner color equals primary color
// 10) Corner and edge are "far apart" and corner color does not equal primary color
class cornerAndEdgeOnTopSolver {
	solve(corner, edge) {
		let data = f2lSolver.getData(corner, edge)

		if (data.corner.color.white === 'u') {
			if (data.corner.right.color === data.edge.primary.color) {
				return this.case1(corner, edge, data)
			} else {
				return this.case2(corner, edge, data)
			}
		}

		let isLeft = data.corner.left.color === 'white'
		let cornerWhite = data.corner[isLeft ? 'left' : 'right']
		let cornerOther = data.corner[isLeft ? 'right' : 'left']
		let edgePrimary = data.edge.primary

		if (cornerWhite.face === edgePrimary.face) {
			if (data.corner.face.u === data.edge.face.u) {
				return this.case3(corner, edge, data)
			} else {
				return this.case4(corner, edge, data)
			}
		}

		if (f2lSolver.isAttached(corner, edge) && f2lSolver.isMatched(corner, edge)) {
			return this.case5(corner, edge, data)
		}
		if (f2lSolver.isAttached(corner, edge) && !f2lSolver.isMatched(corner, edge)) {
			return this.case6(corner, edge, data)
		}

		if (getRelativeFace(cornerWhite.face, isLeft ? 'l' : 'r') === edgePrimary.face) {
			if (cornerOther.color !== edgePrimary.color) {
				return this.case7(corner, edge, data)
			} else {
				return this.case8(corner, edge, data)
			}
		}

		if (getRelativeFace(cornerWhite.face, 'b') === edgePrimary.face) {
			if (cornerOther.color === edgePrimary.color) {
				return this.case9(corner, edge, data)
			} else {
				return this.case10(corner, edge, data)
			}
		}
	}

	async _case1And2Helper(corner, edge, data, isRightColor) {
		let prepFace = data.cube.color[data.edge.primary.color]
		let prepMove = f2lSolver.getDirectionToFace(data.edge.primary.face, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		// let currentCornerFace = data.corner[isRightColor ? 'right' : 'left'].face
		let currentCornerFace = data.corner.color[data.edge.primary.color]
		let primaryFace = data.edge.primary.face

		let prepareEdgeMove = isRightColor ? primaryFace : R(primaryFace)
		let topLayerMove = f2lSolver.getDirectionToFace(currentCornerFace, primaryFace, 'u')

		let moves = `${prepareEdgeMove} ${topLayerMove} ${R(prepareEdgeMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveMatchedPair(corner, edge)
	}

	// 1) Corner's white is on top face and the right color equals edge's primary color
	async case1(corner, edge, data) {
		this._case1And2Helper(corner, edge, data, false)
	}

	// 2) Corner's white is on top face and the left color equals edge's primary color
	async case2(corner, edge, data) {
		this._case1And2Helper(corner, edge, data, true)
	}

	// 3) Corner's white face equals edge's primary face, and colors on the top face are equal
	async case3(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let currentFace = data.corner.color[data.edge.primary.color]
		let prepFace = data.cube.color[data.edge.primary.color]

		let prepMove = f2lSolver.getDirectionToFace(currentFace, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let slideCornerMove = isLeft ? R(data.corner.color.white) : data.corner.color.white
		let topLayerMove = isLeft ? 'u' : 'uPrime'
		let moves = `${slideCornerMove} ${topLayerMove} ${R(slideCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveSeparatedPair(corner, edge)
	}

	// 4) Corner's white face equals edge's primary face, and colors on the top face are not equal
	async case4(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let otherSide = data.corner[isLeft ? 'right' : 'left']
		let prepFace = getRelativeFace(data.cube.color[data.edge.primary.color], isLeft ? 'l' : 'r')

		let prepMove = f2lSolver.getDirectionToFace(data.corner.color.white, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let hideCornerMove = isLeft ? R(otherSide.face) : otherSide.face
		let topLayerMove = isLeft ? 'u' : 'uPrime'
		let moves = `${hideCornerMove} ${topLayerMove} ${R(hideCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveSeparatedPair(corner, edge)
	}

	// 5) Corner and edge are attached and matched
	case5(corner, edge, data) {
		return f2lSolver.solveMatchedPair(corner, edge)
	}

	// 6) Corner and edge are attached and not matched
	async case6(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let prepFace = data.cube.color[data.edge.secondary.color]

		let prepMove = f2lSolver.getDirectionToFace(data.corner.color.white, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let hideCornerMove = isLeft ? data.corner.color.white : R(data.corner.color.white)
		let moves = `${hideCornerMove} u u ${R(hideCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveSeparatedPair(corner, edge)
	}

	// 7) Corner and edge are a separated pair
	case7(corner, edge, data) {
		return f2lSolver.solveSeparatedPair(corner, edge)
	}

	// 8) Corner and edge are separated but not matching
	async case8(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let currentFace = data.edge.primary.face
		let targetFace = data.cube.color[data.edge.secondary.color]

		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let prepareCornerMove = isLeft ? data.corner.color.white : R(data.corner.color.white)
		let moves = `${prepareCornerMove} u u ${R(prepareCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveMatchedPair(corner, edge, data)
	}

	// 9) Corner and edge are "far apart" and corner color equals primary color
	async case9(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let prepFace = data.cube.color[data.edge.primary.color]

		let prepMove = f2lSolver.getDirectionToFace(data.corner.color.white, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let prepareCornerMove = isLeft ? data.corner.color.white : R(data.corner.color.white)
		let topLayerMove = isLeft ? 'u' : 'uPrime'

		let moves = `${prepareCornerMove} ${topLayerMove} ${R(prepareCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveMatchedPair(corner, edge)
	}

	// 10) Corner and edge are "far apart" and corner color does not equal primary color
	async case10(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let prepFace = data.cube.color[data.edge.primary.color]

		let prepMove = f2lSolver.getDirectionToFace(data.edge.primary.face, prepFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let hideCornerMove = isLeft ? R(prepFace) : prepFace
		let topLayerMove = isLeft ? 'u' : 'uPrime'

		let moves = `${hideCornerMove} ${topLayerMove} ${R(hideCornerMove)}`
		await rubiksCube.move(moves)

		return f2lSolver.solveSeparatedPair(corner, edge)
	}
}

export default new cornerAndEdgeOnTopSolver()
