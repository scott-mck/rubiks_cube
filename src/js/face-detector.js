import THREE from 'three'
import scene from './scene'

class FaceDetector {
  constructor() {

  }

  setAnchor1(cubie) {
    this.anchor1 = cubie
  }

  setAnchor2(cubie) {
    this.anchor2 = cubie
  }

  right() {
    let raycaster = new THREE.Raycaster(
      this.anchor1.position,
      new THREE.Vector3().setZ(-1)
    )
    let intersects = this.raycast(raycaster)
    intersects.push(this.anchor1)
    this.filterIntersects(intersects)
    this.fillOutFace(intersects)

    return intersects
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
  }

  fillOutFace(intersects) {
    let cubes = intersects
    let raycastDir = new THREE.Vector3().setY(-1)
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

  raycast(raycaster) {
    return raycaster.intersectObjects(scene.children).map((data) => {
      return data.object
    })
  }

  test() {
    let i
    let right = this.right()
    for (i = 0; i < right.length; i++) {
      scene.remove(right[i])
    }
    renderer.render(scene, camera)
  }
}

export default new FaceDetector()
