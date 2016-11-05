import THREE from 'three'
import f2lSolver from '../f2l-solver'
import rubiksCube from '../../rubiks-cube'

const R = (move) => rubiksCube.reverseMove(move)

// There 4 cases: -- Not tested!
// 1) Corner's white face is on bottom and right face matches edge's primary color
// 2) Corner's white face is on bottom and left face matches edge's primary color
// 3) Setting up corner and edge will result in a matched pair
// 4) Setting up corner and edge will result in a separated pair
class cornerOnBottomEdgeOnTopSolver {
	solve(corner, edge) {
		let data = f2lSolver.getData(corner, edge)

		if (data.corner.color.white === 'd') {
			if (data.corner.right.color === data.edge.primary.color) {
				return this.case1(corner, edge, data)
			} else {
				return this.case2(corner, edge, data)
			}
		}

		if (data.corner.face.d === data.edge.primary.color) {
			return this.case3(corner, edge, data)
		}
		if (data.corner.face.d !== data.edge.primary.color) {
			return this.case4(corner, edge, data)
		}
	}

	case1(corner, edge, data) {
		return this._case1And2Helper(corner, edge, data, false)
	}

	case2(corner, edge, data) {
		return this._case1And2Helper(corner, edge, data, true)
	}

	case3(corner, edge, data) {
		return this._case3And4Helper(corner, edge, data, true)
	}

	case4(corner, edge, data) {
		return this._case3And4Helper(corner, edge, data, false)
	}

	async _case1And2Helper(corner, edge, data, isLeft) {
		let currentFace = data.edge.primary.face
		let targetFace = getRelativeFace(data.corner[isLeft ? 'left' : 'right'].color, 'r')

		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let cornerToTopMove = data.corner[isLeft ? 'left' : 'right'].face
		cornerToTopMove = isLeft ? cornerToTopMove : R(cornerToTopMove)
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		let moves = `${cornerToTopMove} ${topLayerMove} ${R(cornerToTopMove)}`
		await rubiksCube.move(moves)
		return f2lSolver.solveMatchedPair(corner, edge)
	}

	async _case3And4Helper(corner, edge, data, willMatch) {
		let isLeft = data.corner.left.color === 'white'
		let otherFace = data.corner[isLeft ? 'right' : 'left'].face

		let targetFace = willMatch ? otherFace : data.corner.color.white
		let currentFace = data.edge.primary.face
		let prepMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')

		await rubiksCube.move(prepMove)
		data = f2lSolver.getData(corner, edge)

		let cornerToTopMove = isLeft ? R(data.corner.color.white) : data.corner.color.white
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		let moves = `${cornerToTopMove} ${topLayerMove} ${R(cornerToTopMove)}`
		await rubiksCube.move(moves)

		if (willMatch) return f2lSolver.solveMatchedPair(corner, edge)
		else return f2lSolver.solveSeparatedPair(corner, edge)
	}
}

export default new cornerOnBottomEdgeOnTopSolver()
