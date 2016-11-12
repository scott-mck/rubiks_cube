import crossSolver from './cross-solver'
import F2LSolver from './f2l-solver'
import ollSolver from './oll-solver'
import pllSolver from './pll-solver'

class Solver {
	async solve() {
		await this.solveCross()
		await this.solveF2L()
		await this.solveOll()
		await this.solvePll()
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

	solvePll() {
		return pllSolver.solve()
	}
}

export default new Solver()
