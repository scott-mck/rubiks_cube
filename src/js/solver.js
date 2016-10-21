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
    this._relativeFaces = {
      r: { b: 1, f: -1 },
      f: { r: 1, l: -1 },
      l: { f: 1, b: -1 },
      b: { l: 1, r: -1 }
    }
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

      // shoot a ray up from this cube to check if top color is white
      let raycaster = new THREE.Raycaster(object.position.clone(), vectorFromString('y'))
      let intersects = raycaster.intersectObjects(scene.children, true).filter((data) => {
        return data.object.name === 'color'
      })

      let cubieColor = intersects[0].object
      if (color(cubieColor.material.color) === 'white') {
        this.solveWhiteEdgeOnTop(cubieColor.parent)
        return
      }
		}
	}

	solveWhiteEdgeOnTop(cubie) {
    let colors = cubie.children.map(cubie => color(cubie.material.color))
    // we only care about the not-white color
    colors.splice(colors.indexOf('white'), 1)

    // find the color of the middle that this cubie aligns with
    let middlePosition = cubie.position.clone().sub(vectorFromString('y', g.cubieDistance))
    let middleCube = grabber.getObjectByPosition(middlePosition)
    let middleColor = color(middleCube.children[0].material.color)

    let currentFace = this.findMiddleOfColor(middleColor)
    let targetFace = this.findMiddleOfColor(colors[0])

    if (currentFace === targetFace) {
      return
    }

    let moveDir = this._relativeFaces[currentFace][targetFace]

    let relativeMove
    if (!moveDir) {
      relativeMove = 'd d'
    } else {
      relativeMove = moveDir > 0 ? 'd' : 'dPrime'
    }

    let moves = `${currentFace} ${currentFace} ${relativeMove} ${targetFace} ${targetFace}`
    rubiksCube.move(moves)
	}

  moveWhiteFaceToTop() {
    let whiteSide = this.findMiddleOfColor('white')
    let moves
    if (whiteSide === 'r') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('y')}`
    else if (whiteSide === 'l') moves = `${keyMap.getNotation(';')} ${keyMap.getNotation('n')}`
    else if (whiteSide === 'f') moves = `${keyMap.getNotation('y')}`
    else if (whiteSide === 'b') moves = `${keyMap.getNotation('n')}`
    else if (whiteSide === 'd') moves = `${keyMap.getNotation('y')} ${keyMap.getNotation('y')}`
    else return

    return rubiksCube.move(moves)
  }

  findMiddleOfColor(middleColor) {
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

      if (color(colors[0].material.color) === middleColor) {
        return face
      }
    }
  }
}

export default Solver
