import './windows'

import EventHandler from './event-handler'
import Solver from './solver'

window.addEventListener('load', () => EventHandler.init())

window.solver = new Solver()
