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
    let intersects = this.filterIntersects(raycaster.intersectObjects(scene.children))
    intersects.push(this.anchor1)

    intersects = intersects.concat(this.fillOutFace(intersects))

    return intersects
  }

  filterIntersects(intersects) {
    let cubes = []
    let i
    let object

    for (i = 0; i < intersects.length; i++) {
      object = intersects[i].object
      if (object.name === 'cubie' && cubes.indexOf(object) === -1) {
        cubes.push(object)
      }
    }
    return cubes
  }

  fillOutFace(intersects) {
    let cubes = []
    let raycastDir = new THREE.Vector3().setY(-1)
    let i
    let cube
    let raycaster

    for (i = 0; i < intersects.length; i++) {
      cube = intersects[i]
      raycaster = new THREE.Raycaster(cube.position, raycastDir)
      cubes = cubes.concat(raycaster.intersectObjects(scene.children))
    }

    cubes = this.filterIntersects(cubes)
    return cubes
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
