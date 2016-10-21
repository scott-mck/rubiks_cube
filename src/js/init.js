import THREE from 'three'
import scene from './scene'
import grabber from './grabber'
import camera from './camera'
import inputHandler from './input-handler'
import animator from './animator'
import g from './globals'
import timer from './timer'

export default () => {
  createMeshes()
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
  timer.init()

  setTimeout(() => {
    let opacity = g.dimensions > 5 ? 0 : 1

    colorTopFace(opacity)
    colorRightFace(opacity)
    colorFrontFace(opacity)
    colorDownFace(opacity)
    colorLeftFace(opacity)
    colorBackFace(opacity)
  }, 100)
}

let material
let geometry

let colorDepth
let colorSize

let createMeshes = () => {
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
    side: THREE.DoubleSide
  })

  geometry = new THREE.BoxGeometry(g.cubieSize, g.cubieSize, g.cubieSize)

  colorDepth = 1
  colorSize = g.cubieSize * 0.93

  if (g.dimensions > 5) {
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
}

let addCubie = () => {
  let cubie = new THREE.Mesh(geometry.clone(), material.clone());
  let helper = new THREE.EdgesHelper(cubie, 0x000000);
  helper.material.linewidth = g.lineHelperWidth;
  cubie.name = "cubie";
  g.allCubes.push(cubie)
  scene.add(cubie);
  scene.add(helper);
  return cubie;
}

let createLeftAndRight = () => {
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
      }
    }
  }
}
let createUpAndDown = () => {
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
let createFrontAndBack = () => {
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

/* Color the faces */

let colorTopFace = (opacity) => {
  let color = new THREE.Color().setRGB(1, 1, 0) // yellow
  let colorGeometry = new THREE.BoxGeometry(colorSize, colorDepth, colorSize)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('u')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.y += g.cubieSize / 2
  })
}

let colorRightFace = (opacity) => {
  let color = new THREE.Color().setRGB(1, 0, 0) // red
  let colorGeometry = new THREE.BoxGeometry(colorDepth, colorSize, colorSize)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('r')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.x += g.cubieSize / 2
  })
}

let colorFrontFace = (opacity) => {
  let color = new THREE.Color().setRGB(0, 0, 1) // blue
  let colorGeometry = new THREE.BoxGeometry(colorSize, colorSize, colorDepth)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('f')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.z += g.cubieSize / 2
  })
}

let colorDownFace = (opacity) => {
  let color = new THREE.Color().setRGB(1, 1, 1) // white
  let colorGeometry = new THREE.BoxGeometry(colorSize, colorDepth, colorSize)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('d')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.y -= g.cubieSize / 2
  })
}

let colorLeftFace = (opacity) => {
  let color = new THREE.Color().setRGB(1, 0.5, 0) // orange
  let colorGeometry = new THREE.BoxGeometry(colorDepth, colorSize, colorSize)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('l')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.x -= g.cubieSize / 2
  })
}


let colorBackFace = (opacity) => {
  let color = new THREE.Color().setRGB(0, 1, 0) // green
  let colorGeometry = new THREE.BoxGeometry(colorSize, colorSize, colorDepth)
  let colorMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity })

  let topCubes = grabber.grabFace('b')
  topCubes.forEach((cubie) => {
    let cubieFace = new THREE.Mesh(colorGeometry.clone(), colorMaterial.clone())
    cubie.add(cubieFace)
    cubieFace.position.z -= g.cubieSize / 2
  })
}
