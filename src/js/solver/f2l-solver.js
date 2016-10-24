import rubiksCube from '../rubiks-cube'

class F2LSolver {
  constructor() {}

  solve() {
		rubiksCube.moveFaceToTop('yellow')
  }
}

export default new F2LSolver()
