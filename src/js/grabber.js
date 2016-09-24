import THREE from 'three'
import scene from './scene'
import g from './globals'

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
      r: { anchor: this.anchor1, shoot: ['z', 'y'], dir: -1 },
      u: { anchor: this.anchor1, shoot: ['z', 'x'], dir: -1 },
      f: { anchor: this.anchor1, shoot: ['x', 'y'], dir: -1 },
      l: { anchor: this.anchor2, shoot: ['z', 'y'], dir: 1 },
      d: { anchor: this.anchor2, shoot: ['z', 'x'], dir: 1 },
      b: { anchor: this.anchor2, shoot: ['x', 'y'], dir: 1 }
    }
  }

  grabFace(str) {
    if (str[0] === 'x' || str[0] === 'y') {
      return scene.children.filter(object => object.name === 'cubie')
    }

    this._face = this._faceMap[str]

    let shootAxis = this._face.shoot[0].toUpperCase()
    let shootDir = new THREE.Vector3()[`set${shootAxis}`](1 * this._face.dir)

    let fillAxis = this._face.shoot[1].toUpperCase()
    let fillDir = new THREE.Vector3()[`set${fillAxis}`](1)

    let raycaster = new THREE.Raycaster(this._face.anchor, shootDir)
    let intersects = this.raycast(raycaster)

    this.filterIntersects(intersects)

    this.fillOutFace(intersects, fillDir)

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

    return { object, normal: this.axisFromVector(normalVector) }
  }

  shoot(cube, direction) {
    if (typeof direction === 'string') {
      direction = this.vectorFromAxis(direction)
    }

    let point = cube.position.clone()
    direction.negate()
    let raycaster = new THREE.Raycaster(point, direction)

    return this.filterIntersects(this.raycast(raycaster))
  }

  fillOutFace(intersects, dir) {
    if (typeof dir === 'string') {
      dir = this.vectorFromAxis(dir)
    }

    let cubes = intersects
    let captures = []

    let firstPoint = intersects[0].position.clone()
    let lastPoint = intersects[intersects.length - 1].position.clone()
    let point = firstPoint.clone()

    let shootDir = this.axisFromVector(firstPoint.sub(lastPoint))

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

  axisFromVector(vector) {
    if (Math.abs(Math.round(vector.x)) >= 1) return 'x'
    if (Math.abs(Math.round(vector.y)) >= 1) return 'y'
    if (Math.abs(Math.round(vector.z)) >= 1) return 'z'
  }

  vectorFromAxis(str, mag = 1) {
    str = str.toUpperCase()
    return new THREE.Vector3()[`set${str}`](mag)
  }
}

export default new Grabber()
