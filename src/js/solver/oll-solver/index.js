import g from '../../globals'
import rubiksCube from '../../rubiks-cube'
import grabber from '../../grabber'
import animator from '../../animator'
import keyMap from '../../key-map'
import { getRelativeFacesOfCubie } from '../../utils/relative-finder'
import { getCubieColors } from '../../utils/color'

class OllSolver {
	// in order, based on http://badmephisto.com/oll.php
	algorithms = {
		'000000000000': '', // already solved
		'210000012101': 'h i j k f g', // #1
		'211212102101': 'h i j k f i j k f g', // #2
		'101202101202': 'i j j k f i j k f i f k', // #3
		'012111200000': 'h j i f k g', // #4
		'112101211202': 'h j i f k j i f k g', // #5
		'210000002111': 'g e f d j h', // #6
		'112101201212': 'g f e j d f e j d h', // #7
		'100012112102': 'c e e f d f e f f d f d r', // #8
		'001201211210': 'm i i j k j i j j k j k u', // #9
		'012112112110': 'h j i f k g a h i j k f g', // #10
		'211211210011': 'h j i f k g ; h i j k f g', // #11
		'211212112111': 'h i j k f g ; ; h j i f k g', // #12
		'201202102101': 'i j j i i f i i f i i j j i', // #13
		'012102112100': 'n i j k y d j e f n i f k y', // #14
		'210001211201': 'n e f d y k f i j n e j d y', // #15
		'210002110001': 'k h i j k f g j i', // #16
		'010000010000': 'i j k f u k j i f m', // #17
		'010010010010': 'm i j i j k f m m i i j i f m', // #18
		'101212101212': 'h i j k f i j k f g ; ; h j i f k g', // #19
		'110000011202': 'i j k f k h i g', // #20
		'100000001202': 'n e f i j d f k j y', // #21
		'200002100001': 'n j e f i j d f k y', // #22
		'002111200010': 'k f k h i g j i', // #23
		'212111212111': 'i j j k k h i g j j k h i g', // #24
		'100001210012': 'i j j i i h i g i j j k', // #25
		'212110010011': 'm i j i j k f u k k h i g', // #26
		'111211202102': 'h e j j d j j d h h e h', // #27
		'012110001200': 'i j k j i f k f k h i g', // #28
		'100011210002': 'k f i f k j i j n i f k j y', // #29
		'102111201212': 'k f i f k y a u ; n k j i n j y', // #30
		'012110011210': 'h j i f k g a i j k f k h i g', // #31
		'012111210010': 'h j i f k g f i j k f u k j i f m', // #32
		'211211200001': 'r j j d j e j c', // #33
		'011211201200': 'u j k j i j j m', // #34
		'001201201200': 'i j k j i j j k', // #35
		'102102100002': 'k f i f k j j i', // #36
		'010002101210': 'k j i j j k f ; e j d j h', // #37
		'101200010012': 'i f k j j i j ; i f k f g', // #38
		'212101202111': 'u j k j i f k j i j j m', // #39
		'212111202101': 'r f d f e j d f e j j c', // #40
		'112100002112': 'u j j k f i f m', // #41
		'110011200002': 'h k g i j i f k', // #42
		'110002102112': 'r f d f e j j c', // #43
		'010010000000': 'u j k f m i j i f k', // #44
		'010001212100': 'i j k f p k h i g q', // #45
		'011201211200': 'd g e f d h e a k j i', // #46
		'110002112102': 'k h i j k g i a i f k', // #47
		'101200000002': 'i i s k j j i l k j j k', // #48
		'202111202111': 'k j j i i j k j i j j n f k j y', // #49
		'100000011212': 'i j n f y f k j i n j y k', // #50
		'110000001212': 'k f h j i f k g i', // #51
		'012100011200': 'd g e f d j h f e', // #52
		'112111201202': 'k h i i g ; j j e j j d g', // #53
		'202110010001': 'n f k j e f i i f k j j u', // #54
		'202100010011': 'n j d f i j e e j d j j r', // #55
		'110012102102': 'k f i ; d g e j d h e', // #56
		'201210011201': 'i j k ; k h i f k g i' // #57
	}

