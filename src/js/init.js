import THREE from 'three'
import g from './globals'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'

let material
let geometry

export default () => {
  createMesh()
  createLeftAndRight()
  createUpAndDown()
  createFrontAndBack()

  renderer.render(scene, camera)
}

const createMesh = () => {
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors
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
  helper.material.linewidth = 7;
  cubie.name = "cubie";
  g.allCubes.push(cubie);
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
    for (y = 0; y < g.cubeDimensions; y++) {
      for (z = 0; z < g.cubeDimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          g.cubeStartPos - (2 * x * g.cubeStartPos),
          g.cubeStartPos - (y * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (z * (g.cubieSize + g.cubieOffset))
        );
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
    for (x = 0; x < g.cubeDimensions - 2; x++) {
      for (z = 0; z < g.cubeDimensions; z++) {
        cubie = addCubie();
        cubie.position.set(
          g.cubeStartPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (2 * y * g.cubeStartPos),
          g.cubeStartPos - (z * (g.cubieSize + g.cubieOffset))
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
    for (y = 0; y < g.cubeDimensions - 2; y++) {
      for (x = 0; x < g.cubeDimensions - 2; x++) {
        cubie = addCubie();
        cubie.position.set(
          g.cubeStartPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - ((y + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (2 * z * g.cubeStartPos)
        );
      }
    }
  }
}
