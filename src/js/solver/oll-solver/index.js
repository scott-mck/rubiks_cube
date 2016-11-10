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

		// can be refactored
		this._cornerPositionsForNone = {
			'f r u l': '; c a i j k f ; r a j h i j k f g', // #10
			'r u b l': 'f ; c a i j k f ; r a j h i j k f g', // #10 and a 'u'
			'u r b l': 'f f ; c a i j k f ; r a j h i j k f g', // #10 and a 'u u'
			'f r b u': 'j f ; c a i j k f ; r a j h i j k f g', // #10 and a 'uPrime'
			'l u r b': '; c a i j k f ; r a f h i j k f g', // #11
			'u f r b': 'f ; c a i j k f ; r a f h i j k f g', // #11 and a 'u'
			'l f r u': 'f f ; c a i j k f ; r a f h i j k f g', // #11 and a 'u u'
			'l r u b': 'j ; c a i j k f ; r a f h i j k f g', // #11 and a 'uPrime'
			'l f b l': 'h i j k f g ; c a i j k f ; r a', // #12
			'l r b b': 'f h i j k f g ; c a i j k f ; r a', // #12 and a 'u'
			'f r r b': 'f f h i j k f g ; c a i j k f ; r a', // #12 and a 'u u'
			'f f r l': 'j h i j k f g ; c a i j k f ; r a', // #12 and a 'uPrime'
			'l r r l': 'i j j k k h i g j j k h i g', // #24
			'f f b b': 'f i j j k k h i g j j k h i g', // #24 and a 'u'
			'l r u u': 'm i j i j k f u k k h i g', // #26
			'f u u b': 'f u k j i j k f m i k h i g', // #26 and a 'u'
			'u u r l': 'f f u k j i j k f m i k h i g', // #26 and a 'u u'
			'u f b u': 'j u k j i j k f m i k h i g', // #26 and a 'uPrime'
			'l u b u': 'i j k j k h i g j j k h i g', // #31
			'u r u b': 'f i j k j k h i g j j k h i g', // #31 and a 'u'
			'f u r u': 'f fi j k j k h i g j j k h i g', // #31 and a 'u u'
			'u f u l': 'j i j k j k h i g j j k h i g', // #31 and a 'uPrime'
			'u u b b': 'h i j k j g a j j k h i g', // #32
			'u r r u': 'f h i j k j g a j j k h i g', // #32 and a 'u'
			'f f u u': 'f f h i j k j g a j j k h i g', // #32 and a 'u u'
			'l u u l': 'j h i j k j g a j j k h i g' // #32 and a 'uPrime'
		}

		this._cornerPositionsForAll = {
			'f f b b': 'i j j k f i j k f i f k', // #3
			'l r r l': 'j i j j k f i j k f i f k', // #3 and a 'u'
			'l f b l': 'i j j i i f i i f i i j j i', // #13
			'l r b b': 'f i j j i i f i i f i i j j i', // #13 and a 'u'
			'f r r b': 'f f i j j i i f i i f i i j j i', // #13 and a 'u u'
			'f f r l': 'j i j j i i f i i f i i j j i', // #13 and a 'uPrime'
			'f u u b': 'n e f i j d f k j y', // #21
			'u u r l': 'f n e f i j d f k j', // #21 and a 'u'
			'u f b u': 'f f n e f i j d f k j', // #21 and a 'u u'
			'l r u u': 'j n e f i j d f k j', // #21 and a 'uPrime'
			'l u b u': 'n j e f i j d f k', // #22
			'u r u b': 'f n j e f i j d f k', // #22 and a 'u'
			'f u r u': 'f f n j e f i j d f k', // #22 and a 'u u'
			'u f u l': 'j n j e f i j d f k', // #22 and a 'uPrime'
			'u f r b': 'i j k j i j j k', // #35
			'l f r u': 'f i j k j i j j k', // #35 and a 'u'
			'l f u b': 'f f i j k j i j j k', // #35 and a 'u u'
			'l u r b': 'j i j k j i j j k', // #35 and a 'uPrime'
			'f r b u': 'k f i f k j j i', // #36
			'f r u l': 'f k f i f k j j i', // #36 and a 'u'
			'f u b l': 'f f k f i f k j j i', // #36 and a 'u u'
			'u r b l': 'j k f i f k j j i', // #36 and a 'uPrime'
			'f f u u': 'i i s k j j i l k j j k f', // #48
			'l u u l': 'f i i s k j j i l k j j k f', // #48 and a 'u'
			'u u b b': 'f f i i s k j j i l k j j k f', // #48 and a 'u u'
			'u r r u': 'j i i s k j j i l k j j k f' // #48 and a 'uPrime'
		}

		this._cornerPositionsForLine = {
			'l u u l': 'h i j k f g', // #1
			'u r r u': 'j j h i j k f g', // #1 and a 'u u'
			'f r r b': 'h j i f k j i f k g', // #5
			'l f b l': 'j j h j i f k j i f k g', // #5 and a 'u u'
			'u r b l': 'n i j k y d j e f n i f k y', // #14
			'f r u l': 'j j n i j k y d j e f n i f k y', // #14 and a 'u u'
			'l u r b': 'n e f d y k f i j n e j d y', // #15
			'l f r u': 'j j n e f d y k f i j n e j d y', // #15 and a 'u u'
			'l u b u': 'k h i j k f g j i', // #16
			'f u r u': 'j j k h i j k f g j i', // #16 and a 'u u'
			'u u u u': 'i j k f u k j i f m', // #17
			'l r r l': 'h i j k f i g u j k f m', // #19
			'f u u b': 'i j k f k h i g', // #20
			'u f b u': 'j j i j k f k h i g', // #20 and a 'u u'
			'u u b b': 'j k f k h i g j i', // #23
			'f f u u': 'f k f k h i g j i', // #23 and a 'u u'
			'l r b b': 'j k f i f k y a u ; n k j c j y', // #30
			'f f r l': 'f k f i f k y a u ; n k j c j y', // #30 and a 'u u'
			'u u r l': 'i j k f p k h i g ; i', // #45
			'l r u u': 'j j i j k f p k h i g ; i', // #45 and a 'u u'
			'u f r b': 'd g e f d h e ; e j d', // #46
			'l f u b': 'j j d g e f d h e ; e j d', // #46 and a 'u u'
			'f u b l': 'k h i j k g i a i f k', // #47
			'f r b u': 'j j k h i j k g i a i f k', // #47 and a 'u u'
			'f f b b': 'k j j i i j k j i j j n f k j y', // #49
			'u r u b': 'd g e f d j h f e', // #52
			'u f u l': 'j j d g e f d j h f e' // #52 and a 'u u'
		}
	}

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
				return this.line(yellows)
			}
			if (relativeDir === 1 || relativeDir === -1) {
				return this.r(yellows)
			}
		}
	}

	async line(yellows) {
		await this.setupLinePosition(yellows)
		let cornerFormation = this.getCornerFormation()
		let algorithm = keyMap.getNotation(this._cornerPositionsForLine[cornerFormation])
		return rubiksCube.move(algorithm)
	}

	async allEdges() {
		let cornerFormation = this.getCornerFormation()
		let algorithm = keyMap.getNotation(this._cornerPositionsForAll[cornerFormation])
		return rubiksCube.move(algorithm)
	}

	async noEdges() {
		let cornerFormation = this.getCornerFormation()
		let algorithm = keyMap.getNotation(this._cornerPositionsForNone[cornerFormation])
		return rubiksCube.move(algorithm)
	}

	async r(yellows) {
		await this.setupRPosition(yellows)
		let cornerFormation = this.getCornerFormation()
		let algorithm = keyMap.getNotation(this._cornerPositionsForR[cornerFormation])
		return rubiksCube.move(algorithm)
	}

	setupLinePosition(yellows) {
		// move yellow face so that the edges and middle form a line
		let data = f2lSolver.getEdgeData(yellows[0])
		let nonYellowFace = Object.keys(data.face).find(face => data.face[face] != 'yellow')

		let targetFace = 'f'
		let currentFace = getRelativeFace(nonYellowFace, 'r')
		let setupMove = f2lSolver.getDirectionToFace(currentFace, targetFace, 'u')
		return rubiksCube.move(setupMove)
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
