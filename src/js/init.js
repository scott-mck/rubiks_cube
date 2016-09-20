import THREE from 'three'
import scene from './scene'
import grabber from './grabber'
import inputHandler from './input-handler'
import animator from './animator'
import g from './globals'

export default () => {
  createMesh()
  createLeftAndRight()
  createUpAndDown()
  createFrontAndBack()

  camera.position.x += 40 + ((g.dimensions - 2) * 25)
  camera.position.y += 40 + ((g.dimensions - 2) * 25)
  camera.position.z += 60 + ((g.dimensions - 2) * 35)
  camera.lookAt(new THREE.Vector3());

  inputHandler.init()
  grabber.init()
  animator.init()
}

let material
let geometry

const createMesh = () => {
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
    side: THREE.DoubleSide
  })

  geometry = new THREE.BoxGeometry(
    g.cubieSize,
    g.cubieSize,
    g.cubieSize
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
  helper.material.linewidth = g.lineHelperWidth;
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
    for (y = 0; y < g.dimensions; y++) {
      for (z = 0; z < g.dimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          g.startPos - (2 * x * g.startPos),
          g.startPos - (y * (g.cubieSize + g.cubieOffset)),
          g.startPos - (z * (g.cubieSize + g.cubieOffset))
        );

        let d = g.dimensions - 1
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
    for (x = 0; x < g.dimensions - 2; x++) {
      for (z = 0; z < g.dimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          g.startPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.startPos - (2 * y * g.startPos),
          g.startPos - (z * (g.cubieSize + g.cubieOffset))
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
    for (y = 0; y < g.dimensions - 2; y++) {
      for (x = 0; x < g.dimensions - 2; x++) {
        cubie = addCubie();
        cubie.position.set(
          g.startPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.startPos - ((y + 1) * (g.cubieSize + g.cubieOffset)),
          g.startPos - (2 * z * g.startPos)
        );
      }
    }
  }
}
