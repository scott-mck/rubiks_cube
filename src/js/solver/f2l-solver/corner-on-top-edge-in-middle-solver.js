import THREE from 'three'
import f2lSolver from '../f2l-solver'
import rubiksCube from '../../rubiks-cube'

const R = (move) => rubiksCube.reverseMove(move)

// There are 4 cases: -- Tested!
// 1) Corner is on yellow face and edge matches up
// 2) Corner is on yellow face and edge does not match up
// 3) Corner's other color matches edge's primary color
// 4) Corner's other color does not match edge's primary color
class cornerOnTopEdgeInMiddleSolver {
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
		let otherSide = data.corner[isLeft ? 'right' : 'left']

		if (otherSide.color === data.edge[isLeft ? 'primary' : 'secondary'].color) {
			return this.case3(corner, edge, data)
		} else {
			return this.case4(corner, edge, data)
		}
	}

	async case1(corner, edge, data) {
		let currentFace = data.corner.right.face
		let targetFace = data.edge.primary.face

		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let pairOutMove = data.edge.primary.face
		let moves = `${pairOutMove} uPrime ${R(pairOutMove)}`
		await rubiksCube.move(moves)
		return f2lSolver.solveMatchedPair(corner, edge)
	}

	async case2(corner, edge, data) {
		let currentFace = data.corner.right.face
		let targetFace = data.edge.primary.face

		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let cornerOutMove = data.corner.right.face
		let moves = `${cornerOutMove} u ${R(cornerOutMove)} uPrime`
		moves += ` ${cornerOutMove} u ${R(cornerOutMove)} uPrime`

		await rubiksCube.move(moves)
		return f2lSolver.solveSeparatedPair(corner, edge)
	}

	case3(corner, edge, data) {
		return this._case3And4Helper(corner, edge, data, true)
	}

	case4(corner, edge, data) {
		return this._case3And4Helper(corner, edge, data, false)
	}

	async _case3And4Helper(corner, edge, data, willMatch) {
		let isLeft = data.corner.left.color === 'white'
		let currentFace = data.corner.color.white
		let targetFace = data.edge[isLeft ? 'primary' : 'secondary'].face

		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let hideCornerMove = isLeft ? data.corner.color.white : R(data.corner.color.white)
		let topLayerMove = isLeft ? 'uPrime' : 'u'
		topLayerMove = willMatch ? topLayerMove : R(topLayerMove)
		let moves = `${hideCornerMove} ${topLayerMove} ${R(hideCornerMove)}`
		await rubiksCube.move(moves)

		if (willMatch) return f2lSolver.solveMatchedPair(corner, edge)
		else return f2lSolver.solveSeparatedPair(corner, edge)
	}
}

export default new cornerOnTopEdgeInMiddleSolver()
