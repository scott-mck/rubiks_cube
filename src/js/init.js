var $ = require('jquery');
var THREE = require('three');

var setCubeGlobals = require('./cube_globals').set;
var RubiksCube = require('./rubiks_cube');
var EventHandler = require('./event_handler');

var scene, camera, renderer;
var rubiksCube, eventHandler;
var allCubes = [];

var init = function (dimensions) {
  setCubeGlobals(dimensions);
  setScene();

  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors
  });
  var geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
  colorCubies(geometry);

  createLeftAndRight(geometry, material);
  createUpAndDown(geometry, material);
  createFrontAndBack(geometry, material);

  camera.position.x = 250;
  camera.position.y = 300;
  camera.position.z = 500;
  camera.lookAt(new THREE.Vector3());

  rubiksCube = new RubiksCube();
  eventHandler = new EventHandler(rubiksCube);
};

function addCubie(geometry, material) {
  var cubie = new THREE.Mesh(geometry.clone(), material.clone());
  var helper = new THREE.EdgesHelper(cubie, 0x000000);
  helper.material.linewidth = 7;
  cubie.name = "cubie";
  allCubes.push(cubie);
  scene.add(cubie);
  scene.add(helper);
  return cubie;
}

function colorCubies (geometry) {
  // Color right face RED
  geometry.faces[0].color.setRGB(1, 0, 0);
  geometry.faces[1].color.setRGB(1, 0, 0);
  // Color left face ORANGE
  geometry.faces[2].color.setRGB(1, .5, 0);
  geometry.faces[3].color.setRGB(1, .5, 0);
  // Color top face YELLOW
  geometry.faces[4].color.setRGB(1, 1, 0);
  geometry.faces[5].color.setRGB(1, 1, 0);
  // Color down face WHITE
  geometry.faces[6].color.setRGB(1, 1, 1);
  geometry.faces[7].color.setRGB(1, 1, 1);
  // Color front face BLUE
  geometry.faces[8].color.setRGB(0, 0, 1);
  geometry.faces[9].color.setRGB(0, 0, 1);
  // Color back face GREEN
  geometry.faces[10].color.setRGB(0, 1, 0);
  geometry.faces[11].color.setRGB(0, 1, 0);
}

function createFrontAndBack (geometry, material) {
  for (var z = 0; z < 2; z++) {
    for (var y = 0; y < cubeDimensions - 2; y++) {
      for (var x = 0; x < cubeDimensions - 2; x++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          cubeStartPos - ((x + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - ((y + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - (2 * z * cubeStartPos)
        );
      }
    }
  }
};

function createLeftAndRight (geometry, material) {
  for (var x = 0; x < 2; x++) {
    for (var y = 0; y < cubeDimensions; y++) {
      for (var z = 0; z < cubeDimensions; z++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          cubeStartPos - (2 * x * cubeStartPos),
          cubeStartPos - (y * (cubieSize + cubieOffset)),
          cubeStartPos - (z * (cubieSize + cubieOffset))
        );
      }
    }
  }
}

function createUpAndDown (geometry, material) {
  for (var y = 0; y < 2; y++) {
    for (var x = 0; x < cubeDimensions - 2; x++) {
      for (var z = 0; z < cubeDimensions; z++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          cubeStartPos - ((x + 1) * (cubieSize + cubieOffset)),
          cubeStartPos - (2 * y * cubeStartPos),
          cubeStartPos - (z * (cubieSize + cubieOffset))
        );
      }
    }
  }
}

// function setCubeGlobals(dimensions) {
  // cubeDimensions = dimensions;
  // cubieSize = 125 - (20 - (cubeDimensions - 2)) * (cubeDimensions - 2);
  // if (cubieSize < 40) cubieSize = 40;
  // cubieOffset = 3;
  // cubeStartPos = ((cubeDimensions - 1)/2) * (cubieSize + cubieOffset);
  // scrambleLength = 25 + 3 * (cubeDimensions - 3);
// }

function setScene () {
  var canvasWidth = $('#canvas').width();
  var canvasHeight = $('#canvas').height();
  container = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(70, canvasWidth / canvasHeight, 1, 1000);
  scene = new THREE.Scene();
}

module.exports = init;
