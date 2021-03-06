import THREE from 'three'
import scene from '../scene'
import grabber from '../grabber'
import g from '../globals'
import { vectorFromString } from './vector'
import { getColorString } from './color'

const relativeDirections = {
	r: { b: 1, f: -1, l: 2, r: 0 },
	f: { r: 1, l: -1, b: 2, f: 0 },
	l: { f: 1, b: -1, r: 2, l: 0 },
	b: { l: 1, r: -1, f: 2, b: 0 }
}

const relativeFaces = {
	r: { r: 'b', l: 'f', b: 'l' },
	f: { r: 'r', l: 'l', b: 'b' },
	l: { r: 'f', l: 'b', b: 'r' },
	b: { r: 'l', l: 'r', b: 'f' }
}

const vectorToRelativeFace = {
	x: { [1]: 'r', [-1]: 'l' },
	y: { [1]: 'u', [-1]: 'd' },
	z: { [1]: 'f', [-1]: 'b' }
}

export const getRelativeDirection = (fromFace, toFace) => {
	return relativeDirections[fromFace][toFace]
}

export const getRelativeFace = (fromFace, dir) => {
	return relativeFaces[fromFace][dir]
}

/**
 * @return {object} - A map in the form of colorString: relativeFace
 */
export const getCubeState = () => {
	let middles = grabber.getAllMiddles()
	let map = { color: {}, face: {} }
	middles.forEach(middle => {
		let cubieData = getRelativeFacesOfCubie(middle)
		Object.assign(map.color, cubieData.color)
		Object.assign(map.face, cubieData.face)
	})
	return map
}

/**
 * @return {object}
 * @prop {string} color - A map in the form of [color]: [relativeFace]
 * @prop {string} relativeFace - A map in the form of [relativeFace]: [color]
 */
export const getRelativeFacesOfCubie = (cubie) => {
	let map = {
		color: {},
		face: {}
	}
	let cubiePos = cubie.position.clone()

	// cycle through 'x', 'y' and 'z' of cubie position
	// if the position is non-zero, it is on a relative face
	// find the color on the relative face, and save both to `map`
	for (let axis of ['x', 'y', 'z']) {
		if (~~Math.abs(cubiePos[axis]) > 0) {
			let dir = cubiePos[axis] /= Math.abs(cubiePos[axis])
			let relativeFace = vectorToRelativeFace[axis][dir]

			let raycaster = new THREE.Raycaster(cubie.position.clone(), vectorFromString(axis, dir))
			let colorIntersect = raycaster.intersectObjects(scene.children, true).find((data) => {
				return data.object.name === 'color'
			})

			let color = getColorString(colorIntersect.object)
			map.color[color] = relativeFace
			map.face[relativeFace] = color
		}
	}

	return map
}
