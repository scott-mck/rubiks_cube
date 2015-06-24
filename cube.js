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

  Cube.prototype.r = function() {
    var rightRow = [this.front[0][2], this.front[1][2], this.front[2][2]]
    this.front[0][2] = this.down[0][2];
    this.front[1][2] = this.down[1][2];
    this.front[2][2] = this.down[2][2];

    this.down[0][2] = this.back[0][0];
    this.down[1][2] = this.back[1][0];
    this.down[2][2] = this.back[2][0];

    this.back[0][0] = this.up[0][2];
    this.back[1][0] = this.up[1][2];
    this.back[2][0] = this.up[2][2];

    this.up[0][2] = rightRow[0];
    this.up[1][2] = rightRow[1];
    this.up[2][2] = rightRow[2];

    this.rotateClockwise(this.right);
  };

  Cube.prototype.rotateClockwise = function(face) {
    var top = face[0];
    face[0] = [ face[0][2], face[0][1], face[0][0] ];

    face[0][2] = face[2][2];
    face[0][1] = face[2][1];
    face[0][0] = face[2][0];

    face[2] = [ face[0][2], face[1][2], face[2][2] ];

    face[0][2] = top[0];
    face[1][2] = top[1];
    face[2][2] = top[2];
  };

  Cube.prototype.rotateCounterClockwise = function(face) {
    var top = face[0];
    face[0] = [ face[0][2], face[1][2], face[2][2] ];

    face[0][2] = face[2][2];
    face[1][2] = face[2][1];
    face[2][2] = face[2][0];

    face[2] = [ face[0][0], face[1][0], face[2][0] ];

    face[0][0] = top[2];
    face[0][1] = top[1];
    face[0][2] = top[0];
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
