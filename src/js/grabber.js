import THREE from 'three'
import scene from './scene'

class Grabber {
  constructor() {}

  setAnchor1(cube) {
    this.anchor1 = cube
  }

  setAnchor2(cube) {
    this.anchor2 = cube
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

  getFace(str) {
    this._face = this._faceMap[str]
    let setAxis = 'set' + this._face.shoot[0].toUpperCase()

    let raycaster = new THREE.Raycaster(
      this._face.anchor.position,
      new THREE.Vector3()[setAxis](1 * this._face.dir)
    )

    let intersects = this._raycast(raycaster)
    intersects.push(this._face.anchor)
    this._filterIntersects(intersects)
    this._fillOutFace(intersects)

    return intersects
  }

  _filterIntersects(intersects) {
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
  }

  _fillOutFace(intersects) {
    let setAxis = 'set' + this._face.shoot[1].toUpperCase()
    let raycastDir = new THREE.Vector3()[setAxis](1 * this._face.dir)
    let cubes = intersects
    let captures = []

    let i
    let cube
    let raycaster
    for (i = 0; i < intersects.length; i++) {
      cube = intersects[i]
      raycaster = new THREE.Raycaster(cube.position, raycastDir)
      captures = this.raycast(raycaster)
      cubes = cubes.concat(captures)
    }

    intersects.splice(0)
    for (i = 0; i < cubes.length; i++) {
      intersects.push(cubes[i])
    }
  }

  _raycast(raycaster) {
    return raycaster.intersectObjects(scene.children).map((data) => {
      return data.object
    })
  }

  // test(str) {
  //   let i
  //   let face = this.getFace(str)
  //   for (i = 0; i < face.length; i++) {
  //     scene.remove(face[i])
  //   }
  //   renderer.render(scene, camera)
  // }
}

export default new Grabber()
