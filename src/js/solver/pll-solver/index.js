import rubiksCube from '../../rubiks-cube'
import f2lSolver from '../f2l-solver'
import grabber from '../../grabber'
import keyMap from '../../key-map'
import { getCubieColors } from '../../utils/color'
import {
  getCubeState,
  getRelativeDirection
} from '../../utils/relative-finder'

class PllSolver {
  // in order, based on http://badmephisto.com/oll.php
  algorithms = {
    '0 0 0 0 0 0 0 0': ' ', // last-layer turns
    '1 1 1 1 1 1 1 1': 'f', // last-layer turns
    '2 2 2 2 2 2 2 2': 'j j', // last-layer turns
    '-1 -1 -1 -1 -1 -1 -1 -1': 'j', // last-layer turns
    '2 0 -1 0 -1 0 0 0': 'n i i l l k f i l l k j k y', // #1
    '1 0 1 0 2 0 0 0': 'n i f i l l k j i l l k k y', // #2
    '0 1 0 2 0 0 0 1': 'i f i j i j i f k f k k', // #3
    '0 -1 0 -1 0 0 0 2': 'i i j i j k f k f k j k', // #4
    '0 2 0 2 0 2 0 2': 'd i j j e k a e k j j d i', // #5
    '0 0 1 2 -1 0 0 2': 'i j k f k h i i f k f i j k g', // #6
    '0 1 1 -1 -1 0 0 0': 'i j j k f i j j e j k f d', // #7
    '0 0 2 0 0 1 2 -1': 'h i f k f i j k g i j k f k h i g', // #8
    '0 1 0 -1 1 0 -1 0': 'k j j i f f k h i j k f k g i i f', // #9
    '0 0 1 0 -1 1 0 -1': 'i f k f i j i s k f i l k j j k f', // #10
    '0 0 2 1 0 -1 2 0': 'k j k f ; k s k l a n j j k f i j i y', // #11
    '0 2 1 0 -1 2 0 0': 'k f g i j k f k h i i f k f i j k j i', // #12
    '2 1 -1 1 -1 2 0 0': 'd j e a e e a l d f e j e s h h', // #13
    '1 -1 2 0 0 2 1 -1': 'k f i ; i i ; s k j i f i l h h', // #14
    '0 0 1 2 1 -1 2 -1': 'e e a l d f d j e s  h h i f k', // #15
    '-1 0 0 1 2 1 -1 2': 'i i s ; k j k f i l h h e j d', // #16
    '0 1 0 -1 0 1 0 -1': 'j k f i f i j i f k j i j i i f k j', // #17
    '-1 -1 0 0 0 0 1 1': 'e j j d j e j j i f d j k', // #18
    '-1 0 1 0 -1 0 1 0': 'n i f k s i j k l i j k s i f k l', // #19
    '0 0 2 2 0 0 2 2': 'f k j e j j i f d k j e j j i f d', // #20
    '2 0 0 2 2 0 0 2': 'j d f i j j e j k d f i j j e j k', // #21
  }
  lastLayerTurns = {
    'ffffffff': ' ',
    'llllllll': 'j',
    'rrrrrrrr': 'f',
    'bbbbbbbb': 'j j'
  }

  async solve() {
    let pllString = this.getPllString()
    let directionMap = this._getDirectionMap(pllString)

    let { direction, algorithm } = this._getDirectionToAlgorithm(directionMap)

    let positioningMove
    if (direction === 1) positioningMove = 'y'
    if (direction === -1) positioningMove = 'yPrime'
    if (direction === 2) positioningMove = 'y y'
    if (direction === 0) positioningMove = ''
    await rubiksCube.move(positioningMove)

    let algorithmNotation = keyMap.getNotation(algorithm)
    await rubiksCube.move(algorithmNotation)

    return this.lastLayerTurn()
  }

  lastLayerTurn() {
    let pllString = this.getPllString()
    let lastLayerTurn = this.lastLayerTurns[pllString]
    return rubiksCube.move(keyMap.getNotation(lastLayerTurn))
  }

  /**
   * @return {string} - A string of solving directions for each cubie, with
   * spaces in between.
   */
  _getDirectionMap(pllString) {
    let baseLetter = this._getBaseLetter(pllString)
    return pllString
      .split('')
      .map(letter => getRelativeDirection(baseLetter, letter))
      .join(' ')
  }

  /**
   * Determines the "base" letter for the last layer string. 2 requirements:
   * 1) It is the most common letter in the string.
   * 2) It appears consecutively. (Only necessary if there's a tie) (I think.)
   */
  _getBaseLetter(pllString) {
    let consecutives = getConsecutivelyAppearingLetters(pllString)
    let baseLetter = getMostCommonLetter(pllString, consecutives)
    return baseLetter
  }

