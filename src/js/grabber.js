import THREE from 'three'
import scene from './scene'
import g from './globals'
import { vectorFromString, stringFromVector } from './utils/vector'

class Grabber {
  constructor() {}

  setAnchor1(cube) {
    this.anchor1 = cube.position.clone()
  }

  setAnchor2(cube) {
    this.anchor2 = cube.position.clone()
  }

  init() {
    this._faceMap = {
      r: { anchor: this.anchor1, shoot: 'z', fill: 'y', dir: -1 },
      u: { anchor: this.anchor1, shoot: 'z', fill: 'x', dir: -1 },
      f: { anchor: this.anchor1, shoot: 'x', fill: 'y', dir: -1 },
      l: { anchor: this.anchor2, shoot: 'z', fill: 'y', dir: 1 },
      d: { anchor: this.anchor2, shoot: 'z', fill: 'x', dir: 1 },
      b: { anchor: this.anchor2, shoot: 'x', fill: 'y', dir: 1 }
    }
  }

  grabFace(str, doubleMove = false) {
    if (str[0] === 'x' || str[0] === 'y') {
      return g.allCubes
    }

    let face = this._faceMap[str]

    let shootDir = vectorFromString(face.shoot, face.dir)
    let fillDir = vectorFromString(face.fill)

    let raycaster = new THREE.Raycaster(face.anchor, shootDir)
    let intersects = this.raycast(raycaster)

    this.filterIntersects(intersects)
    this.fillOutFace(intersects, fillDir)

    if (doubleMove) {
      let subtractVector = vectorFromString('x', g.cubieSize * face.dir * -1)
      let newAnchorPos = face.anchor.clone().sub(subtractVector)
      raycaster = new THREE.Raycaster(newAnchorPos, shootDir)

      let doubleIntersects = this.raycast(raycaster)
      this.filterIntersects(doubleIntersects)
      this.fillOutFace(doubleIntersects, fillDir)
      intersects = intersects.concat(doubleIntersects)
    }

    return intersects
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

  slice(startPos, shootDir, sliceDir) {
    if (typeof shootDir === 'string') shootDir = vectorFromString(shootDir, -1)
    if (typeof sliceDir === 'string') sliceDir = vectorFromString(sliceDir)

    let raycaster = new THREE.Raycaster(startPos.clone(), shootDir)

    let cubes = this.raycast(raycaster)
    this.filterIntersects(cubes)
    this.fillOutFace(cubes, sliceDir)

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
