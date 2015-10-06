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
    this._virtualCube = new Game.VirtualCube();
    this.animating = false; // No simultaneous moves

      /*
        RIGHT FACE:
          // rotation axis
          rotationAxis: 'x'

          // When capturing objects, create 3 vectors that vary along this axis
          vectorPosAxis --> 'y'

          // Always -1, also set position.vectorDirAxis = 200
          vectorDirAxis --> 'z'

        UP FACE:
          rotationAxis: 'y'
          vectorPosAxis --> 'z'
          vectorDirAxis --> 'x'
      */

    this.right = {
      cubes: [],
      axis: 'x',
      vectorPosAxis: 'y',
      vectorDirAxis: 'z',
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
      vectorPosAxis: 'y',
      vectorDirAxis: 'z',
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
      vectorPosAxis: 'z',
      vectorDirAxis: 'x',
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
      vectorPosAxis: 'z',
      vectorDirAxis: 'x',
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
      vectorPosAxis: 'x',
      vectorDirAxis: 'y',
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
      vectorPosAxis: 'x',
      vectorDirAxis: 'y',
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
    'bPrime': 'p',
    'left': 'a',
    'right': ';',
    'up': 'n',
    'down': 'y'
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

  Cube.prototype.animate = function (rotatingFace, axis, dir, callback) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, axis, dir, callback);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 16;
    renderer.render(scene, camera);
    renderer.render(scene, camera); // fixes strange rendering with box helper

    // When done rotating
    if (rotatingFace.rotation[axis] >= Math.PI / 2 ||
          rotatingFace.rotation[axis] <= -Math.PI / 2) {
      cancelAnimationFrame(id);
      // Remove rotatingFace from scene

      while (rotatingFace.children.length > 0) {
        THREE.SceneUtils.detach(rotatingFace.children[0], rotatingFace, scene);
      }
      scene.remove(rotatingFace);
      // Update cube data NO NEED OF THIS
      callback && callback();
      this.animating = false;
    }
  };

  Cube.prototype.move = function (name) {
    var face = window.Game.Cube.moveMap[name[0]];
    var virtualCubeFn;
    var axis, dir, resetCallback;
    var cubesToRotate = [];

    if (['up', 'down', 'right', 'left'].indexOf(name) > -1) {
      cubesToRotate = cubes;
      if (name === 'left') {
        axis = 'y';
        dir = 1;
      } else if (name === 'right') {
        axis = 'y';
        dir = -1;
      } else if (name === 'up') {
        axis = 'x';
        dir = 1;
      } else if (name === 'down') {
        axis = 'x';
        dir = -1;
      }
      virtualCubeFn = 'see' + name[0].toUpperCase() + name.slice(1);
      resetCallback = this._getSeeCallback.bind(this, name);
    } else {
      virtualCubeFn = name;
      axis = this[face].axis;
      dir = this[face].dir;
      if (name.indexOf('Prime') > -1) {
        dir *= -1;
      }
      resetCallback = this['_reset'].bind(this, face, dir);

      var capturedCubes = []
      var pos, direction, raycaster;

      for (var i = 0; i < 3; i++) {
        pos = new THREE.Vector3(103, 103, 103);
        pos[this[face].vectorDirAxis] = 200;

        // changes position between right and left, back and front, etc.
        pos[this[face].axis] *= -this[face].dir;

        // capture all cubes of a given face
        pos[this[face].vectorPosAxis] -= 103 * i;

        direction = new THREE.Vector3();
        direction[this[face].vectorDirAxis] = -1;

        raycaster = new THREE.Raycaster(pos, direction);
        capturedCubes = capturedCubes.concat(raycaster.intersectObjects(scene.children));

      }

      // cubesToRotate = de-nonsensified capturedCubes
      for (var i = 0; i < capturedCubes.length; i++) {
        if (capturedCubes[i].object.name === "cubie" && cubesToRotate.indexOf(capturedCubes[i].object) === -1) {
          cubesToRotate.push(capturedCubes[i].object);
        }
        debugger
      }
    }

    this._virtualCube[virtualCubeFn]();
    this.animating = true;

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);

    this.animate(rotatingFace, axis, dir, resetCallback);
  };

  Cube.prototype.oppositeMove = function (name) {
    var oppMove = name[0];
    if (name.indexOf('Prime') < 0) {
      oppMove += 'Prime';
    }
    return oppMove
  };

  Cube.prototype.randomMove = function () {
    return this.possibleMoves[~~(Math.random() * this.possibleMoves.length)];
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

  Cube.prototype.solved = function () {
    return this._virtualCube.solved();
  };

  Cube.prototype._getSeeCallback = function (name) {
    var facesToReset, clockwiseFace, counterClockwiseFace;
    var reverseFaces = [];
    if (name === 'left') {
      facesToReset = this.down.relativeFaces.slice().reverse();
      clockwiseFace = 'down';
      counterClockwiseFace = 'up';
    } else if (name === 'right') {
      facesToReset = this.down.relativeFaces;
      clockwiseFace = 'up';
      counterClockwiseFace = 'down';
    } else if (name === 'up') {
      facesToReset = this.left.relativeFaces.slice().reverse();
      clockwiseFace = 'left';
      counterClockwiseFace = 'right';
      reverseFaces = ['up', 'back'];
    } else if (name === 'down') {
      facesToReset = this.left.relativeFaces;
      clockwiseFace = 'right';
      counterClockwiseFace = 'left';
      reverseFaces = ['back', 'down'];
    }

    var tempFace = facesToReset[0].face;
    var temp = this[tempFace].cubes;
    for (var i = 0; i < facesToReset.length - 1; i += 1) {
      this[facesToReset[i].face].cubes = this[facesToReset[i + 1].face].cubes;
    }
    this[facesToReset[facesToReset.length - 1].face].cubes = temp;

    this[clockwiseFace].cubes = this.rotateClockwise(this[clockwiseFace].cubes);
    this[counterClockwiseFace].cubes = this.rotateCounterClockwise(this[counterClockwiseFace].cubes);

    for (var i = 0; i < reverseFaces.length; i++) {
      this[reverseFaces[i]].cubes.reverse();
    }
  };

  Cube.prototype._reset = function (face, dir) {
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
})();
