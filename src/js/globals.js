var $ = require('jquery');
var THREE = require('three');

var g = {};

function setScene() {
  var canvasWidth = $('#canvas').width();
  var canvasHeight = $('#canvas').height();
  var container = document.getElementById('canvas');

  g.renderer = new THREE.WebGLRenderer();
  g.renderer.setPixelRatio(devicePixelRatio);
  g.renderer.setSize(canvasWidth, canvasHeight);

  container.appendChild(g.renderer.domElement);

  g.camera = new THREE.PerspectiveCamera(70, canvasWidth / canvasHeight, 1, 1000);
  g.scene = new THREE.Scene();
}

var setGlobals = function(dimensions) {
  g.cubeDimensions = dimensions;

  g.cubieSize = 125 - (20 - (dimensions - 2)) * (dimensions - 2);
  if (g.cubieSize < 40) {
    g.cubieSize = 40;
  }

  g.cubieOffset = 3;
  g.cubeStartPos = ((dimensions - 1)/2) * (g.cubieSize + g.cubieOffset);
  g.scrambleLength = 25 + 3 * (dimensions - 3);

  g.allCubes = [];

  setScene();
};

var getGlobals = function() {
  return g;
};

module.exports = {
  setGlobals: setGlobals,
  getGlobals: getGlobals
};
