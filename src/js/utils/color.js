export const color = ({ r, g, b }) => {
  if (r === 1 && g === 1 && b === 1) return 'white'
  if (r === 1 && g === 1) return 'yellow'
  if (r === 1 && g === 0.5) return 'orange'
  if (r === 1) return 'red'
  if (g === 1) return 'green'
  if (b === 1) return 'blue'
}

export const getCubieColors = (cubie) => {
	return cubie.children.map(cubieColor => color(cubieColor.material.color))
}
