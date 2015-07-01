// TODO: Refactor reset methods
// TODO: Do not store a virtual cube
// TODO: Write moves to change middles

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var RightIndices = [0,  1,  2,  3,  4,  5,  6,  7,  8];
  var FrontIndices = [18, 9,  0,  21, 12, 3,  24, 15, 6];
  var UpIndices    = [20, 11, 2,  19, 10, 1,  18, 9,  0];
  var LeftIndices  = [20, 19, 18, 23, 22, 21, 26, 25, 24];
  var DownIndices  = [24, 15, 6,  25, 16, 7,  26, 17, 8];
  var BackIndices  = [2,  11, 20, 5,  14, 23, 8,  17, 26];

  var Cube = window.Game.Cube = function (scene, camera, cubes) {
    this.cubes = cubes;

    // Create an internal cube to check if solved
    this.virtualCube = new Game.VirtualCube();
    this.isSolved = false;
    this.animating = false; // No simultaneous moves

    this.right = {
      cubes: [],
      axis: 'x',
      dir: -1
    };

    this.left = {
      cubes: [],
      axis: 'x',
      dir: 1
    };

    this.up = {
      cubes: [],
      axis: 'y',
      dir: -1
    };

    this.down = {
      cubes: [],
      axis: 'y',
      dir: 1
    };

    this.back = {
      cubes: [],
      axis: 'z',
      dir: 1
    };

    this.front = {
      cubes: [],
      axis: 'z',
      dir: -1
    };

    for (var i = 0; i < 9; i++) {
      this.right.cubes.push(cubes[RightIndices[i]]);
      this.left.cubes.push(cubes[LeftIndices[i]]);
      this.up.cubes.push(cubes[UpIndices[i]]);
      this.down.cubes.push(cubes[DownIndices[i]]);
      this.back.cubes.push(cubes[BackIndices[i]]);
      this.front.cubes.push(cubes[FrontIndices[i]]);
    }

    this.possibleMoves = [this.r, this.rPrime, this.l, this.lPrime, this.u,
      this.uPrime, this.f, this.fPrime, this.d, this.dPrime, this.b, this.bPrime];
  };

  Cube.prototype.moveMap = {
    'r': 'i',
    'rPrime': 'k',
    'u': 'j',
    'uPrime': 'f',
    'l': 'd',
    'lPrime': 'e',
    'f': 'h',
    'fPrime': 'g',
    'd': 's',
    'dPrime': 'l',
    'b': 'q',
    'bPrime': 'p'
  };

  Cube.prototype.faceAxes = {
    'front': 'z',
    'back': 'z',
    'right': 'x',
    'left': 'x',
    'up': 'y',
    'down': 'y'
  };

  Cube.prototype.animate = function (rotatingFace, face, axis, dir, callback) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, face, axis, dir, callback);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 16;
    renderer.render(scene, camera);

    function resetRotatingFace(face) {
      for (var i = 0; i < face.length; i++) {
        THREE.SceneUtils.detach(face[i], rotatingFace, scene);
      }
      scene.remove(rotatingFace);
      rotatingFace = undefined;
    }

    // when rotatingFace is done rotating, detach cubes and delete from memory
    if (rotatingFace.rotation[axis] >= Math.PI / 2 ||
          rotatingFace.rotation[axis] <= -Math.PI / 2) {
      cancelAnimationFrame(id);
      resetRotatingFace(face);
      callback && callback();
      this.animating = false;
      if (this.solved()) {
        this.isSolved = true;
      }
    }
  };

  Cube.prototype.move = function (name, face) {
    // ex: 'rPrime', 'right'
    this.virtualCube[name]();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this[face].cubes[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);

    // The name of the reset method for this face
    var reset = 'reset' + face[0].toUpperCase() + face.slice(1, face.length);
    var dir = this[face].dir;
    if (name.indexOf('Prime') > -1) {
      dir *= -1;
    }

    this.animate(
      rotatingFace,
      this[face].cubes,
      this[face].axis,
      dir,
      this[reset].bind(this, dir * -1)
    );
  };

  Cube.prototype.b = function b () {
    this.move('b', 'back');
  };

  Cube.prototype.bPrime = function bPrime () {
    this.move('bPrime', 'back');
  };

  Cube.prototype.d = function d () {
    this.move('d', 'down');
  };

  Cube.prototype.dPrime = function dPrime () {
    this.move('dPrime', 'down');
  };

  Cube.prototype.f = function f () {
    this.move('f', 'front');
  };

  Cube.prototype.fPrime = function fPrime () {
    this.move('fPrime', 'front');
  };

  Cube.prototype.l = function l () {
    this.move('l', 'left');
  };

  Cube.prototype.lPrime = function lPrime () {
    this.move('lPrime', 'left');
  };

  Cube.prototype.r = function r () {
    this.move('r', 'right');
  };

  Cube.prototype.resetBack = function (dir) {
    if (dir == 1) {
      this.back.cubes = this.rotateCounterClockwise(this.back.cubes);
    } else if (dir == -1) {
      this.back.cubes = this.rotateClockwise(this.back.cubes);
    }

    this.up.cubes[0] = this.back.cubes[2], this.up.cubes[1] = this.back.cubes[1], this.up.cubes[2] = this.back.cubes[0];
    this.left.cubes[0] = this.back.cubes[2], this.left.cubes[3] = this.back.cubes[5], this.left.cubes[6] = this.back.cubes[8];
    this.down.cubes[6] = this.back.cubes[8], this.down.cubes[7] = this.back.cubes[7], this.down.cubes[8] = this.back.cubes[6];
    this.right.cubes[2] = this.back.cubes[0], this.right.cubes[5] = this.back.cubes[3], this.right.cubes[8] = this.back.cubes[6];
  };

  Cube.prototype.resetDown = function (dir) {
    if (dir == 1) {
      this.down.cubes = this.rotateCounterClockwise(this.down.cubes);
    } else if (dir == -1) {
      this.down.cubes = this.rotateClockwise(this.down.cubes);
    }

    this.front.cubes[6] = this.down.cubes[0], this.front.cubes[7] = this.down.cubes[1], this.front.cubes[8] = this.down.cubes[2];
    this.right.cubes[6] = this.down.cubes[2], this.right.cubes[7] = this.down.cubes[5], this.right.cubes[8] = this.down.cubes[8];
    this.back.cubes[6] = this.down.cubes[8], this.back.cubes[7] = this.down.cubes[7], this.back.cubes[8] = this.down.cubes[6];
    this.left.cubes[6] = this.down.cubes[6], this.left.cubes[7] = this.down.cubes[3], this.left.cubes[8] = this.down.cubes[0];
  };

  Cube.prototype.resetFront = function (dir) {
    if (dir == 1) {
      this.front.cubes = this.rotateClockwise(this.front.cubes);
    } else if (dir == -1) {
      this.front.cubes = this.rotateCounterClockwise(this.front.cubes);
    }

    this.up.cubes[6] = this.front.cubes[0], this.up.cubes[7] = this.front.cubes[1], this.up.cubes[8] = this.front.cubes[2];
    this.right.cubes[0] = this.front.cubes[2], this.right.cubes[3] = this.front.cubes[5], this.right.cubes[6] = this.front.cubes[8];
    this.down.cubes[0] = this.front.cubes[6], this.down.cubes[1] = this.front.cubes[7], this.down.cubes[2] = this.front.cubes[8];
    this.left.cubes[2] = this.front.cubes[0], this.left.cubes[5] = this.front.cubes[3], this.left.cubes[8] = this.front.cubes[6];
  };

  Cube.prototype.resetLeft = function (dir) {
    if (dir == 1) {
      this.left.cubes = this.rotateCounterClockwise(this.left.cubes);
    } else if (dir == -1) {
      this.left.cubes = this.rotateClockwise(this.left.cubes);
    }

    this.up.cubes[0] = this.left.cubes[0], this.up.cubes[3] = this.left.cubes[1], this.up.cubes[6] = this.left.cubes[2];
    this.front.cubes[0] = this.left.cubes[2], this.front.cubes[3] = this.left.cubes[5], this.front.cubes[6] = this.left.cubes[8];
    this.down.cubes[0] = this.left.cubes[8], this.down.cubes[3] = this.left.cubes[7], this.down.cubes[6] = this.left.cubes[6];
    this.back.cubes[2] = this.left.cubes[0], this.back.cubes[5] = this.left.cubes[3], this.back.cubes[8] = this.left.cubes[6];
  };

  Cube.prototype.resetRight = function (dir) {
    if (dir == 1) {
      this.right.cubes = this.rotateClockwise(this.right.cubes);
    } else if (dir == -1) {
      this.right.cubes = this.rotateCounterClockwise(this.right.cubes);
    }

    this.up.cubes[2] = this.right.cubes[2], this.up.cubes[5] = this.right.cubes[1], this.up.cubes[8] = this.right.cubes[0];
    this.back.cubes[0] = this.right.cubes[2], this.back.cubes[3] = this.right.cubes[5], this.back.cubes[6] = this.right.cubes[8];
    this.down.cubes[2] = this.right.cubes[6], this.down.cubes[5] = this.right.cubes[7], this.down.cubes[8] = this.right.cubes[8];
    this.front.cubes[2] = this.right.cubes[0], this.front.cubes[5] = this.right.cubes[3], this.front.cubes[8] = this.right.cubes[6];
  };

  Cube.prototype.resetUp = function (dir) {
    if (dir == 1) {
      this.up.cubes = this.rotateClockwise(this.up.cubes);
    } else if (dir == -1) {
      this.up.cubes = this.rotateCounterClockwise(this.up.cubes);
    }

    this.back.cubes[0] = this.up.cubes[2], this.back.cubes[1] = this.up.cubes[1], this.back.cubes[2] = this.up.cubes[0];
    this.right.cubes[0] = this.up.cubes[8], this.right.cubes[1] = this.up.cubes[5], this.right.cubes[2] = this.up.cubes[2];
    this.front.cubes[0] = this.up.cubes[6], this.front.cubes[1] = this.up.cubes[7], this.front.cubes[2] = this.up.cubes[8];
    this.left.cubes[0] = this.up.cubes[0], this.left.cubes[1] = this.up.cubes[3], this.left.cubes[2] = this.up.cubes[6];
  };

  Cube.prototype.rotateClockwise = function(face) {
    face = [face[6], face[3], face[0],
                  face[7], face[4], face[1],
                  face[8], face[5], face[2]];
    return face;
  };

  Cube.prototype.rotateCounterClockwise = function(face) {
    face = [face[2], face[5], face[8],
                  face[1], face[4], face[7],
                  face[0], face[3], face[6]];
    return face;
  };

  Cube.prototype.rPrime = function rPrime () {
    this.move('rPrime', 'right');
  };

  Cube.prototype.scramble = function () {
    for (var i = 0; i < 25; i++) {
      this.possibleMoves[~~(Math.random() * this.possibleMoves.length)].call(this);
    }
  };

  Cube.prototype.seeLeft = function () {
    this.virtualCube.seeLeft();
    this.animating = true;
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], scene, rubiksCube);
    }
    scene.add(rubiksCube);
    this.animate(rubiksCube, this.cubes, 'y', 1, function () {
      var temp = this.front.cubes;
      this.front.cubes = this.left.cubes;
      this.left.cubes = this.back.cubes;
      this.back.cubes = this.right.cubes;
      this.right.cubes = temp;

      this.up.cubes = this.rotateCounterClockwise(this.up.cubes);
      this.down.cubes = this.rotateClockwise(this.down.cubes);
    }.bind(this));
  };

  Cube.prototype.seeDown = function () {
    this.virtualCube.seeDown();
    this.animating = true;
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], scene, rubiksCube);
    }
    scene.add(rubiksCube);
    this.animate(rubiksCube, this.cubes, 'x', -1, function () {
      var temp = this.up.cubes;
      this.up.cubes = this.front.cubes;
      this.front.cubes = this.down.cubes;
      this.down.cubes = this.back.cubes.reverse();
      this.back.cubes = temp.reverse();

      this.right.cubes = this.rotateClockwise(this.right.cubes);
      this.left.cubes = this.rotateCounterClockwise(this.left.cubes);
    }.bind(this));
  };

  Cube.prototype.seeRight = function () {
    this.virtualCube.seeRight();
    this.animating = true;
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], scene, rubiksCube);
    }
    scene.add(rubiksCube);
    this.animate(rubiksCube, this.cubes, 'y', -1, function () {
      var temp = this.front.cubes;
      this.front.cubes = this.right.cubes;
      this.right.cubes = this.back.cubes;
      this.back.cubes = this.left.cubes;
      this.left.cubes = temp;

      this.up.cubes = this.rotateClockwise(this.up.cubes);
      this.down.cubes = this.rotateCounterClockwise(this.down.cubes);
    }.bind(this));
  };

  Cube.prototype.seeUp = function () {
    this.virtualCube.seeUp();
    this.animating = true;
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], scene, rubiksCube);
    }
    scene.add(rubiksCube);
    this.animate(rubiksCube, this.cubes, 'x', 1, function () {
      var temp = this.up.cubes;
      this.up.cubes = this.back.cubes.reverse();
      this.back.cubes = this.down.cubes.reverse();
      this.down.cubes = this.front.cubes;
      this.front.cubes = temp;

      this.right.cubes = this.rotateCounterClockwise(this.right.cubes);
      this.left.cubes = this.rotateClockwise(this.left.cubes);
    }.bind(this));
  };

  Cube.prototype.solved = function () {
    return this.virtualCube.solved();
  };

  Cube.prototype.u = function u () {
    this.move('u', 'up');
  };

  Cube.prototype.uPrime = function uPrime () {
    this.move('uPrime', 'up');
  };
})();
