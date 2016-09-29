export const stringFromVector = (vector) => {
  if (Math.abs(Math.round(vector.x)) >= 1) return 'x'
  if (Math.abs(Math.round(vector.y)) >= 1) return 'y'
  if (Math.abs(Math.round(vector.z)) >= 1) return 'z'
}

export const vectorFromString = (str, mag = 1) => {
  str = str.toUpperCase()
  return new THREE.Vector3()[`set${str}`](mag)
}

export const cross = (vector1, vector2) => {
  if (typeof vector1 === 'string') vector1 = vectorFromString(vector1)
  if (typeof vector2 === 'string') vector2 = vectorFromString(vector2)

  return stringFromVector(vector1.clone().cross(vector2.clone()))
}
