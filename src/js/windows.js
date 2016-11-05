import THREE from 'three'
import rubiksCube from './rubiks-cube'
import animator from './animator'
import grabber from './grabber'
import g from './globals'
import scene from './scene'
import timer from './timer'
import renderer from './renderer'
import solver from './solver'
import crossSolver from './solver/cross-solver'
import f2lSolver from './solver/f2l-solver'
import ollSolver from './solver/oll-solver'

window.THREE = THREE
window.rubiksCube = rubiksCube
window.animator = animator
window.grabber = grabber
window.g = g
window.scene = scene
window.timer = timer
window.renderer = renderer
window.animator = animator
window.solver = solver
window.crossSolver = crossSolver
window.f2lSolver = f2lSolver
window.ollSolver = ollSolver
