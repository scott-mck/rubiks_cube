(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var Cube = window.Game.Cube = function (cubes) {
    this.back = [];
    for (var i = 0; i < 9; i++) {
      var index = 2 + 9 * (i % 3) + ~~(i / 3) * 3;
      this.back.push(cubes[index]);
    }

    this.front = [];
    for (var i = 0; i < 9; i++) {
      var index = 18 - 9 * (i % 3) + ~~(i / 3) * 3;
      this.front.push(cubes[index]);
    }

    this.right = [];
    for (var i = 0; i < 9; i++) {
      this.right.push(cubes[i]);
    }

    this.up = [];
    for (var i = 0; i < 9; i++) {
      var index = 20 - 9 * (i % 3) - ~~(i / 3);
      this.up.push(cubes[index]);
    }

    this.left = [];
    for (var i = 0; i < 9; i++) {
      var index = 20 - (i % 3) + ~~(i / 3) * 3;
      this.left.push(cubes[index]);
    }

    this.down = [];
    for (var i = 0; i < 9; i++) {
      var index = 24 - 9 * (i % 3) + ~~(i / 3);
      this.down.push(cubes[index]);
    }

    this.possibleMoves = [this.r, this.rPrime, this.l, this.lPrime, this.u,
      this.uPrime, this.f, this.fPrime, this.d, this.dPrime, this.doubleR,
      this.doubleRPrime, this.doubleL, this.doubleLPrime];
  };

  Cube.prototype.d = function () {
    var bottomRow = this.front[2];
    this.front[2] = this.left[2];
    this.left[2] = this.back[2];
    this.back[2] = this.right[2];
    this.right[2] = bottomRow;

    this.rotateClockwise(this.down);
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
    var bottomRow = this.front[2];
    this.front[2] = this.right[2];
    this.right[2] = this.back[2];
    this.back[2] = this.left[2];
    this.left[2] = bottomRow;

    this.rotateCounterClockwise(this.down);
  };

  Cube.prototype.f = function () {
    var up = this.up[2];
    this.up[2] = [ this.left[2][2], this.left[1][2], this.left[0][2] ];

    this.left[2][2] = this.down[0][2];
    this.left[1][2] = this.down[0][1];
    this.left[0][2] = this.down[0][0];

    this.down[0] = [ this.right[2][0], this.right[1][0], this.right[0][0] ];

    this.right[0][0] = up[0];
    this.right[1][0] = up[1];
    this.right[2][0] = up[2];

    this.rotateClockwise(this.front);
  };

  Cube.prototype.fPrime = function () {
    var up = this.up[2];
    this.up[2] = [ this.right[0][0], this.right[1][0], this.right[2][0] ];

    this.right[0][0] = this.down[0][2];
    this.right[1][0] = this.down[0][1];
    this.right[2][0] = this.down[0][0];

    this.down[0] = [ this.left[0][2], this.left[1][2], this.left[2][2] ];

    this.left[0][2] = up[2];
    this.left[1][2] = up[1];
    this.left[2][2] = up[0];

    this.rotateCounterClockwise(this.front);
  };

  Cube.prototype.l = function () {
    var leftRow = [ this.front[0][0], this.front[1][0], this.front[2][0] ];
    this.front[0][0] = this.up[0][0];
    this.front[1][0] = this.up[1][0];
    this.front[2][0] = this.up[2][0];

    this.up[0][0] = this.back[2][2];
    this.up[1][0] = this.back[1][2];
    this.up[2][0] = this.back[0][2];

    this.back[0][2] = this.down[2][0];
    this.back[1][2] = this.down[1][0];
    this.back[2][2] = this.down[0][0];

    this.down[0][0] = leftRow[0];
    this.down[1][0] = leftRow[1];
    this.down[2][0] = leftRow[2];

    this.rotateClockwise(this.left);
  };

  Cube.prototype.lPrime = function () {
    var leftRow = [ this.front[0][0], this.front[1][0], this.front[2][0] ];
    this.front[0][0] = this.down[0][0];
    this.front[1][0] = this.down[1][0];
    this.front[2][0] = this.down[2][0];

    this.down[0][0] = this.back[2][2];
    this.down[1][0] = this.back[1][2];
    this.down[2][0] = this.back[0][2];

    this.back[0][2] = this.up[2][0];
    this.back[1][2] = this.up[1][0];
    this.back[2][2] = this.up[0][0];

    this.up[0][0] = leftRow[0];
    this.up[1][0] = leftRow[1];
    this.up[2][0] = leftRow[2];

    this.rotateCounterClockwise(this.left);
  };

  Cube.prototype.r = function() {
    var rightRow = [ this.front[0][2], this.front[1][2], this.front[2][2] ];
    this.front[0][2] = this.down[0][2];
    this.front[1][2] = this.down[1][2];
    this.front[2][2] = this.down[2][2];

    this.down[0][2] = this.back[2][0];
    this.down[1][2] = this.back[1][0];
    this.down[2][2] = this.back[0][0];

    this.back[0][0] = this.up[2][2];
    this.back[1][0] = this.up[1][2];
    this.back[2][0] = this.up[0][2];

    this.up[0][2] = rightRow[0];
    this.up[1][2] = rightRow[1];
    this.up[2][2] = rightRow[2];

    this.rotateClockwise(this.right);
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

  Cube.prototype.rPrime = function (scene) {
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this.right[i], scene, rotatingFace);
    }

    rotatingFace.applyMatrix( new THREE.Matrix4().makeTranslation(-0,-5,0) );
    scene.add(rotatingFace);
    rotatingFace.rotation.x += Math.PI / 2;

    setTimeout(function () {
      for (var i = 0; i < 9; i++) {
        THREE.SceneUtils.detach(this.right[i], rotatingFace, scene);
      }
      scene.remove(rotatingFace);
      rotatingFace = new THREE.Object3D();
    }, 30);
  };


    // var rightRow = [ this.front[0][2], this.front[1][2], this.front[2][2] ];
    // this.front[0][2] = this.up[0][2];
    // this.front[1][2] = this.up[1][2];
    // this.front[2][2] = this.up[2][2];
    //
    // this.up[0][2] = this.back[2][0];
    // this.up[1][2] = this.back[1][0];
    // this.up[2][2] = this.back[0][0];
    //
    // this.back[0][0] = this.down[2][2];
    // this.back[1][0] = this.down[1][2];
    // this.back[2][0] = this.down[0][2];
    //
    // this.down[0][2] = rightRow[0];
    // this.down[1][2] = rightRow[1];
    // this.down[2][2] = rightRow[2];
    //
    // this.rotateCounterClockwise(this.right);
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
    var topRow = this.front[0];
    this.front[0] = this.right[0];
    this.right[0] = this.back[0];
    this.back[0] = this.left[0];
    this.left[0] = topRow;

    this.rotateClockwise(this.up);
  };

  Cube.prototype.uPrime = function() {
    var topRow = this.front[0];
    this.front[0] = this.left[0];
    this.left[0] = this.back[0];
    this.back[0] = this.right[0];
    this.right[0] = topRow;

    this.rotateCounterClockwise(this.up);
  };
})();