  /**
   * Stringifies the last layer. Starts from the front left, and wraps around
   * the top layer moving right.
   * @return {string} - A string of the relative solving face of each cubie.
   */
  getPllString() {
    let lastLayerStringArray = []

    let positions = [
      new THREE.Vector3(-g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(0, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, 0),
      new THREE.Vector3(g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(0, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, 0)
    ]

    let cubies = []
    for (let position of positions) {
      cubies.push(grabber.getObjectByPosition(position))
    }

    for (let cubie of cubies) {
      let direction = this._getDirectionToSolvedPosition(cubie)
      lastLayerStringArray.push(direction)
    }

    return lastLayerStringArray.join('')
  }

  /**
   * @return {string} - A relative face to where the solved position is.
   * e.x. If a cubie needs a left rotation of the yellow face to be solved,
   * will return 'l'. This is NOT the notation for the move needed.
   */
  _getDirectionToSolvedPosition(cubie) {
    let cubeState = getCubeState()
    let isCorner = getCubieColors(cubie).length === 3
    let data = f2lSolver[`get${isCorner ? 'Corner' : 'Edge'}Data`](cubie)

    let cubieFace = data[isCorner ? 'left' : 'primary']
    let currentFace = cubieFace.face
    let targetFace = cubeState.color[cubieFace.color]

    let direction = getRelativeDirection(currentFace, targetFace)
    if (direction === 1) return 'r'
    if (direction === -1) return 'l'
    if (direction === 0) return 'f'
    if (direction === 2) return 'b'

    throw 'Could not find the direction to solved position'
  }

  _getDirectionToAlgorithm(directionMap) {
    // ex: '2 -1 0 0 2 0 0 0 1'
    for (let i = 0; i < 4; i++) {
      if (this.algorithms[directionMap]) {
        return {
          direction: i === 3 ? -1 : i,
          algorithm: this.algorithms[directionMap]
        }
      }

      directionMap = this._rotateMapLeft(directionMap)
    }

    throw `Could not find correct algorithm for direction map: ${directionMap}`
  }

  _rotateMapLeft(directionMap) {
    let firstTwo = directionMap.split(' ')
    let rest = firstTwo.splice(2)
    return [...rest, ...firstTwo].join(' ')
  }
}

export default new PllSolver()

// Solution: Read last layer as a string of relative faces.
// - get a string of the last layer cubie relative positions
// - find the "base" letter -- letters (or cubies) that don't need to move
//   --> What letter is the base letter?
//       The most common letter?
//       The only letter that appears consecutively?
//       Combination of the two? I think so!
//   --> There are (a) case(s) where there is no base letter.
//       I think two. Where all corners are opposite, and where two sets of
//       two corners need to switch.
// - generate an array of directions the cubies need to go based on the base letter
// - still need to recognize the same algorithm from different positions.
// - "rotate" the generated array until it matches an algorithm
// - peform those "rotations" on the cube, then do the algorithm
// - then a last step (I think?) of a top layer move to finish
//
// llf rb ll rl
// [0, 0, 1, 2, -1, 0, 0, 2, 0]
//
// frr ll ff ff
// [0, 1, 1, -1, -1, 0, 0, 0, 0]
//

/**
 * Finds all letters that appear twice in a row in a given input string.
 *
 * @param {string} string - The input string.
 * @param {boolean} wrap - Whether to test the last letter to the first.
 * @return {array} - An array of all consecutive letters
 */
function getConsecutivelyAppearingLetters(string, wrap) {
  let letters = []
  for (let i = 0; i < string.length; i++) {
    let nextLetter = string[i + 1]
    if (!nextLetter && wrap) {
      nextLetter = string[0]
    }

    if (string[i] === nextLetter && !letters.includes(string[i])) {
      letters.push(string[i])
    }
  }
  return letters
}

/**
 * Finds the most common letter in an input string.
 *
 * @param {string} string - The input string.
 * @param {array} restraints - The possible outcomes.
 * @return {string} - The most common letter.
 */
function getMostCommonLetter(string, restraints = []) {
  let counters = {}
  if (restraints.length === 0) {
    restraints = string.split('')
  }
  for (let restraint of restraints) {
    counters[restraint] = 0
  }

  for (let i = 0; i < string.length; i++) {
    if (typeof counters[string[i]] === 'undefined') {
      continue
    }
    counters[string[i]] += 1
  }

  let highestCount = Object.values(counters).sort().reverse()[0]
  let mostCommonLetter = Object.keys(counters).find(str => counters[str] === highestCount)
  return mostCommonLetter
}

window.thing = getMostCommonLetter;
