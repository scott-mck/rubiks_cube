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
      this[reset].bind(this, 1)
    );
  };

  Cube.prototype.b = function b () {
    this.move('b', 'back');
    return;
    this.virtualCube.b();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.back[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.back, 'z', 1, this.resetBack.bind(this, 1));
  };

  Cube.prototype.bPrime = function bPrime () {
    this.move('bPrime', 'back');
    return;
    this.virtualCube.bPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.back[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.back, 'z', -1, this.resetBack.bind(this, -1));
  };

  Cube.prototype.d = function d () {
    this.move('d', 'down');
    return;
    this.virtualCube.d();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.down[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.down, 'y', 1, this.resetDown.bind(this, 1));
  };

  Cube.prototype.dPrime = function dPrime () {
    this.move('dPrime', 'down');
    return;
    this.virtualCube.dPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.down[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.down, 'y', -1, this.resetDown.bind(this, -1));
  };

  Cube.prototype.f = function f () {
    this.move('f', 'front');
    return;
    this.virtualCube.f();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', -1, this.resetFront.bind(this, 1));
  };

  Cube.prototype.fPrime = function fPrime () {
    this.move('fPrime', 'front');
    return;
    this.virtualCube.fPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', 1, this.resetFront.bind(this, -1));
  };

  Cube.prototype.l = function l () {
    this.move('l', 'left');
    return;
    this.virtualCube.l();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', 1, this.resetLeft.bind(this, 1));
  };

  Cube.prototype.lPrime = function lPrime () {
    this.move('lPrime', 'left');
    return;
    this.virtualCube.lPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', -1, this.resetLeft.bind(this, -1));
  };

  Cube.prototype.r = function r () {
    this.move('r', 'right');
    return;
    this.virtualCube.r();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', -1, this.resetRight.bind(this, 1));
  };

  Cube.prototype.resetBack = function (dir) {
    if (dir == 1) {
      this.back = this.rotateClockwise(this.back);
    } else if (dir == -1) {
      this.back = this.rotateCounterClockwise(this.back);
    }

    this.up[0] = this.back[2], this.up[1] = this.back[1], this.up[2] = this.back[0];
    this.left[0] = this.back[2], this.left[3] = this.back[5], this.left[6] = this.back[8];
    this.down[6] = this.back[8], this.down[7] = this.back[7], this.down[8] = this.back[6];
    this.right[2] = this.back[0], this.right[5] = this.back[3], this.right[8] = this.back[6];
  };

  Cube.prototype.resetDown = function (dir) {
    if (dir == 1) {
      this.down = this.rotateClockwise(this.down);
    } else if (dir == -1) {
      this.down = this.rotateCounterClockwise(this.down);
    }

    this.front[6] = this.down[0], this.front[7] = this.down[1], this.front[8] = this.down[2];
    this.right[6] = this.down[2], this.right[7] = this.down[5], this.right[8] = this.down[8];
    this.back[6] = this.down[8], this.back[7] = this.down[7], this.back[8] = this.down[6];
    this.left[6] = this.down[6], this.left[7] = this.down[3], this.left[8] = this.down[0];
  };

  Cube.prototype.resetFront = function (dir) {
    if (dir == 1) {
      this.front = this.rotateClockwise(this.front);
    } else if (dir == -1) {
      this.front = this.rotateCounterClockwise(this.front);
    }

    this.up[6] = this.front[0], this.up[7] = this.front[1], this.up[8] = this.front[2];
    this.right[0] = this.front[2], this.right[3] = this.front[5], this.right[6] = this.front[8];
    this.down[0] = this.front[6], this.down[1] = this.front[7], this.down[2] = this.front[8];
    this.left[2] = this.front[0], this.left[5] = this.front[3], this.left[8] = this.front[6];
  };

  Cube.prototype.resetLeft = function (dir) {
    if (dir == 1) {
      this.left = this.rotateClockwise(this.left);
    } else if (dir == -1) {
      this.left = this.rotateCounterClockwise(this.left);
    }

    this.up[0] = this.left[0], this.up[3] = this.left[1], this.up[6] = this.left[2];
    this.front[0] = this.left[2], this.front[3] = this.left[5], this.front[6] = this.left[8];
    this.down[0] = this.left[8], this.down[3] = this.left[7], this.down[6] = this.left[6];
    this.back[2] = this.left[0], this.back[5] = this.left[3], this.back[8] = this.left[6];
  };

  Cube.prototype.resetRight = function (dir) {
    if (dir == 1) {
      this.right = this.rotateClockwise(this.right);
    } else if (dir == -1) {
      this.right = this.rotateCounterClockwise(this.right);
    }

    this.up[2] = this.right[2], this.up[5] = this.right[1], this.up[8] = this.right[0];
    this.back[0] = this.right[2], this.back[3] = this.right[5], this.back[6] = this.right[8];
    this.down[2] = this.right[6], this.down[5] = this.right[7], this.down[8] = this.right[8];
    this.front[2] = this.right[0], this.front[5] = this.right[3], this.front[8] = this.right[6];
  };

  Cube.prototype.resetUp = function (dir) {
    if (dir == 1) {
      this.up = this.rotateClockwise(this.up);
    } else if (dir == -1) {
      this.up = this.rotateCounterClockwise(this.up);
    }

    this.back[0] = this.up[2], this.back[1] = this.up[1], this.back[2] = this.up[0];
    this.right[0] = this.up[8], this.right[1] = this.up[5], this.right[2] = this.up[2];
    this.front[0] = this.up[6], this.front[1] = this.up[7], this.front[2] = this.up[8];
    this.left[0] = this.up[0], this.left[1] = this.up[3], this.left[2] = this.up[6];
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
    return;
    this.virtualCube.rPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', 1, this.resetRight.bind(this, -1));
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
      var temp = this.front;
      this.front = this.left;
      this.left = this.back;
      this.back = this.right;
      this.right = temp;

      this.up = this.rotateCounterClockwise(this.up);
      this.down = this.rotateClockwise(this.down);
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
      var temp = this.up;
      this.up = this.front;
      this.front = this.down;
      this.down = this.back.reverse();
      this.back = temp.reverse();

      this.right = this.rotateClockwise(this.right);
      this.left = this.rotateCounterClockwise(this.left);
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
      var temp = this.front;
      this.front = this.right;
      this.right = this.back;
      this.back = this.left;
      this.left = temp;

      this.up = this.rotateClockwise(this.up);
      this.down = this.rotateCounterClockwise(this.down);
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
      var temp = this.up;
      this.up = this.back.reverse();
      this.back = this.down.reverse();
      this.down = this.front;
      this.front = temp;

      this.right = this.rotateCounterClockwise(this.right);
      this.left = this.rotateClockwise(this.left);
    }.bind(this));
  };

  Cube.prototype.solved = function () {
    return this.virtualCube.solved();
  };

  Cube.prototype.u = function u () {
    this.move('u', 'up');
    return;
    this.virtualCube.u();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.up[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.up, 'y', -1, this.resetUp.bind(this, 1));
  };

  Cube.prototype.uPrime = function uPrime () {
    this.move('uPrime', 'up');
    return;
    this.virtualCube.uPrime();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.up[i], scene, rotatingFace);
    }

    scene.add(rotatingFace);
    this.animate(rotatingFace, this.up, 'y', 1, this.resetUp.bind(this, -1));
  };
})();
