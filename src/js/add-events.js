import $ from 'jquery'
import TweenMax from 'gsap'
import init from './init'

let DURATION = 0.7

export default () => {

  $(window).click((e) => {
    e.preventDefault()
  })

  $(document).ready(() => {
    let $select = $('.select')

    TweenMax.to($select, DURATION, {
      opacity: 1,
      y: 50,
      ease: Power3.easeOut
    })

    $select.click((e) => {

      TweenMax.to($select, DURATION, {
        opacity: 0,
        y: 0,
        ease: Power3.easeOut,
        onComplete: () => {
          $select.hide()
          init()
        }
      })

    })
  })

}
