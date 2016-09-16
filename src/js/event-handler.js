import $ from 'jquery'
import rubiksCube from './rubiks-cube'

class EventHandler {
  constructor() {
    this.addEvents()
  }

  addEvents() {
    $(window).on('keyup', (e) => {
      let letter = String.fromCharCode(e.keyCode)
      rubiksCube.move(letter)
    })
  }
}

export default EventHandler
