let g = {}
g.allCubes = []

export const init = (cubeDimensions) => {
  g.dimensions = cubeDimensions
  g.cubieOffset = 0.5
  g.cubieSize = 20
  g.cubieDistance = g.cubieSize + g.cubieOffset
  g.startPos = ((g.dimensions - 1) / 2) * (g.cubieSize + g.cubieOffset)
  g.scrambleLength = 25 + 3 * (g.dimensions - 3)
  g.lineHelperWidth = 5 - (g.dimensions - 2) * 0.3
}

export default g
