(function () {
  if (typeof Game === "undefined") {
    window.Game = {};
  }

  var Cube = Game.Cube = function () {
    this.colors = {
      Y: 'rgb(255,255,0)',
      W: 'rgb(255,255,255)',
      B: 'rgb(0,0,255)',
      G: 'rgb(0,255,0)',
      R: 'rgb(255,0,0)',
      O: 'rgb(255,165,0)'
    };

    this.up = [['Y', 'Y', 'Y'],
         ['Y', 'Y', 'Y'],
         ['Y', 'Y', 'Y']];

    this.right = [['R', 'R', 'R'],
            ['R', 'R', 'R'],
            ['R', 'R', 'R']];

    this.front = [['B', 'B', 'B'],
            ['B', 'B', 'B'],
            ['B', 'B', 'B']];

    this.left = [['O', 'O', 'O'],
           ['O', 'O', 'O'],
           ['O', 'O', 'O']];

    this.back = [['G', 'G', 'G'],
           ['G', 'G', 'G'],
           ['G', 'G', 'G']];

    this.down = [['W', 'W', 'W'],
           ['W', 'W', 'W'],
           ['W', 'W', 'W']];
  };

  Cube.prototype.d = function () {
    var bottomRow = this.front[2];
    this.front[2] = this.left[2];
    this.left[2] = this.back[2];
    this.back[2] = this.right[2];
    this.right[2] = bottomRow;

    this.rotateClockwise(this.down);
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

    this.up[0][2] = this.back[2][2];
    this.up[1][2] = this.back[1][2];
    this.up[2][2] = this.back[0][2];

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

  Cube.prototype.rPrime = function () {
    var rightRow = [ this.front[0][2], this.front[1][2], this.front[2][2] ];
    this.front[0][2] = this.up[0][2];
    this.front[1][2] = this.up[1][2];
    this.front[2][2] = this.up[2][2];

    this.up[0][2] = this.back[2][0];
    this.up[1][2] = this.back[1][0];
    this.up[2][2] = this.back[0][0];

    this.back[0][0] = this.down[2][2];
    this.back[1][0] = this.down[1][2];
    this.back[2][0] = this.down[0][2];

    this.down[0][2] = rightRow[0];
    this.down[1][2] = rightRow[1];
    this.down[2][2] = rightRow[2];

    this.rotateCounterClockwise(this.right);
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
