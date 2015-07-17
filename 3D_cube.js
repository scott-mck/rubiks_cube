// TODO: Possibly refacter #animate
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
    // this.isSolved = false;
    this.animating = false; // No simultaneous moves

    this.right = {
      cubes: [],
      axis: 'x',
      dir: -1,
      relativeFaces: [
        { face: 'up',    indices: [8, 5, 2] },
        { face: 'back',  indices: [0, 3, 6] },
        { face: 'down',  indices: [2, 5, 8] },
        { face: 'front', indices: [2, 5, 8] }
      ]
    };

    this.left = {
      cubes: [],
      axis: 'x',
      dir: 1,
      relativeFaces: [
        { face: 'up',    indices: [0, 3, 6] },
        { face: 'front', indices: [0, 3, 6] },
        { face: 'down',  indices: [6, 3, 0] },
        { face: 'back',  indices: [2, 5, 8] }
      ]
    };

    this.up = {
      cubes: [],
      axis: 'y',
      dir: -1,
      relativeFaces: [
        { face: 'back',  indices: [2, 1, 0] },
        { face: 'right', indices: [2, 1, 0] },
        { face: 'front', indices: [0, 1, 2] },
        { face: 'left',  indices: [0, 1, 2] }
      ]
    };

    this.down = {
      cubes: [],
      axis: 'y',
      dir: 1,
      relativeFaces: [
        { face: 'front', indices: [6, 7, 8] },
        { face: 'right', indices: [6, 7, 8] },
        { face: 'back',  indices: [8, 7, 6] },
        { face: 'left',  indices: [8, 7, 6] }
      ]
    };

    this.back = {
      cubes: [],
      axis: 'z',
      dir: 1,
      relativeFaces: [
        { face: 'up',    indices: [2, 1, 0] },
        { face: 'left',  indices: [0, 3, 6] },
        { face: 'down',  indices: [8, 7, 6] },
        { face: 'right', indices: [2, 5, 8] }
      ]
    };

    this.front = {
      cubes: [],
      axis: 'z',
      dir: -1,
      relativeFaces: [
        { face: 'up',    indices: [6, 7, 8] },
        { face: 'right', indices: [0, 3, 6] },
        { face: 'down',  indices: [0, 1, 2] },
        { face: 'left',  indices: [2, 5, 8] }
      ]
    };

    for (var i = 0; i < 9; i++) {
      this.right.cubes.push(cubes[RightIndices[i]]);
      this.left.cubes.push(cubes[LeftIndices[i]]);
      this.up.cubes.push(cubes[UpIndices[i]]);
      this.down.cubes.push(cubes[DownIndices[i]]);
      this.back.cubes.push(cubes[BackIndices[i]]);
      this.front.cubes.push(cubes[FrontIndices[i]]);
    }

    this.possibleMoves = ['r', 'rPrime', 'l', 'lPrime', 'u', 'uPrime', 'd',
        'dPrime', 'f', 'fPrime', 'd', 'dPrime', 'b', 'bPrime'];
  };

  window.Game.Cube.keyMap = {
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

  window.Game.Cube.inverseKeyMap = {
    'i': 'r',
    'k': 'rPrime',
    'j': 'u',
    'f': 'uPrime',
    'd': 'l',
    'e': 'lPrime',
    'h': 'f',
    'g': 'fPrime',
    's': 'd',
    'l': 'dPrime',
    'q': 'b',
    'p': 'bPrime',
    ';': 'right',
    'a': 'left',
    'y': 'down',
    'n': 'up'
  };


  window.Game.Cube.moveMap = {
    'r': 'right',
    'l': 'left',
    'f': 'front',
    'b': 'back',
    'd': 'down',
    'u': 'up'
  }

  Cube.prototype.animate = function (rotatingFace, face, axis, dir, callback) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, face, axis, dir, callback);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 16;
    renderer.render(scene, camera);
    renderer.render(scene, camera); // fixes strange rending with box helper

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
      // if (this.solved()) {
      //   this.isSolved = true;
      // }
    }
  };

  Cube.prototype.move = function (name) {
    if (name === 'up') {
      this.seeUp();
      return;
    } else if (name === 'down') {
      this.seeDown();
      return;
    } else if (name === 'right') {
      this.seeRight();
      return;
    } else if (name === 'left') {
      this.seeLeft();
      return;
    }
    var face = window.Game.Cube.moveMap[name[0]];
    this.virtualCube[name]();
    this.animating = true;
    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < 9; i++) {
      THREE.SceneUtils.attach(this[face].cubes[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);

    // The name of the reset method for this face
    // var reset = 'reset' + face[0].toUpperCase() + face.slice(1, face.length);
    var dir = this[face].dir;
    if (name.indexOf('Prime') > -1) {
      dir *= -1;
    }
    this.animate(
      rotatingFace,
      this[face].cubes,
      this[face].axis,
      dir,
      this.reset.bind(this, face, dir)
    );
  };

  Cube.prototype.reset = function (face, dir) {
    // face is a string e.g. 'right'; referred to as 'this face'
    if (face === 'left' || face === 'down' || face === 'back') {
      dir *= -1;
    }

    if (dir == 1) {
      this[face].cubes = this.rotateCounterClockwise(this[face].cubes);
    } else if (dir == -1) {
      this[face].cubes = this.rotateClockwise(this[face].cubes);
    }

    // indices of shared cubes on this face
    var faceIndices = [ [0, 1, 2], [2, 5, 8], [6, 7, 8], [0, 3, 6] ];

    // i represents each adjacent face for this face
    for (var i = 0; i < 4; i++) {
      var workingFace = this[face].relativeFaces[i].face;

      // indices of shared cubes on adjacent face
      var workingIndices = this[face].relativeFaces[i].indices;
      for (var j = 0; j < 3; j++) {
        this[workingFace].cubes[workingIndices[j]] = this[face].cubes[faceIndices[i][j]];
      }
    }
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

  Cube.prototype.rotateCube = function (dir) {
    // dir is either 'left', 'right', 'up', or 'down'
    var seeMethod = 'see' + dir[0].toUpperCase() + dir.slice(1, dir.length);
    this.virtualCube[seeMethod]();
    this.animating = true;
    var rubiksCube = new THREE.Object3D();
    for (var i = 0; i < this.cubes.length; i++) {
      THREE.SceneUtils.attach(this.cubes[i], scene, rubiksCube);
    }
    scene.add(rubiksCube);

    var axis, dir, callback;
    if (dir === 'left') {
      axis = 'y';
      dir = 1;
      callback = this.seeLeftCallback();
    } else if (dir === 'right') {
      axis = 'y';
      dir = -1;
      callback = this.seeRightCallback();
    } else if (dir === 'up') {
      axis = 'x';
      dir = 1;
      callback = this.seeUpCallback();
    } else if (dir === 'down') {
      axis = 'x';
      dir = -1;
      callback = this.seeDownCallback();
    }

    this.animate(rubiksCube, this.cubes, axis, dir, callback.bind(this));
  };

  Cube.prototype.seeDown = function () {
    this.rotateCube('down');
  };

  Cube.prototype.seeDownCallback = function () {
    return function () {
      var temp = this.up.cubes;
      this.up.cubes = this.front.cubes;
      this.front.cubes = this.down.cubes;
      this.down.cubes = this.back.cubes.reverse();
      this.back.cubes = temp.reverse();
      this.right.cubes = this.rotateClockwise(this.right.cubes);
      this.left.cubes = this.rotateCounterClockwise(this.left.cubes);
    }
  };

  Cube.prototype.seeLeft = function () {
    this.rotateCube('left');
  };

  Cube.prototype.seeLeftCallback = function () {
    return function () {
      var frontFace = this.front.cubes;
      this.front.cubes = this.left.cubes;
      this.left.cubes = this.back.cubes;
      this.back.cubes = this.right.cubes;
      this.right.cubes = frontFace;
      this.up.cubes = this.rotateCounterClockwise(this.up.cubes);
      this.down.cubes = this.rotateClockwise(this.down.cubes);
    }
  };

  Cube.prototype.seeRight = function () {
    this.rotateCube('right');
  };

  Cube.prototype.seeRightCallback = function () {
    return function () {
      var frontFace = this.front.cubes;
      this.front.cubes = this.right.cubes;
      this.right.cubes = this.back.cubes;
      this.back.cubes = this.left.cubes;
      this.left.cubes = frontFace;

      this.up.cubes = this.rotateClockwise(this.up.cubes);
      this.down.cubes = this.rotateCounterClockwise(this.down.cubes);
    }
  };

  Cube.prototype.seeUp = function () {
    this.rotateCube('up');
  };

  Cube.prototype.seeUpCallback = function () {
    return function () {
      var temp = this.up.cubes;
      this.up.cubes = this.back.cubes.reverse();
      this.back.cubes = this.down.cubes.reverse();
      this.down.cubes = this.front.cubes;
      this.front.cubes = temp;
      this.right.cubes = this.rotateCounterClockwise(this.right.cubes);
      this.left.cubes = this.rotateClockwise(this.left.cubes);
    }
  };

  Cube.prototype.solved = function () {
    return this.virtualCube.solved();
  };
})();
