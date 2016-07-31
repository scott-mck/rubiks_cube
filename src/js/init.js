var $ = require('jquery');
var THREE = require('three');

// var setGlobals = require('./globals');

var RubiksCube = require('./rubiks_cube');
var EventHandler = require('./event_handler');

// window.g.scene;
// window.g.camera;
// window.g.renderer;
// window.rubiksCube;
// window.eventHandler;
// window.cubeDimensions;
// window.cubieSize;
// window.cubieOffset;
// window.cubeStartPos;
// window.allCubes = [];

var init = function () {
  // setCubeGlobals(dimensions);
  // setScene();

  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors
  });
  var geometry = new THREE.BoxGeometry(g.cubieSize, g.cubieSize, g.cubieSize);
  colorCubies(geometry);

  createLeftAndRight(geometry, material);
  createUpAndDown(geometry, material);
  createFrontAndBack(geometry, material);

  g.camera.position.x = 250;
  g.camera.position.y = 300;
  g.camera.position.z = 500;
  g.camera.lookAt(new THREE.Vector3());

  var rubiksCube = new RubiksCube();
  new EventHandler(rubiksCube);
};

function addCubie(geometry, material) {
  var cubie = new THREE.Mesh(geometry.clone(), material.clone());
  var helper = new THREE.EdgesHelper(cubie, 0x000000);
  helper.material.linewidth = 7;
  cubie.name = "cubie";
  g.allCubes.push(cubie);
  g.scene.add(cubie);
  g.scene.add(helper);
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
    for (var y = 0; y < g.cubeDimensions - 2; y++) {
      for (var x = 0; x < g.cubeDimensions - 2; x++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          g.cubeStartPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - ((y + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (2 * z * g.cubeStartPos)
        );
      }
    }
  }
};

function createLeftAndRight (geometry, material) {
  for (var x = 0; x < 2; x++) {
    for (var y = 0; y < g.cubeDimensions; y++) {
      for (var z = 0; z < g.cubeDimensions; z++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          g.cubeStartPos - (2 * x * g.cubeStartPos),
          g.cubeStartPos - (y * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (z * (g.cubieSize + g.cubieOffset))
        );
      }
    }
  }
}

function createUpAndDown (geometry, material) {
  for (var y = 0; y < 2; y++) {
    for (var x = 0; x < g.cubeDimensions - 2; x++) {
      for (var z = 0; z < g.cubeDimensions; z++) {
        var cubie = addCubie(geometry, material);
        cubie.position.set(
          g.cubeStartPos - ((x + 1) * (g.cubieSize + g.cubieOffset)),
          g.cubeStartPos - (2 * y * g.cubeStartPos),
          g.cubeStartPos - (z * (g.cubieSize + g.cubieOffset))
        );
      }
    }
  }
}

// function setCubeGlobals(dimensions) {
//   g.cubeDimensions = dimensions;
//   g.cubieSize = 125 - (20 - (dimensions - 2)) * (dimensions - 2);
//   if (g.cubieSize < 40) g.cubieSize = 40;
//   g.cubieOffset = 3;
//   g.cubeStartPos = ((dimensions - 1)/2) * (g.cubieSize + g.cubieOffset);
//   g.scrambleLength = 25 + 3 * (dimensions - 3);
// }

// function setScene () {
  // var canvasWidth = $('#canvas').width();
  // var canvasHeight = $('#canvas').height();
  // var container = document.getElementById('canvas');
  //
  // g.renderer = new THREE.WebGLRenderer();
  // g.renderer.setPixelRatio(devicePixelRatio);
  // g.renderer.setSize(canvasWidth, canvasHeight);
  //
  // container.appendChild(g.renderer.domElement);
  //
  // g.camera = new THREE.PerspectiveCamera(70, canvasWidth / canvasHeight, 1, 1000);
  // g.scene = new THREE.Scene();
// }

module.exports = init;
