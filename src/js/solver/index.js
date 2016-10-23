import crossSolver from './cross-solver'
import F2LSolver from './f2l-solver'

class Solver {
	constructor() {}

	solve() {
		this.solveCross()
		this.solveF2L()
	}

	solveCross() {
		crossSolver.solve()
	}

	solveF2L() {
		F2LSolver.solve()
	}
}

export default new Solver()