	/**
	 * Goes through each algorithm, reverses the moves, moves the rubiksCube, and
	 * attempts to solve.
	 *
	 * @param {integer} [caseNum] - Skip to a specific case number, and continue on.
	 * @param {boolean} [fast] - If true, sets animation duration to near-zero.
	 */
	async test(caseNum = 0, fast = false) {
		if (fast) animator.duration(0.01)
		let orientations = Object.keys(this.algorithms)
		let algorithms = Object.values(this.algorithms)

		for (let i = caseNum - 1; i < orientations.length; i++) {
			let orientation = orientations[i]
			let algorithm = algorithms[i]

			// reverse the algorithm, then call #solve()
			let notation = keyMap.getNotation(algorithm)
			let reverse = rubiksCube.reverseMove(notation.split(' ').reverse().join(' '))

			try {
				await rubiksCube.move(reverse)

				await this.solve()
				if (!this.isSolved()) {
					console.log('Failed OLL test case.')
					console.log()
					console.log(`Orientation: [${orientation}]`)
					console.log(`Algorithm: [${algorithm}]`)
					console.log(`notation: [${notation}]`)
					console.log(`reverse: [${reverse}]`)
					console.log(`case number: [${i + 1}]`)
					return
				}
			} catch (e) {
				console.log()
				console.log(`Orientation: [${orientation}]`)
				console.log(`Algorithm: [${algorithm}]`)
				console.log(`notation: [${notation}]`)
				console.log(`reverse: [${reverse}]`)
				console.log(`case number: [${i + 1}]`)
				throw e
				return
			}
		}
		if (fast) animator.duration(0.1)
		console.log()
		console.log('Done!')
		console.log()
	}

	/**
	 * Detects whether all yellow cubies are oriented correctly on the yellow face.
	 * @return {boolean}
	 */
	isSolved() {
		return this.getOllString() === '000000000000'
	}

	async solve() {
		let ollString = this.getOllString()
		let { direction, algorithm } = this._getDirectionToAlgorithm(ollString)

		let positioningMove
		if (direction === 1) positioningMove = 'y'
		if (direction === -1) positioningMove = 'yPrime'
		if (direction === 2) positioningMove = 'y y'
		if (direction === 0) positioningMove = ''
		await rubiksCube.move(positioningMove)

		algorithm = keyMap.getNotation(algorithm)
		return rubiksCube.move(algorithm)
	}

	/**
	 * @return {string} - A string representing the state of oll. Starts with the
	 * front left cubie, then wraps around to the right. Reads the three colors on
	 * each face, for a total of (3 colors * 4 faces) = 12. TODO: Shorten this to 8.
	 *
	 * examples:
	 * A random state: '002111200010'
	 * A perfectly solved state would be '000000000000'
	 * A state where the front left cubie needs a counter-clockwise rotation to be
	 * solved, and all other cubies are solved, would be '100000000002'
	 */
	getOllString() {
		let ollArray = []

    let positions = [
      new THREE.Vector3(-g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(0, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, 0),
      new THREE.Vector3(g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(0, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, 0),
			new THREE.Vector3(-g.startPos, g.startPos, g.startPos)
    ]

    let cubies = []
    for (let position of positions) {
      cubies.push(grabber.getObjectByPosition(position))
    }

		let faces = ['f', 'r', 'b', 'l']
		for (let i = 0; i < cubies.length; i++) {
			let face = faces[~~(i / 3)]
			let cubie = cubies[i]
			let orientation = this._getOrientation(cubie, face)
			ollArray.push(orientation)
		}

    return ollArray.join('')
	}

	/**
	 * @return {string} - A string representing the orientation from solved state.
	 * 0 for solved, 1 for yellow facing out, 2 for another color facing out.
	 */
	_getOrientation(cubie, face) {
		let isCorner = getCubieColors(cubie).length === 3
    let data = getRelativeFacesOfCubie(cubie)
		if (isCorner) {
			if (data.face.u === 'yellow') return 0
			if (data.face[face] === 'yellow') return 1
			else return 2
		} else {
			return data.face.u === 'yellow' ? 0 : 1
		}
	}

	/**
	 * Attempts to find a documented orientation pattern for a given ollString.
	 * If none is found, rotates the ollString left (see _rotateOllStringLeft)
	 * and checks for a documented patter. Continues for 3 rotations.
	 *
	 * @param {string} ollString - The string-ified orientation representation.
	 * @return {object} data
	 * @prop {integer} data.direction - The direction to move toward to set up the cube for the found algorithm.
	 * @prop {string} data.algorithm - The algorithm that solves the found orientation.
	 */
	_getDirectionToAlgorithm(ollString) {
		for (let i = 0; i < 4; i++) {
      if (this.algorithms[ollString]) {
        return {
          direction: i === 3 ? -1 : i,
          algorithm: this.algorithms[ollString]
        }
      }

      ollString = this._rotateOllStringLeft(ollString)
    }

		throw `No pattern found for [${ollString}]`
	}

	/**
	 * Basically performs a rubiksCube.move('u') on the ollString, without the
	 * unnecessary animation.
	 *
	 * @param {string} ollString - The string-ified orientation representation.
	 */
	_rotateOllStringLeft(ollString) {
    let firstThree = ollString.split('')
    let rest = firstThree.splice(3)
    return [...rest, ...firstThree].join('')
  }
}

export default new OllSolver()
