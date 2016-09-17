import $ from 'jquery'
import TweenMax from 'gsap'
import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import g from './globals'
import grabber from './grabber'
import eventHandler from './event-handler'

window.$ = $
window.TweenMax = TweenMax
window.THREE = THREE
window.scene = scene
window.camera = camera
window.renderer = renderer
window.g = g
window.grabber = grabber
window.eventHandler = eventHandler