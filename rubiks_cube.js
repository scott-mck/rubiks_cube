// TODO: Enable moving middle faces

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var Cube = window.Game.Cube = function (scene, camera, cubes) {
    this.cubes = cubes;
    this.animating = false;
    this.isSolved = false;

    this.r = {
      cubes: [],
      axis: 'x',
      vector: {
        startPos: new THREE.Vector3(103, 103, 200),
        direction: new THREE.Vector3(0, 0, -1),
        changePosAxis: ['y', -1]
      },
      dir: -1,
      middle: 'm'
    };

    this.l = {
      cubes: [],
      axis: 'x',
      vector: {
        startPos: new THREE.Vector3(-103, 103, -200),
        direction: new THREE.Vector3(0, 0, 1),
        changePosAxis: ['y', -1]
      },
      dir: 1,
      middle: 'm'
    };

    this.u = {
      cubes: [],
      axis: 'y',
      vector: {
        startPos: new THREE.Vector3(-200, 103, -103),
        direction: new THREE.Vector3(1, 0, 0),
        changePosAxis: ['z', 1]
      },
      dir: -1,
      middle: 'e'
    };

    this.d = {
      cubes: [],
      axis: 'y',
      vector: {
        startPos: new THREE.Vector3(-200, -103, 103),
        direction: new THREE.Vector3(1, 0, 0),
        changePosAxis: ['z', -1]
      },
      dir: 1,
      middle: 'e'
    };

    this.b = {
      cubes: [],
      axis: 'z',
      vector: {
        startPos: new THREE.Vector3(200, 103, -103),
        direction: new THREE.Vector3(-1, 0, 0),
        changePosAxis: ['y', -1]
      },
      dir: 1,
      middle: 's'
    };

    this.f = {
      cubes: [],
      axis: 'z',
      vector: {
        startPos: new THREE.Vector3(-200, 103, 103),
        direction: new THREE.Vector3(1, 0, 0),
        changePosAxis: ['y', -1]
      },
      dir: -1,
      middle: 's'
    };

    this.m = {
      cubes: [],
      axis: 'x',
      vector: {
        startPos: new THREE.Vector3(0, 103, 200),
        direction: new THREE.Vector3(0, 0, -1),
        changePosAxis: ['y', -1]
      },
      dir: 1,
    };

    this.e = {
      cubes: [],
      axis: 'y',
      vector: {
        startPos: new THREE.Vector3(-103, 0, 200),
        direction: new THREE.Vector3(0, 0, -1),
        changePosAxis: ['x', 1]
      },
      dir: 1,
    };

    this.s = {
      cubes: [],
      axis: 'z',
      vector: {
        startPos: new THREE.Vector3(200, 103, 0),
        direction: new THREE.Vector3(-1, 0, 0),
        changePosAxis: ['y', -1]
      },
      dir: -1,
    };

    this.possibleMoves = [
      'r', 'rPrime', 'l', 'lPrime', 'u', 'uPrime', 'd', 'dPrime', 'f', 'fPrime',
      'd', 'dPrime', 'b', 'bPrime', 'm', 'mPrime', 'e', 'ePrime', 's', 'sPrime',
      'rDouble', 'rDoublePrime', 'lDouble', 'lDoublePrime'
    ];
  };

  Game.Cube.moveToKeyMap = {
    b:            'q',
    bPrime:       'p',
    d:            's',
    down:         'y',
    dPrime:       'l',
    e:            'z',
    ePrime:       '/',
    f:            'h',
    fPrime:       'g',
    l:            'd',
    lDouble:      'c',
    lDoublePrime: 'r',
    left:         'a',
    lPrime:       'e',
    m:            'v',
    mPrime:       't',
    r:            'i',
    rDouble:      'u',
    rDoublePrime: 'm',
    right:        ';',
    rPrime:       'k',
    u:            'j',
    up:           'n',
    uPrime:       'f',
    s:            'o',
    sPrime:       'w'
  };

  Game.Cube.keyToMoveMap = {
    a:   'left',
    c:   'lDouble',
    d:   'l',
    e:   'lPrime',
    f:   'uPrime',
    g:   'fPrime',
    h:   'f',
    i:   'r',
    j:   'u',
    k:   'rPrime',
    l:   'dPrime',
    m:   'rDoublePrime',
    n:   'up',
    o:   's',
    p:   'bPrime',
    q:   'b',
    r:   'lDoublePrime',
    s:   'd',
    t:   'mPrime',
    u:   'rDouble',
    v:   'm',
    w:   'sPrime',
    y:   'down',
    z:   'e',
    ';': 'right',
    '/': 'ePrime'
  };

  Cube.prototype.animate = function (rotatingFace, axis, dir) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, axis, dir);
      renderer.render(scene, camera);
    }.bind(this));

    rotatingFace.rotation[axis] += dir * (Math.PI / 2) / 8;
    renderer.render(scene, camera);

    if (rotatingFace.rotation[axis] >= Math.PI / 2 ||
        rotatingFace.rotation[axis] <= -Math.PI / 2) {
      this.finishAnimation(rotatingFace, id);
    }
  };

  Cube.prototype.finishAnimation = function (rotatingFace, id) {
    cancelAnimationFrame(id);

    // Detach cubes from rotatingFace before removing rotatingFace from scene
    while (rotatingFace.children.length > 0) {
      THREE.SceneUtils.detach(rotatingFace.children[0], rotatingFace, scene);
    }
    scene.remove(rotatingFace);
    this.animating = false;
    this._updateSolveState();
  };

  Cube.prototype.getColorsOfFace = function (face) {
    var cubesToRotate = this._captureCubes(face);
    var point = new THREE.Vector3();
    var cube, dir, ray, intersects;
    var colors = [];

    for (var i = 0; i < cubesToRotate.length; i++) {
      cube = cubesToRotate[i].position;
      point[this[face].axis] = 500 * -  this[face].dir;
      dir = cube.clone().sub(point).normalize();
      ray = new THREE.Raycaster(point, dir);
      intersects = ray.intersectObjects(scene.children);
      colors.push(intersects[0].face.color);
    }

    return colors;
  };

  Cube.prototype.move = function (name) {
    this.isSolved = false;
    this.animating = true;

    var axis, resetCallback;
    var dir = 1;
    var cubesToRotate = [];

    if (['up', 'down', 'right', 'left'].indexOf(name) > -1) {
      cubesToRotate = cubes;

      if (name === 'left') {
        axis = 'y';
      } else if (name === 'right') {
        axis = 'y';
        dir = -1;
      } else if (name === 'up') {
        axis = 'x';
      } else if (name === 'down') {
        axis = 'x';
        dir = -1;
      }

    } else {
      var face = name[0];
      axis = this[face].axis;
      dir = this[face].dir;
      if (name.indexOf('Prime') > -1) {
        dir *= -1;
      }
      cubesToRotate = this._captureCubes(face);
      if (name.indexOf('Double') > -1) {
        cubesToRotate = cubesToRotate.concat(this._captureCubes(this[face].middle));
      }
    }

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], scene, rotatingFace);
    }
    scene.add(rotatingFace);
    this.animate(rotatingFace, axis, dir);
  };

  Cube.prototype.oppositeMove = function (name) {
    if (name === 'left') return 'right';
    if (name === 'right') return 'left';
    if (name === 'up') return 'down';
    if (name === 'down') return 'up';

    var oppMove = name[0];
    if (name.indexOf('Double') > -1) {
      oppMove += 'Double';
    }
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
    var dir = this[face].vector.direction;
    var pos = this[face].vector.startPos.clone();
    var raycaster;

    for (var i = 0; i < 3; i++) {
      raycaster = new THREE.Raycaster(pos, dir);
      allCaptures = allCaptures.concat(raycaster.intersectObjects(scene.children));

      var newPos = 103 * this[face].vector.changePosAxis[1];
      pos[this[face].vector.changePosAxis[0]] += newPos;
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

  Cube.prototype._updateSolveState = function () {
    if (this.animating) {
      this.isSolved = false;
    }
    var rightFace = this.getColorsOfFace('r');
    var upFace = this.getColorsOfFace('u');
    var frontFace = this.getColorsOfFace('f');

    if (this._colorsAreSame(rightFace) &&
        this._colorsAreSame(frontFace) &&
        this._colorsAreSame(upFace)) {
      this.isSolved = true;
    }
  };

  Cube.prototype._colorsAreSame = function (colors) {
    var firstColor = colors[0];
    var testColor;
    for (var i = 1; i < colors.length; i++) {
      testColor = colors[i];

      if (!firstColor.equals(colors[i])) {
        return false;
      }
    }
    return true;
  };
})();
