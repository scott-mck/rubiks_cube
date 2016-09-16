import THREE from 'three'
import grabber from './grabber'

class RubiksCube {
  constructor() {

  }

  move(letter) {
    let objects = grabber.getFace(letter)
  }
}

export default new RubiksCube()
