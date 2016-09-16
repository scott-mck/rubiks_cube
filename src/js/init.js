import THREE from 'three'
import g from './globals'
import scene from './scene'
import camera from './camera'
import renderer from './renderer'

export default () => {
  createLeftAndRight()
  createUpAndDown()
  createFrontAndBack()

  renderer.render(scene, camera)
}

const addCubie = () => {
  let cubie = new THREE.Mesh(g.geometry.clone(), g.material.clone());
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
