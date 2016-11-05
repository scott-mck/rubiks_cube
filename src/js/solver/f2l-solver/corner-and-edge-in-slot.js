import THREE from 'three'
import f2lSolver from '../f2l-solver'
import rubiksCube from '../../rubiks-cube'
import cornerAndEdgeOnTopSolver from './corner-and-edge-on-top-solver'

const R = (move) => rubiksCube.reverseMove(move)

// There are 4 cases:
// X 1) the pair is matching (corner's white edge is on white face)
// X 2) the pair is not matching (corner's white edge is on white face)
// X 3) corner's other color matches the edge color
// 4) corner's other color does not match the edge color
class cornerAndEdgeInSlotSolver {
	solve(corner, edge) {
		let data = f2lSolver.getData(corner, edge)

		if (data.corner.color.white === 'd' && f2lSolver.isMatched(corner, edge)) {
			return this.case1(corner, edge, data)
		}

		if (data.corner.color.white === 'd' && !f2lSolver.isMatched(corner, edge)) {
			return this.case2(corner, edge, data)
		}

		let isLeft = data.corner.left.color === 'white'
		let otherColor = data.corner[isLeft ? 'right' : 'left'].color

		if (otherColor === data.edge[isLeft ? 'primary' : 'secondary'].color) {
			return this.case3(corner, edge, data)
		}

		if (otherColor !== data.edge[isLeft ? 'primary' : 'secondary'].color) {
			return this.case4(corner, edge, data)
		}
	}

	async case1(corner, edge, data) {
		// if they are in the correct slot, do nothing
		if (data.cube.color[data.edge.primary.color] === data.edge.primary.face) {
			return Promise.resolve()
		}

		await f2lSolver.releaseEdge(edge)
		return f2lSolver.solveMatchedPair(corner, edge)
	}

	async case2(corner, edge, data) {
		await f2lSolver.releaseEdge(edge)
		return cornerAndEdgeOnTopSolver.solve(corner, edge)
	}

	async case3(corner, edge, data) {
		let isLeft = data.corner.left.color === 'white'
		let cornerToTopMove = isLeft ? R(data.corner.color.white) : data.corner.color.white
		let topLayerMove = isLeft ? 'uPrime' : 'u'

		// remove corner and edge from slot
		let moves = `${cornerToTopMove} ${topLayerMove} ${R(cornerToTopMove)}`
		await rubiksCube.move(moves)

		return cornerAndEdgeOnTopSolver.solve(corner, edge)
	}

	case4(corner, edge, data) {
		return this.case3(corner, edge, data)
	}
}

export default new cornerAndEdgeInSlotSolver()
