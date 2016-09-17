import $ from 'jquery'
import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import animator from './animator'
import renderer from './renderer'
import grabber from './grabber'
import inputHandler from './input-handler'

window.$ = $
window.TweenMax = TweenMax
window.THREE = THREE
window.scene = scene
window.camera = camera
window.renderer = renderer
window.grabber = grabber
window.inputHandler = inputHandler
window.animator = animator
