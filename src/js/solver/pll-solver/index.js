import rubiksCube from '../../rubiks-cube'
import f2lSolver from '../f2l-solver'

class PllSolver {
  async solve() {
    this.algorithms = {
      '0 0 0 0 0 0 0 0 0': '',
      '0 0 1 2 -1 0 0 2 0': 'i j k f k h i i f k f i j k g'
    }

    let lastLayerString = this.getLastLayerString()
    let directionMap = this.getDirectionMap(lastLayerString)

    let { direction, algorithm } = this._getDirectionToAlgorithm(directionMap)
    let positioningMove
    if (direction === 1) positioningMove = ';'
    if (direction === -1) positioningMove = 'a'
    if (direction === 2) positioningMove = '; ;'
    if (direction === 0) positioningMove = ''
    await rubiksCube.move(positioningMove)

    await rubiksCube.move(algorithm)
    return this.lastLayerMove()
  }

  /**
   * @return {string} - A string of solving directions for each cubie, with
   *                    spaces in between
   */
  getDirectionMap(lastLayerString) {
    let baseLetter = this._getBaseLetter(lastLayerString)
    return lastLayerString
      .split()
      .map(letter => getRelativeDirection(baseLetter, letter))
      .join(' ')
  }

  /**
   * Determines the "base" letter for the last layer string. 2 requirements:
   * 1) It is the most common letter in the string.
   * 2) It appears consecutively.
   * There are 2 cases where there is no base letter. Additional logic needed.
   */
  _getBaseLetter(lastLayerString) {
    let consecutives = getConsecutivelyAppearingLetters(lastLayerString)
    let baseLetter = getMostCommonLetter(lastLayerString, consectives)
    return baseLetter
  }

  /**
   * Stringifies the last layer. Starts from the front left, and wraps around
   * the top layer moving right.
   * @return {string} - A string of the relative solving face of each cubie.
   */
  getLastLayerString() {
    let lastLayerStringArray = []

    let positions = [
      new THREE.Vector3(-g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(0, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, g.startPos),
      new THREE.Vector3(g.startPos, g.startPos, 0),
      new THREE.Vector3(g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(0, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, -g.startPos),
      new THREE.Vector3(-g.startPos, g.startPos, 0),
      new THREE.Vector3(-g.startPos, g.startPos, g.startPos)
    ]

    let cubies = []
    for (let position of positions) {
      cubies.push(grabber.getObjectByPosition(position))
    }

    for (let cubie of cubies) {
      let direction = this._getDirectionToSolvedPosition(cubie)
      lastLayerStringArray.push(direction)
    }

    lastLayerStringArray.join()
  }

  /**
   * @return {string} - A relative face to where the solved position is.
   * e.x. If a cubie needs a left rotation of the yellow face to be solved,
   * will return 'l'. This is NOT the notation for the move needed.
   */
  _getDirectionToSolvedPosition(cubie) {
    let cubeState = getCubeState()
    isCorner = getCubieColors(cubie).length === 3
    let data = f2LSolver[`get${isCorner ? 'Corner' : 'Edge'}Data`]

    let cubeFace = data[isCorner ? 'left' : 'secondary']
    let currentFace = cubeFace.face
    let targetFace = cubeState.color[cubeFace].color

    let direction = f2lSolver.getDirectionToFace(currentFace, targetFace)
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

    console.log('Could not find correct algorithm for direction map:')
    console.log(directionMap)
  }

  _rotateMapLeft(directionMap) {
    // ex: '2 -1 0 0 2 0 0 0 1'
    let firstThree = directionMap.split(' ') // becomes first three items later
    let rest = firstThree.splice(3)
    return [...rest, ...firstThree].join(' ')
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
      letters.push(i)
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
function getMostCommonLetter(string, restraints) {
  let counters = {}
  if (restraints && restraints.length === 0) {
    restraints = string.split()
  }
  for (let restraint of restraints) {
    counters[restraint] = 0
  }

  for (let i = 0; i < string.length; i++) {
    if (!counters[string[i]]) {
      continue
    }
    counters[string[i]] += 1
  }

  let highestCount = Object.values(counters).sort().reverse()[0]
  let mostCommonLetter = Object.keys(counters).find(str => counters[str] === highestCount)
  return mostCommonLetter
}
