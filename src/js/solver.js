import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import grabber from './grabber'
import scene from './scene'
import g from './globals'
import keyMap from './key-map'
import { vectorFromString } from './utils/vector'
import { getColorString, getCubieColors } from './utils/color'

class Solver {
  constructor() {
    this._relativeDirections = {
      r: { b: 1, f: -1, l: 2 },
      f: { r: 1, l: -1, b: 2 },
      l: { f: 1, b: -1, r: 2 },
      b: { l: 1, r: -1, f: 2 }
    }
    this._relativeFaces = {
      r: { r: 'b', l: 'f', b: 'l' },
      f: { r: 'r', l: 'l', b: 'b' },
      l: { r: 'f', l: 'b', b: 'r' },
      b: { r: 'l', l: 'r', b: 'f' }
    }
		this._callbacks = []
		this._promises = []
  }

	async solve() {
		await this.moveWhiteFaceToTop()
		this.completeCross()
	}

  getRelativeDirection(fromFace, toFace) {
    return this._relativeDirections[fromFace][toFace]
  }

  getRelativeFace(fromFace, dir) {
    return this._relativeFaces[fromFace][dir]
  }

	chainPromise(callback) {
    this._callbacks.push(callback)
    let lastPromise = this._promises.shift()

    if (!lastPromise) {
      this._promises.push(this._callbacks.shift()())
    } else {
      let newPromise = lastPromise.then(this._callbacks.shift())
      this._promises.push(newPromise)
    }
	}

	completeCross() {
		let whiteEdges = this.findAllWhiteEdges()

		whiteEdges.forEach((edge) => {
			this.chainPromise(() => {
        return this.solveWhiteEdge(edge)
      })
		})
	}

	solveWhiteEdge(cubie) {
    if (cubie.position.y === g.startPos) {
      return this.solveWhiteEdgeOnTopLayer(cubie)
    } else if (~~cubie.position.y === 0) {
      return
      return this.solveWhiteEdgeOnMiddleLayer(cubie)
    } else if (cubie.position.y === -g.startPos) {
      return
      return this.solveWhiteEdgeOnBottomLayer(cubie)
    }
	}

  solveWhiteEdgeOnTopLayer(cubie) {
    let raycaster = new THREE.Raycaster(cubie.position.clone(), new THREE.Vector3(0, 1, 0))
    let intersects = raycaster.intersectObjects(scene.children, true).filter((data) => {
      return data.object.name === 'color'
    })
    if (getColorString(intersects[0].object) === 'white') {
      return this.solveWhiteEdgeOnTopLayerFacingUp(cubie)
    } else {
      console.log('here')
      return this.solveWhiteEdgeOnTopLayerFacingOut(cubie)
    }
  }

  /**
   * Gets the adjacent color of the white edge, finds the target face, and returns
   * relative move direction to get the edge to the target face
   */
  getRelativeDataForWhiteEdge(cubie) {
    let colors = getCubieColors(cubie)
    colors.splice(colors.indexOf('white'), 1)

    // find the color of the middle that this cubie aligns with
    let middlePosition = cubie.position.clone().sub(vectorFromString('y', g.cubieDistance))
    let middleCube = grabber.getObjectByPosition(middlePosition)
    let middleColor = getColorString(middleCube.children[0].material.color)

    let currentFace = this.findMiddleOfColor(middleColor)
    let targetFace = this.findMiddleOfColor(colors[0])

    let relativeDir = this.getRelativeDirection(currentFace, targetFace)
    if (!relativeDir) relativeDir = 0

    let relativeMove
    if (relativeDir === 1) relativeMove = 'uPrime'
    else if (relativeDir === -1) relativeMove = 'u'
    else if (relativeDir === 2) relativeMove = 'u u'

    return { currentFace, targetFace, relativeDir, relativeMove }
  }

  solveWhiteEdgeOnTopLayerFacingUp(cubie) {
    let { currentFace, targetFace, relativeDir, relativeMove } = this.getRelativeDataForWhiteEdge(cubie)
    if (!relativeMove) {
      return
    }

    let reverseRelativeMove = rubiksCube.reverseNotation(relativeMove)
    let reverseCurrentFace = rubiksCube.reverseNotation(currentFace)

    let moves = `${currentFace} ${reverseRelativeMove} ${reverseCurrentFace} ${relativeMove} ${currentFace}`
    return rubiksCube.move(moves)
  }

  solveWhiteEdgeOnTopLayerFacingOut(cubie) {
    let { currentFace, targetFace, relativeDir, relativeMove } = this.getRelativeDataForWhiteEdge(cubie)

    let firstMove = currentFace
    let whiteEdgeToTopMove = this.getRelativeFace(currentFace, 'r')
    relativeMove = ''

    if (relativeDir === -1) {
      firstMove = rubiksCube.reverseNotation(currentFace)
      whiteEdgeToTopMove = rubiksCube.reverseNotation(this.getRelativeFace(currentFace, 'l'))
    } else if (relativeDir === 0) {
      relativeMove = 'uPrime'
    } else if (relativeDir === 2) {
      relativeMove = 'u'
    }

    let reverseRelativeMove = rubiksCube.reverseNotation(relativeMove)

    let moves = `${firstMove} ${relativeMove} ${whiteEdgeToTopMove} ${reverseRelativeMove}`
    console.log(moves)
    return rubiksCube.move(moves)
  }

	findAllWhiteEdges() {
		let edges = []
		// ordered by top, right, bottom, left
		let startCoords = [
			// first half are vertical
      new THREE.Vector3(0, g.startPos + g.cubieSize, -g.startPos),
      new THREE.Vector3(g.startPos, g.startPos + g.cubieSize, 0),
      new THREE.Vector3(0, g.startPos + g.cubieSize, g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos + g.cubieSize, 0),
			// first half are horizontal
			new THREE.Vector3(0, g.startPos, g.startPos + g.cubieSize),
			new THREE.Vector3(g.startPos, 0, g.startPos + g.cubieSize),
			new THREE.Vector3(0, -g.startPos, g.startPos + g.cubieSize),
			new THREE.Vector3(-g.startPos, 0, g.startPos + g.cubieSize)
		]

		let shootDirs = [
			new THREE.Vector3(0, -1, 0),
			new THREE.Vector3(0, 0, -1)
		]

		let shootDir = shootDirs.shift()
		for (let startCoord of startCoords) {
			if (startCoords.indexOf(startCoord) === startCoords.length / 2) {
				shootDir = shootDirs.shift()
			}

			let raycaster = new THREE.Raycaster(startCoord, shootDir)
			let intersects = grabber.raycast(raycaster)

			// only the first and last cubes will be edges
			let possibleEdges = [intersects[0], intersects[intersects.length - 1]]
			possibleEdges.forEach((cubie) => {
				if (getCubieColors(cubie).includes('white') && !edges.includes(cubie)) {
					edges.push(cubie)
				}
			})
		}

		return edges
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

      if (getColorString(colors[0].material.color) === middleColor) {
        return face
      }
    }
  }
}

export default Solver
