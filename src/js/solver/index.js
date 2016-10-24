import crossSolver from './cross-solver'
import F2LSolver from './f2l-solver'

class Solver {
	constructor() {}

	async solve() {
		await this.solveCross()
		await this.solveF2L()
	}

	solveCross() {
		return crossSolver.solve()
	}

	solveF2L() {
		return F2LSolver.solve()
	}
}

export default new Solver()
