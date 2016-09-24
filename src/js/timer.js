import $ from 'jquery'

class Timer {
  constructor() {
    this.fps = 30
    this._elapsedTime = 0
    this.content = '0:00'
  }

  init() {
    this.$el = $('#timer')
    this.$textEl = $('<p>').text(this.content)
    this.$el.append(this.$textEl)
  }

  start() {
    if (this.timing) {
      return
    }
    this.timing = true

    this._startTime = new Date()
    this._interval = setInterval(() => {
      this._elapsedTime = (new Date() - this._startTime) / 1000
      let second = ~~this._elapsedTime
      let milli = (this._elapsedTime - second).toFixed(2).slice(2)

      this.content = `${second}:${milli}`
      this.$textEl.text(this.content)
    }, 1000 / this.fps)
  }

  stop() {
    clearInterval(this._interval)
    this.timing = false
    this._startTime = null
    this._elapsedTime = 0
  }
}

export default new Timer()
