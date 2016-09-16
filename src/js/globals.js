import THREE from 'three'

const g = {}

export default g

export const set = (dimensions) => {
  g.cubeDimensions = dimensions
  g.cubieOffset = 3
  g.cubieSize = 125 - (20 - (g.cubeDimensions - 2)) * (g.cubeDimensions - 2)
  g.cubeStartPos = ((g.cubeDimensions - 1) / 2) * (g.cubieSize + g.cubieOffset)
  g.scrambleLength = 25 + 3 * (g.cubeDimensions - 3)
  g.allCubes = []
}

export const setAnchor1 = (cubie) => {
  g.anchor1 = cubie
}

export const setAnchor2 = (cubie) => {
  g.anchor2 = cubie
}
