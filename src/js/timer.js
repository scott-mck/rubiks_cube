const DEFAULT_COLOR = 'rgb(0, 0, 0)'
const SUCCESS_COLOR = 'rgb(0, 200, 0)'

class Timer {
  constructor() {
    this._elapsedTime = 0
    this._timeline = new TimelineMax({ paused : true })
  }

  init() {
    this.el = document.querySelector('#timer')
    this.minuteEl = this.el.querySelector('.minute')
    this.secondEl = this.el.querySelector('.second')
    this.milliEl = this.el.querySelector('.milli')

    TweenMax.set(this.el, { color: DEFAULT_COLOR })
    TweenMax.to(this.el, 0.5, { opacity: 1 })
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
    if (!this.timing) {
      return
    }

    clearInterval(this._interval)
    this._timeline.stop()
    this.timing = false

    new TimelineMax()
      .to(this.el, 0.1, { scale: 1.1, color: SUCCESS_COLOR })
      .to(this.el, 0.1, { scale: 1 })
  }

  reset() {
    this._timeline = new TimelineMax({ paused: true })

    TweenMax.to(this, 1, {
      _elapsedTime: `-=${this._elapsedTime}`,
      ease: Circ.easeInOut,
      onUpdate: () => this._updateContent()
    })
    TweenMax.to(this.el, 1, { color: DEFAULT_COLOR })
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
    let minute = ~~(this._elapsedTime / 60 / 60)
    let second = ~~(this._elapsedTime / 60)
    let milli = ~~(this._elapsedTime * 100 / 60) % 100

    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
    if (milli < 10) {
      milli = '0' + milli
    }

    this.minuteEl.textContent = minute
    this.secondEl.textContent = second
    this.milliEl.textContent = milli
  }
}

export default new Timer()
