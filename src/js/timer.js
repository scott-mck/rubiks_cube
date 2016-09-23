import $ from 'jquery'

class Timer {
  constructor() {
    this.$el = $('<div id="timer">').text('0.00')
  }

  init() {
    $('body').append(this.$el)
  }
}

export default new Timer()
