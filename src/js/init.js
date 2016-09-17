import THREE from 'three'
import scene from './scene'
import grabber from './grabber'
import inputHandler from './input-handler'
import animator from './animator'

let material
let geometry
let cubeDimensions
let cubieOffset
let cubieSize
let cubeStartPos
let scrambleLength

export default (dimensions) => {
  cubeDimensions = dimensions
  cubieOffset = 3
  cubieSize = 125 - (20 - (cubeDimensions - 2)) * (cubeDimensions - 2)
  cubeStartPos = ((cubeDimensions - 1) / 2) * (cubieSize + cubieOffset)
  scrambleLength = 25 + 3 * (cubeDimensions - 3)

  createMesh()
  createLeftAndRight()
  createUpAndDown()
  createFrontAndBack()

  inputHandler.init()
  grabber.init()
  animator.init()
}

const createMesh = () => {
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
    side: THREE.DoubleSide
  })

  geometry = new THREE.BoxGeometry(
    cubieSize,
    cubieSize,
    cubieSize
  )
  // Color right face RED
  geometry.faces[0].color.setRGB(1, 0, 0)
  geometry.faces[1].color.setRGB(1, 0, 0)
  // Color left face ORANGE
  geometry.faces[2].color.setRGB(1, .5, 0)
  geometry.faces[3].color.setRGB(1, .5, 0)
  // Color top face YELLOW
  geometry.faces[4].color.setRGB(1, 1, 0)
  geometry.faces[5].color.setRGB(1, 1, 0)
  // Color down face WHITE
  geometry.faces[6].color.setRGB(1, 1, 1)
  geometry.faces[7].color.setRGB(1, 1, 1)
  // Color front face BLUE
  geometry.faces[8].color.setRGB(0, 0, 1)
  geometry.faces[9].color.setRGB(0, 0, 1)
  // Color back face GREEN
  geometry.faces[10].color.setRGB(0, 1, 0)
  geometry.faces[11].color.setRGB(0, 1, 0)
}

const addCubie = () => {
  let cubie = new THREE.Mesh(geometry.clone(), material.clone());
  let helper = new THREE.EdgesHelper(cubie, 0x000000);
  helper.material.linewidth = 7;
  cubie.name = "cubie";
  scene.add(cubie);
  scene.add(helper);
  return cubie;
}

const createLeftAndRight = () => {
  let x
  let y
  let z
  let cubie

  for (x = 0; x < 2; x++) {
    for (y = 0; y < cubeDimensions; y++) {
      for (z = 0; z < cubeDimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          cubeStartPos - (2 * x * cubeStartPos),
          cubeStartPos - (y * (cubieSize + cubieOffset)),
          cubeStartPos - (z * (cubieSize + cubieOffset))
        );

        let d = cubeDimensions - 1
        if (x === 0 && y === 0 && z === 0) grabber.setAnchor1(cubie)
        if (x === 1 && y === d && z === d) grabber.setAnchor2(cubie)
      }
    }
  }
}
const createUpAndDown = () => {
  let x
  let y
  let z
  let cubie

  for (y = 0; y < 2; y++) {
    for (x = 0; x < cubeDimensions - 2; x++) {
      for (z = 0; z < cubeDimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          cubeStartPos - ((x + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - (2 * y * cubeStartPos),
          cubeStartPos - (z * (cubieSize + cubieOffset))
        );
      }
    }
  }
}
const createFrontAndBack = () => {
  let x
  let y
  let z
  let cubie

  for (z = 0; z < 2; z++) {
    for (y = 0; y < cubeDimensions - 2; y++) {
      for (x = 0; x < cubeDimensions - 2; x++) {
        cubie = addCubie();
        cubie.position.set(
          cubeStartPos - ((x + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - ((y + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - (2 * z * cubeStartPos)
        );
      }
    }
  }
}
