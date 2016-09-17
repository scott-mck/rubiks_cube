import $ from 'jquery'
import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import grabber from './grabber'
import animator from './animator'
import renderer from './renderer'
import inputHandler from './input-handler'

window.$ = $
window.TweenMax = TweenMax
window.THREE = THREE
window.scene = scene
window.camera = camera
window.grabber = grabber
window.renderer = renderer
window.animator = animator
window.inputHandler = inputHandler
