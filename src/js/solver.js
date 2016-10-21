import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
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
    // on the top face, do in this order: top, right, bottom, left
    let positions = [
      new THREE.Vector3(0, g.startPos, -g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, 0),
      new THREE.Vector3(0, g.startPos, g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, 0)
    ]

		for (let position of positions) {
      let object = grabber.getObjectByPosition(position)
      let colors = object.children.map((child) => {
        return color(child.material.color)
      })

			if (colors.includes('white')) {
				this.solveWhiteEdgeOnTop(object)
        return
			}
		}
	}

	solveWhiteEdgeOnTop(cubie) {
    let colors = cubie.children.map(cubie => cubie.material.color)
    // we only care about the not-white color
    colors.splice(colors.indexOf('white'), 1)

    // find the color of the middle that this cubie aligns with
    let middlePosition = cubie.position.clone().sub(vectorFromString('y', g.cubieDistance))
    let middleCube = grabber.getObjectByPosition(middlePosition)
    let middleColor = color(middleCube.children[0].material.color)
    console.log(middleColor)

    // do more stuff...
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
    let faces = {
      r: new THREE.Vector3(g.startPos, 0, 0),
      l: new THREE.Vector3(-g.startPos, 0, 0),
      u: new THREE.Vector3(0, g.startPos, 0),
      d: new THREE.Vector3(0, -g.startPos, 0),
      f: new THREE.Vector3(0, 0, g.startPos),
      b: new THREE.Vector3(0, 0, -g.startPos)
    }

    for (let face of Object.keys(faces)) {
      let object = grabber.getObjectByPosition(faces[face])
      let colors = object.children
      if (colors.length > 1) {
        throw 'Found multiple colors on an assumed middle cubie'
      }

      if (color(colors[0].material.color) === 'white') {
        return face
      }
    }
  }
}

export default Solver
