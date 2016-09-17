import THREE from 'three'
import grabber from './grabber'
import animator from './animator'

class RubiksCube {
  constructor() {
    this._rotateMap = {
      r: { axis: 'x', dir: -1 },
      l: { axis: 'x', dir: -1 },
      u: { axis: 'y', dir: -1 },
      d: { axis: 'y', dir: 1 },
      f: { axis: 'z', dir: -1 },
      b: { axis: 'z', dir: 1 }
    }

    this._rotateMap.x = this._rotateMap.r
    this._rotateMap.y = this._rotateMap.u

    this._queue = []
  }

  move(move) {
    /* Things that are for sure: */
    // -- Grabbing the correct cubes is TIME-SENSITIVE
    // -- Therefore! using the grabber belongs in ANIMATOR
    // -- RubiksCube should hold the chain of moves
    // -- Animator, when ready, should ask RubiksCube for the next move

    /* Steps: */
    // 1) RubiksCube immediately stores the move in a queue  --  ['r', 'd', 'f']
    // 2) RubiksCube tells animator "go for it!" --> animator.beSureToCheckMeIfYouHaveTimeOrSomething...!()
    //    --> useful only when the animator is not currently animating
    //    --> should be simple: early return if animating or just rubiksCube.nextMove()
    // 3) Animator asks RubiksCube for move details --> rubiksCube.nextMove()
    //    --> returns { move, axis, dir }
    // 4) Animator grabs correct cubes from `move` and animates
    // 5) On completion, animator asks RubiksCube for move details again

    this._queue.push(move)
    animator.continue()
  }

  nextMove() {
    let move = this._queue.shift()
    if (!move) {
      return false
    }

    let face = move[0]
    let faceDetails = this._rotateMap[face]

    let axis = faceDetails.axis
    let dir = faceDetails.dir

    if (move.indexOf('Prime') > -1) {
      dir *= -1
    }

    return { face, axis, dir }
  }
}

export default new RubiksCube()
