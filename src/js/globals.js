import THREE from 'three'

const g = {}

g.cubeDimensions = 3
g.cubieOffset = 3
g.cubieSize = 125 - (20 - (g.cubeDimensions - 2)) * (g.cubeDimensions - 2)
g.cubeStartPos = ((g.cubeDimensions - 1) / 2) * (g.cubieSize + g.cubieOffset)
g.scrambleLength = 25 + 3 * (g.cubeDimensions - 3)
g.allCubes = []

g.material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  vertexColors: THREE.FaceColors
})

g.geometry = new THREE.BoxGeometry(
  g.cubieSize,
  g.cubieSize,
  g.cubieSize
)

// Color right face RED
g.geometry.faces[0].color.setRGB(1, 0, 0)
g.geometry.faces[1].color.setRGB(1, 0, 0)
// Color left face ORANGE
g.geometry.faces[2].color.setRGB(1, .5, 0)
g.geometry.faces[3].color.setRGB(1, .5, 0)
// Color top face YELLOW
g.geometry.faces[4].color.setRGB(1, 1, 0)
g.geometry.faces[5].color.setRGB(1, 1, 0)
// Color down face WHITE
g.geometry.faces[6].color.setRGB(1, 1, 1)
g.geometry.faces[7].color.setRGB(1, 1, 1)
// Color front face BLUE
g.geometry.faces[8].color.setRGB(0, 0, 1)
g.geometry.faces[9].color.setRGB(0, 0, 1)
// Color back face GREEN
g.geometry.faces[10].color.setRGB(0, 1, 0)
g.geometry.faces[11].color.setRGB(0, 1, 0)


export default g
