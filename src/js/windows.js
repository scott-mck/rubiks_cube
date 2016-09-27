import $ from 'jquery'
import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import grabber from './grabber'
import animator from './animator'
import renderer from './renderer'
import timer from './timer'
import inputHandler from './input-handler'
import rubiksCube from './rubiks-cube'
import g from './globals'

window.$ = $
window.g = g
window.TweenMax = TweenMax
window.THREE = THREE
window.scene = scene
window.camera = camera
window.grabber = grabber
window.renderer = renderer
window.animator = animator
window.timer = timer
window.inputHandler = inputHandler
window.rubiksCube = rubiksCube

// no breakage
export default 0
