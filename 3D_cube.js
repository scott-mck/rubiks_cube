// TODO: Possibly refacter #animate
// TODO: Do not store a virtual cube
// TODO: Write moves to change middles

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var Cube = window.Game.Cube = function (scene, camera, cubes) {
    this.cubes = cubes;

    // Create an internal cube to check if solved
    this._virtualCube = new Game.VirtualCube();
    this.animating = false; // No simultaneous moves

    this.right = {
      cubes: [],
      axis: 'x',
      vectorPosAxis: 'y',
      vectorDirAxis: 'z',
      dir: -1,
    };

    this.left = {
      cubes: [],
      axis: 'x',
      vectorPosAxis: 'y',
      vectorDirAxis: 'z',
      dir: 1,
    };

    this.up = {
      cubes: [],
      axis: 'y',
      vectorPosAxis: 'z',
      vectorDirAxis: 'x',
      dir: -1,
    };

    this.down = {
      cubes: [],
      axis: 'y',
      vectorPosAxis: 'z',
      vectorDirAxis: 'x',
      dir: 1,
    };

    this.back = {
      cubes: [],
      axis: 'z',
      vectorPosAxis: 'x',
      vectorDirAxis: 'y',
      dir: 1,
    };

    this.front = {
      cubes: [],
      axis: 'z',
      vectorPosAxis: 'x',
      vectorDirAxis: 'y',
      dir: -1,
    };

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

  Cube.prototype.animate = function (rotatingFace, axis, dir) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, axis, dir);
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
    } else {
      virtualCubeFn = name;
      axis = this[face].axis;
      dir = this[face].dir;
      if (name.indexOf('Prime') > -1) {
        dir *= -1;
      }

      var capturedCubes = this._captureCubes(face);
      // de-nonsensify captured cubes
      for (var i = 0; i < capturedCubes.length; i++) {
        if (capturedCubes[i].object.name === "cubie" &&
            cubesToRotate.indexOf(capturedCubes[i].object) === -1) {
          cubesToRotate.push(capturedCubes[i].object);
        }
      }
    }

    this._virtualCube[virtualCubeFn]();
    this.animating = true;

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);

    this.animate(rotatingFace, axis, dir);
  };

  Cube.prototype._captureCubes = function (face) {
    var capturedCubes = [];
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
    return capturedCubes;
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

  Cube.prototype.solved = function () {
    return this._virtualCube.solved();
  };
})();
