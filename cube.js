// TODO: Enable moving middle faces

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var Cube = window.Game.Cube = function (scene, camera, cubes) {
    this.cubes = cubes;
    this.animating = false;
    this.isSolved = false;

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

  Game.Cube.moveToKeyMap = {
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

  Game.Cube.keyToMoveMap = {
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


  Game.Cube.moveToFaceMap = {
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
      renderer.render(scene, camera);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * Math.PI / 16;
    renderer.render(scene, camera);

    if (rotatingFace.rotation[axis] >= Math.PI / 2 ||
        rotatingFace.rotation[axis] <= -Math.PI / 2) {
      this.finishAnimation(rotatingFace, id);
    }
  };

  Cube.prototype.faceIsSolved = function (face) {
    var cubesToRotate = this._captureCubes(face);
    var point = new THREE.Vector3();
    point[this[face].axis] = 500;
    var cube, dir, ray, intersects;
    var firstColor, testColor;

    for (var i = 0; i < cubesToRotate.length; i++) {
      cube = cubesToRotate[i].position;
      dir = cube.clone().sub(point).normalize();
      ray = new THREE.Raycaster(point, dir);
      intersects = ray.intersectObjects(scene.children);

      if (i === 0) {
        firstColor = intersects[0].face.color;
      } else {
        testColor = intersects[0].face.color;
      }

      if (!this._sameColor(firstColor, testColor)) {
        return false;
      }
    }

    return true;
  };

  Cube.prototype.finishAnimation = function (rotatingFace, id) {
    cancelAnimationFrame(id);

    // Detach cubes from rotatingFace before removing rotatingFace from scene
    while (rotatingFace.children.length > 0) {
      THREE.SceneUtils.detach(rotatingFace.children[0], rotatingFace, scene);
    }
    scene.remove(rotatingFace);
    this.animating = false;
    this.isSolved = this._isSolved();
  };

  Cube.prototype.move = function (name) {
    var face = window.Game.Cube.moveToFaceMap[name[0]];
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

    } else {
      axis = this[face].axis;
      dir = this[face].dir;
      if (name.indexOf('Prime') > -1) {
        dir *= -1;
      }
      cubesToRotate = this._captureCubes(face);
    }

    this.animating = true;

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);
    this.animate(rotatingFace, axis, dir);
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

  Cube.prototype._captureCubes = function (face) {
    var allCaptures = [];
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
      allCaptures = allCaptures.concat(raycaster.intersectObjects(scene.children));
    }

    for (var i = 0; i < allCaptures.length; i++) {
      // make sure captured object is a 'cubie', no duplicates
      if (allCaptures[i].object.name === "cubie" &&
          capturedCubes.indexOf(allCaptures[i].object) === -1) {
        capturedCubes.push(allCaptures[i].object);
      }
    }
    return capturedCubes;
  };

  Cube.prototype._isSolved = function () {
    if (this.animating) {
      return false;
    }
    if (this.faceIsSolved('right') && this.faceIsSolved('front') && this.faceIsSolved('up')) {
      return true;
    }
  };

  Cube.prototype._sameColor = function (color1, color2) {
    if (!color1 || !color2) {
      return true;
    }
    if (color1.r !== color2.r || color1.g !== color2.g || color1.b !== color2.b) {
      return false;
    } else {
      return true;
    }
  };
})();
