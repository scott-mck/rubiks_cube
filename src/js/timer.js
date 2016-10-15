import $ from 'jquery'

class Timer {
  constructor() {
    this._elapsedTime = 0
    this._timeline = new TimelineMax({ paused : true })
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
    this._elapsedTime = 0
    this._animate()
    this._interval = setInterval(() => this._animate(), 1000)
  }

  stop() {
    clearInterval(this._interval)
    this._timeline.stop()
    this._timeline = new TimelineMax({ paused: true })
    this.timing = false
  }

  reset() {
    this._timeline.to(this, 1, {
      _elapsedTime: `-=${this._elapsedTime}`,
      ease: Circ.easeInOut,
      onUpdate: () => this._updateContent()
    })
    this._timeline.play()
  }

  _animate() {
    this._timeline.to(this, 1, {
      _elapsedTime: '+=60',
      ease: 'linear',
      onUpdate: () => this._updateContent()
    });

    this._timeline.play()
  }

  _updateContent() {
    let minute = ~~(this._elapsedTime / 60)
    let second = ~~(this._elapsedTime % 60)
    let milli = (this._elapsedTime - (minute * 60) - second).toFixed(2).slice(2)

    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
    if (milli === 0) {
      milli = '0' + milli
    }

    this.content = `${minute}:${second}.${milli}`
    this.$textEl.text(this.content)
  }
}

export default new Timer()
