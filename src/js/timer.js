import $ from 'jquery'

class Timer {
  constructor() {
    this.fps = 30
    this._elapsedTime = 0
  }

  init() {
    this.$el = $('#timer')
    this.$textEl = $('<p>')
    this.$el.append(this.$textEl)
    this._updateContent()
  }

  start() {
    if (this.timing) {
      return
    }
    this.timing = true

    this._startTime = new Date()
    this._interval = setInterval(() => {
      this._elapsedTime = (new Date() - this._startTime) / 1000
      let minute = ~~(this._elapsedTime / 60)
      let second = ~~(this._elapsedTime % 60)
      let milli = (this._elapsedTime - (minute * 60) - second).toFixed(2).slice(2)

      this._updateContent(minute, second, milli)
    }, 1000 / this.fps)
  }

  stop() {
    clearInterval(this._interval)
    this.timing = false
    this._startTime = null
    this._elapsedTime = 0
  }

  reset() {
    this._updateContent()
    this.$textEl.text(this.content)
  }

  _updateContent(minute = 0, second = 0, milli = 0) {
    if (minute < 10) {
      minute = '0' + minute
    }
    if (milli === 0) {
      milli = '0' + milli
    }

    this.content = `${minute}:${second}.${milli}`
    this.$textEl.text(this.content)
  }
}

export default new Timer()
