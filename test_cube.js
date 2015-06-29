(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  RightIndices = [0,  1,  2,  3,  4,  5,  6,  7,  8];
  FrontIndices = [18, 9,  0,  21, 12, 3,  24, 15, 6];
  UpIndices    = [20, 11, 2,  19, 10, 1,  18, 9,  0];
  LeftIndices  = [20, 19, 18, 23, 22, 21, 26, 25, 24];
  DownIndices  = [24, 15, 6,  25, 16, 7,  26, 17, 8];
  BackIndices  = [2,  11, 20, 5,  14, 23, 8,  17, 26];

  var Cube = window.Game.Cube = function (scene, camera, cubes) {
    this.cubes = cubes;
    this.scene = scene;
    this.camera = camera;

    this.right = [];
    for (var i = 0; i < 9; i++) {
      this.right.push(cubes[RightIndices[i]]);
    }

    this.front = [];
    for (var i = 0; i < 9; i++) {
      this.front.push(cubes[FrontIndices[i]]);
    }

    this.up = [];
    for (var i = 0; i < 9; i++) {
      this.up.push(cubes[UpIndices[i]]);
    }

    this.left = [];
    for (var i = 0; i < 9; i++) {
      this.left.push(cubes[LeftIndices[i]]);
    }

    this.down = [];
    for (var i = 0; i < 9; i++) {
      this.down.push(cubes[DownIndices[i]]);
    }

    this.back = [];
    for (var i = 0; i < 9; i++) {
      this.back.push(cubes[BackIndices[i]]);
    }

    this.possibleMoves = [this.r, this.rPrime, this.l, this.lPrime, this.u,
      this.uPrime, this.f, this.fPrime, this.d, this.dPrime, this.doubleR,
      this.doubleRPrime, this.doubleL, this.doubleLPrime];
  };

  Cube.prototype.animate = function (rotatingFace, face, axis, dir, callback) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    callback = callback || function () {};
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, face, axis, dir, callback);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 24;
    renderer.render(this.scene, this.camera);

    function resetRotatingFace(face) {
      for (var i = 0; i < face.length; i++) {
        THREE.SceneUtils.detach(face[i], rotatingFace, this.scene);
      }
      scene.remove(rotatingFace);
      rotatingFace = undefined;
    }

    // when rotatingFace is done rotating, detach cubes and delete from memory
    if (rotatingFace.rotation[axis] >= Math.PI / 2 ||
          rotatingFace.rotation[axis] <= -Math.PI / 2) {
      cancelAnimationFrame(id);
      resetRotatingFace(face);
      callback();
    }
  };

  Cube.prototype.d = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.down[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.down, 'y', 1, this.resetDown.bind(this, 1));
  };

  Cube.prototype.doubleL = function () {
    this.r();
    this.seeUp();
  };

  Cube.prototype.doubleLPrime = function () {
    this.rPrime();
    this.seeDown();
  };

  Cube.prototype.doubleR = function () {
    this.l();
    this.seeDown();
  };

  Cube.prototype.doubleRPrime = function () {
    this.lPrime();
    this.seeUp();
  };

  Cube.prototype.dPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.down[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.down, 'y', -1, this.resetDown.bind(this, -1));
  };

  Cube.prototype.f = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', -1, this.resetFront.bind(this, 1));
  };

  Cube.prototype.fPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', 1, this.resetFront.bind(this, -1));
  };

  Cube.prototype.l = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', 1, this.resetLeft.bind(this, 1));
  };

  Cube.prototype.lPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', -1, this.resetLeft.bind(this, -1));
  };

  Cube.prototype.r = function() {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', -1, this.resetRight.bind(this, 1));
  };

  Cube.prototype.resetDown = function (dir) {
    var temp = this.down;
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
    var temp = this.front;
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
    var temp = this.left;
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
    var temp = face;
    face = [temp[6], temp[3], temp[0],
                  temp[7], temp[4], temp[1],
                  temp[8], temp[5], temp[2]];
    return face;
  };

  Cube.prototype.rotateCounterClockwise = function(face) {
    var temp = face;
    face = [temp[2], temp[5], temp[8],
                  temp[1], temp[4], temp[7],
                  temp[0], temp[3], temp[6]];
    return face;
  };

  Cube.prototype.rPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', 1, this.resetRight.bind(this, -1));
  };

  Cube.prototype.scramble = function () {
    for (var i = 0; i < 25; i++) {
      this.possibleMoves[~~(Math.random() * this.possibleMoves.length)].call(this);
    }
  };

  Cube.prototype.seeLeft = function () {
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], this.scene, rubiksCube);
    }
    this.scene.add(rubiksCube);
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
    this.rotateClockwise(this.right);
    this.rotateCounterClockwise(this.left);
    this.rotateClockwise(this.up);
    this.rotateClockwise(this.up);
    this.rotateClockwise(this.back);
    this.rotateClockwise(this.back);

    var oldFront = this.front;
    this.front = this.down;
    this.down = this.back;
    this.back = this.up;
    this.up = oldFront;
  };

  Cube.prototype.seeRight = function () {
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], this.scene, rubiksCube);
    }
    this.scene.add(rubiksCube);
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
    this.rotateClockwise(this.left);
    this.rotateCounterClockwise(this.right);
    this.rotateClockwise(this.back);
    this.rotateClockwise(this.back);
    this.rotateClockwise(this.down);
    this.rotateClockwise(this.down);

    var oldFront = this.front;
    this.front = this.up;
    this.up = this.back;
    this.back = this.down;
    this.down = oldFront;
  };

  Cube.prototype.solved = function () {
    var solved = true
    this.faces.forEach(function (face) {
      var color = face[0][0];
      for (var i = 0; i <= 2; i++) {
        for (var j = 0; j <= 2; j++) {
          if (face[i][j] != color) {
            solved = false;
          }
        }
      }
    });
    return solved;
  };

  Cube.prototype.u = function() {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.up[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.up, 'y', -1, this.resetUp.bind(this, 1));
  };

  Cube.prototype.uPrime = function() {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.up[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.up, 'y', 1, this.resetUp.bind(this, -1));
  };
})();
