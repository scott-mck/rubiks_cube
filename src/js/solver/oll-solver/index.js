import THREE from 'three'
import rubiksCube from '../../rubiks-cube'
import grabber from '../../grabber'
import keyMap from '../../key-map'
import f2LSolver from '../'
import { getCubieColors } from '../../utils/color'
import {
	getRelativeFace,
	getRelativeDirection,
	getRelativeFacesOfCubie
} from '../../utils/relative-finder'

const R = (move) => rubiksCube.reverseMove(move)

class OllSolver {
	constructor() {
		// in order, based on http://badmephisto.com/oll.php
		this._cornerPositionsForR = { // Tested!
			'f r r b': 'j j h i j k f i j k f g', // #2
			'l u u l': 'j j h j i f k g', // #4
			'u u b b': 'f g f e j d h', // #6
			'f f r l': 'f g e f d j e f d j h', // #7
			'f r u l': 'j n i e e f d f e f f d f d k y', // #8
			'u f r b': 'n e i i j k j i j j k j k d y', // #9
			'f u r u': 'i j j i i h i g i j j k', // #25
			'l r b b': 'j j h e j j d j j d h h e h', // #27
			'u f u l': 'j j i j k j i f k f k h i g', // #28
			'u r u b': 'j k f i f k j i j n i f k j y', // #29
			'l u r b': 'j j r j j d j e j c', // #33
			'l f u b': 'j j u j k j i j j m', // #34
			'u r r u': 'f k j i j j k f g j h j i', // #37
			'f f u u': 'j j i j k j i j j k h i j k f g', // #38
			'f f b b': 'f u j k j i f k j i j j m', // #39
			'l r r l': 'j j r f d f e j d f e j j c', // #40
			'f u b l': 'f u j j k f i f m', // #41
			'l u b u': 'j j h k g i j i f k', // #42
			'u r b l': 'f r f d f e j j c', // #43
			'u u u u': 'j j u j k f m i j i f k', // #44
			'f u u b': 'i j n f y f k j i n j y k', // #50
			'u u r l': 'f k f h j i f k g i', // #51
			'l f b l': 'j j k h i i g ; j j e j j d g', // #53
			'u f b u': 'j n f k j e f i i f k j j d y', // #54
			'l r u u': 'n j d f i j e e j d j j r', // #55
			'f r b u': 'e f d a d g e j d h e', // #56
			'l f r u': 'j i j k ; k h i f k g i' // #57
		}
	}

	// async test(num = 0) {
	// 	let string = this.stuff[num]
	// 	let reverse = string.split(' ').reverse()
	// 	let moves = reverse.map((move) => {
	// 		console.log(move)
	// 		let notation = keyMap.getNotation(move)
	// 		let reverseMove = rubiksCube.reverseMove(notation)
	// 		return reverseMove
	// 	})
	//
	// 	moves = moves.join(' ')
	// 	moves += ` ${keyMap.getNotation(';')}`
	// 	await rubiksCube.move(moves)
	//
	// 	return ollSolver.solve()
	// }

	/**
	 * Finds the edge orientations, then moves to the target face.
	 * Then finds the corner orientations and outputs them as a string. Then
	 * executes the correct algorithm to solve OLL.
	 */
	async solve() {
		let yellows = grabber.getAllEdges().filter((edge) => {
			let data = getRelativeFacesOfCubie(edge)
			return data.color.yellow === 'u'
		})

		if (yellows.length === 0) {
			return this.noEdges()
			return this.r(yellows)
		}
		if (yellows.length === 4) {
			return this.allEdges()
		}
		if (yellows.length === 2) {
			let faces = yellows.map((edge) => {
				let data = getRelativeFacesOfCubie(edge)
				let otherColor = getCubieColors(edge).filter(color => color !== 'yellow')
				return data.color[otherColor]
			})

			let relativeDir = getRelativeDirection(faces[0], faces[1])
			if (relativeDir === 2) {
				return this.line()
			}
			if (relativeDir === 1 || relativeDir === -1) {
				return this.r(yellows)
			}
		}
	}

	async r(yellows) {
		await this.setupRPosition(yellows)
		let cornerFormation = this.getCornerFormation()
		let algorithm = keyMap.getNotation(this._cornerPositionsForR[cornerFormation])
		return rubiksCube.move(algorithm)
	}

	setupRPosition(yellows) {
		// move yellow face so that the edges and middle form an "r"
		let data0 = f2lSolver.getEdgeData(yellows[0])
		let data1 = f2lSolver.getEdgeData(yellows[1])

		let nonYellowFace0 = Object.keys(data0.face).find(face => data0.face[face] != 'yellow')
		let nonYellowFace1 = Object.keys(data1.face).find(face => data1.face[face] != 'yellow')

		let targetFace = 'f'
		let currentFace
		if (getRelativeFace(nonYellowFace0, 'r') === nonYellowFace1) {
			currentFace = nonYellowFace0
		} else {
			currentFace = nonYellowFace1
		}
		let setupMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		return rubiksCube.move(setupMove)
	}

	/**
	 * Grabs each yellow-face corner in the order of front left, front right,
	 * back right, back left, and returns a string of the relative face that
	 * the yellow face points to.
	 */
	getCornerFormation() {
		let cornerPositions = [
			new THREE.Vector3(-g.startPos, g.startPos, g.startPos),
			new THREE.Vector3(g.startPos, g.startPos, g.startPos),
			new THREE.Vector3(g.startPos, g.startPos, -g.startPos),
			new THREE.Vector3(-g.startPos, g.startPos, -g.startPos)
		]

		let relativeFaces = []
		for (let position of cornerPositions) {
			let corner = grabber.getObjectByPosition(position)
			let data = getRelativeFacesOfCubie(corner)
			relativeFaces.push(data.color.yellow)
		}

		return relativeFaces.join(' ')
	}
}

export default new OllSolver()


/* ----- 57 cases! ----- */

// 4 Edge possibilities:
//   1) All are not on the yellow face
//   2) Two are on the yellow face, in an "r" position
//   3) Two are on the yellow face, in a straight line
//   4) All four are on the yellow face

// 6 Corner possibilities:
//   1) All corners are on the yellow face
//   2) One corner is on the yellow face, in a "fishy" position
//   3) One corner is on the yellow face, in a "reverse fishy" position
//   4) Two corners are on the yellow face, with the other two sharing a relative face
//   5) Two corners are on the yellow face, with the other two not sharing a relative face
//   6) All corners are on the yellow face

// For case 2 of edge possibilities, there is no symmetry. Fuck
// for case 1, 3, and 4 of edge possibilities, there is symmetry. Yay!
