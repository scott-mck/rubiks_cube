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

  Cube.prototype.animate = function (rotatingFace, face, axis, dir) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, face, axis, dir);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 24;
    renderer.render(this.scene, this.camera);

    function resetRotatingFace(face) {
      for (var i = 0; i < 9; i++) {
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
    }
  };

  Cube.prototype.d = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.down[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.down, 'y', 1);
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
    this.animate(rotatingFace, this.down, 'y', -1);
  };

  Cube.prototype.f = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', -1);
  };

  Cube.prototype.fPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.front[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.front, 'z', 1);
  };

  Cube.prototype.l = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', 1);
  };

  Cube.prototype.lPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.left[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.left, 'x', -1);
  };

  Cube.prototype.r = function() {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', -1);
  };

  Cube.prototype.rotateClockwise = function(face) {
    var topMid = face[0][1];
    face[0][1] = face[1][0];
    face[1][0] = face[2][1];
    face[2][1] = face[1][2];
    face[1][2] = topMid;

    var topRight = face[0][2];
    face[0][2] = face[0][0];
    face[0][0] = face[2][0];
    face[2][0] = face[2][2];
    face[2][2] = topRight;
  };

  Cube.prototype.rotateCounterClockwise = function(face) {
    var topMid = face[0][1];
    face[0][1] = face[1][2];
    face[1][2] = face[2][1];
    face[2][1] = face[1][0];
    face[1][0] = topMid;

    var topRight = face[0][2];
    face[0][2] = face[2][2];
    face[2][2] = face[2][0];
    face[2][0] = face[0][0];
    face[0][0] = topRight;
  };

  Cube.prototype.rPrime = function () {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.right, 'x', 1);
  };

  Cube.prototype.scramble = function () {
    for (var i = 0; i < 25; i++) {
      this.possibleMoves[~~(Math.random() * this.possibleMoves.length)].call(this);
    }
  };

  Cube.prototype.seeLeft = function () {
    this.rotateCounterClockwise(this.up);
    this.rotateClockwise(this.down);

    var oldFront = this.front;
    this.front = this.left;
    this.left = this.back;
    this.back = this.right;
    this.right = oldFront;
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

    var oldFront = this.front;
    this.front = this.right;
    this.right = this.back;
    this.back = this.left;
    this.left = oldFront;
    this.rotateClockwise(this.up);
    this.rotateCounterClockwise(this.down);
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
    this.animate(rotatingFace, this.up, 'y', -1);
  };

  Cube.prototype.uPrime = function() {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.up[i], this.scene, rotatingFace);
    }

    this.scene.add(rotatingFace);
    this.animate(rotatingFace, this.up, 'y', 1);
  };
})();
