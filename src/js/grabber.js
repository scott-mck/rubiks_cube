import THREE from 'three'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'
import g from './globals'
import { vectorFromString, stringFromVector, cross } from './utils/vector'

class Grabber {
  constructor() {}

  init() {
    this.anchor1 = new THREE.Vector3(g.startPos, g.startPos, g.startPos)
    this.anchor2 = new THREE.Vector3(-g.startPos, -g.startPos, -g.startPos)

    this._faceMap = {
      r: { anchor: this.anchor1, shoot: 'z', fill: 'y', dir: -1 },
      u: { anchor: this.anchor1, shoot: 'z', fill: 'x', dir: -1 },
      f: { anchor: this.anchor1, shoot: 'x', fill: 'y', dir: -1 },
      l: { anchor: this.anchor2, shoot: 'z', fill: 'y', dir: 1 },
      d: { anchor: this.anchor2, shoot: 'z', fill: 'x', dir: 1 },
      b: { anchor: this.anchor2, shoot: 'x', fill: 'y', dir: 1 }
    }
  }

  grabFace(move) {
    if (move[0] === 'x' || move[0] === 'y') {
      return g.allCubes
    }

    let { startCoord, shoot, fill } = this._getMoveInstructions(move)
    let cubes = this.slice(startCoord, shoot, fill)

    if (move.indexOf('Double') > -1) {
      let dir = this._faceMap[move[0]].dir
      let subtractionVector = vectorFromString(cross(shoot, fill), dir * -g.cubieDistance)
      let newStartCoord = startCoord.sub(subtractionVector)

      let doubleCubes = this.slice(newStartCoord, shoot, fill)
      cubes = cubes.concat(doubleCubes)
    }

    return cubes
  }

  _getMoveInstructions(move) {
    let face = this._faceMap[move[0]]

    let startCoord = face.anchor.clone()
    let shoot = vectorFromString(face.shoot, face.dir)
    let fill = vectorFromString(face.fill)

    return { startCoord, shoot, fill }
  }

  getClickData(x, y) {
    let mouse = new THREE.Vector2()
    let raycaster = new THREE.Raycaster()

    mouse.x = (x / renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(y / renderer.domElement.clientHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    let intersects = raycaster.intersectObjects(scene.children)

    if (intersects.length === 0) {
      return null
    }

    let object = intersects[0].object
    let normal = intersects[0].face.normal

    let normalVector = new THREE.Matrix4()
    normalVector = normalVector.extractRotation(object.matrixWorld)
    normalVector = normalVector.multiplyVector3(normal.clone())

    return { object, normal: stringFromVector(normalVector) }
  }

  slice(startCoord, shoot, slice) {
    if (typeof shoot === 'string') shoot = vectorFromString(shoot, -1)
    if (typeof slice === 'string') slice = vectorFromString(slice)

    let raycaster = new THREE.Raycaster(startCoord.clone(), shoot)

    let cubes = this.raycast(raycaster)
    this.filterIntersects(cubes)
    this.fillOutFace(cubes, slice)

    return cubes
  }

  fillOutFace(intersects, dir) {
    if (typeof dir === 'string') {
      dir = vectorFromString(dir)
    }

    let cubes = intersects
    let captures = []

    let firstPoint = intersects[0].position.clone()
    let lastPoint = intersects[intersects.length - 1].position.clone()
    let point = firstPoint.clone()

    let shootDir = stringFromVector(firstPoint.sub(lastPoint))

    point = point[`set${shootDir.toUpperCase()}`](g.startPos)
    let inc = new THREE.Vector3()[`set${shootDir.toUpperCase()}`](g.cubieDistance)

    let i, raycaster
    for (i = 0; i < g.dimensions; i++) {
      raycaster = new THREE.Raycaster(point, dir)
      captures = this.raycast(raycaster)
      cubes = cubes.concat(captures)

      raycaster = new THREE.Raycaster(point, dir.negate())
      captures = this.raycast(raycaster)
      cubes = cubes.concat(captures)

      point = point.sub(inc)
    }

    this.filterIntersects(cubes)

    intersects.splice(0)
    for (i = 0; i < cubes.length; i++) {
      intersects.push(cubes[i])
    }
  }

  filterIntersects(intersects) {
    let cubes = []
    let i
    let object

    for (i = 0; i < intersects.length; i++) {
      object = intersects[i]
      if (object.name === 'cubie' && cubes.indexOf(object) === -1) {
        cubes.push(object)
      }
    }

    intersects.splice(0)
    for (i = 0; i < cubes.length; i++) {
      intersects.push(cubes[i])
    }

    return intersects
  }

  raycast(raycaster) {
    return raycaster.intersectObjects(scene.children).map(data => data.object)
  }
}

export default new Grabber()
