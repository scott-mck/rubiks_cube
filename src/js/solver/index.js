import crossSolver from './cross-solver'
import F2LSolver from './f2l-solver'
import ollSolver from './oll-solver'

class Solver {
	constructor() {}

	async solve() {
		await this.solveCross()
		await this.solveF2L()
		await this.solveOll()
	}

	solveCross() {
		return crossSolver.solve()
	}

	solveF2L() {
		return F2LSolver.solve()
	}

	solveOll() {
		return ollSolver.solve()
	}
}

export default new Solver()
