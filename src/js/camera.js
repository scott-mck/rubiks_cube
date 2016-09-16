import THREE from 'three'

let fo
let a
let n
let fa

export const setCamera = (fov, aspect, near, far) => {
  fo = fov
  a = aspect
  n = near
  fa = far
}

let camera = new THREE.PerspectiveCamera(fo, a, n, fa)
camera.position.x = 250;
camera.position.y = 300;
camera.position.z = 500;
camera.lookAt(new THREE.Vector3());

export default camera
