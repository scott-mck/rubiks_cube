import THREE from 'three'
import rubiksCube from './rubiks-cube'
import grabber from './grabber'
import scene from './scene'
import g from './globals'
import keyMap from './key-map'
import { vectorFromString } from './utils/vector'
import { color } from './utils/color'

class Solver {
  constructor() {

  }

	async solve() {
		await this.moveWhiteFaceToTop()
		this.completeCross()
	}

	completeCross() {
		this.completeWhiteEdgesOnTopFace()
		// this.completeWhiteEdgesOnBottomFace()
		// this.completeWhiteEdgesOnRightFace()
		// this.completeWhiteEdgesOnLeftFace()
		// this.completeWhiteEdgesOnFrontFace()
		// this.completeWhiteEdgesOnBackFace()
	}

	completeWhiteEdgesOnTopFace() {
		let yCoord = g.startPos + g.cubieSize
		// on the top face, do in this order: top, right, bottom, left
		let edgePoints = [
			{ x: 0, z: -g.startPos },
			{ x: g.startPos, z: 0 },
			{ x: 0, z: g.startPos },
			{ x: -g.startPos, z: 0 }
		]

		for (let coord of edgePoints) {
			let startCoord = new THREE.Vector3(coord.x, yCoord, coord.z)
			let raycaster = new THREE.Raycaster(startCoord, vectorFromString('y', -1))

			let data = raycaster.intersectObjects(scene.children)[0]
			let edgeColor = color(data.face.color)

			if (edgeColor === 'white') {
				this.solveWhiteEdgeOnTop(data.object)
			}
		}
	}

	solveWhiteEdgeOnTop(cubie) {
		// not coloring the innards of cubies would make this a lot easier
		let allCubieColors = this.getCubieColors(cubie)
	}

  moveWhiteFaceToTop() {
    let whiteSide = this.findWhiteMiddle()
    let moves
    if (whiteSide === 'r') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('y')}`
    else if (whiteSide === 'l') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('n')}`
    else if (whiteSide === 'f') moves = `${keyMap.getNotation('y')}`
    else if (whiteSide === 'b') moves = `${keyMap.getNotation('n')}`
    else if (whiteSide === 'd') moves = `${keyMap.getNotation('y')} ${keyMap.getNotation('y')}`
    else return

    return rubiksCube.move(moves)
  }

  findWhiteMiddle() {
    let axes = {
      x: { first: 'r', last: 'l' },
      y: { first: 'u', last: 'd' },
      z: { first: 'f', last: 'b' }
    }
    let startCoord
    let raycaster

    for (let axis of Object.keys(axes)) {
      startCoord = vectorFromString(axis, g.startPos + g.cubieSize)
      let dir = startCoord.clone().normalize().negate()
      raycaster = new THREE.Raycaster(startCoord, dir)
      let middles = raycaster.intersectObjects(scene.children).map(data => data.face.color)


      if (color(middles[0]) === 'white') return axes[axis].first
      if (color(middles[middles.length - 1]) === 'white') return axes[axis].last
    }
  }
}

export default Solver
