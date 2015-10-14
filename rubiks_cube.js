
(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var rubiksCube = window.Game.Cube = function (scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.animating = false;
    this.isSolved = false;

    this.r = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(window.cubeStartPos, window.cubeStartPos, (window.cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'y', mag: -1 } // TODO: make this a vector
      },
    };

    this.l = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-window.cubeStartPos, window.cubeStartPos, -(window.cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, 1),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.u = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(-(window.cubeStartPos + 100), window.cubeStartPos, -window.cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'z', mag: 1 }
      },
    };

    this.d = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-(window.cubeStartPos + 100), -window.cubeStartPos, window.cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'z', mag: -1 }
      },
    };

    this.b = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3((window.cubeStartPos + 100), window.cubeStartPos, -window.cubeStartPos),
        rayDir: new THREE.Vector3(-1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.f = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(-(window.cubeStartPos + 100), window.cubeStartPos, window.cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.m = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(0, window.cubeStartPos, (window.cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.e = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-window.cubeStartPos, 0, (window.cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'x', mag: 1 }
      },
    };

    this.s = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3((window.cubeStartPos + 100), window.cubeStartPos, 0),
        rayDir: new THREE.Vector3(-1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.possibleMoves = [
      'r', 'rPrime', 'l', 'lPrime', 'u', 'uPrime', 'd', 'dPrime', 'f', 'fPrime',
      'b', 'bPrime', 'm', 'mPrime', 'e', 'ePrime', 's', 'sPrime', 'rDouble',
      'rDoublePrime', 'lDouble', 'lDoublePrime'
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

  rubiksCube.prototype.animate = function (rotatingFace, rotationAxis, rotationDir) {
    // rotatingFace is an Object3D parent containing all cubes on a given face
    this.animating = true;
    var id = requestAnimationFrame(function () {
      this.animate(rotatingFace, rotationAxis, rotationDir);
      this.renderer.render(this.scene, this.camera);
    }.bind(this));

    rotatingFace.rotation[rotationAxis] += rotationDir * (Math.PI / 2) / 8;
    this.renderer.render(this.scene, this.camera);

    if (rotatingFace.rotation[rotationAxis] >= Math.PI / 2 ||
        rotatingFace.rotation[rotationAxis] <= -Math.PI / 2) {
      this.finishAnimation(rotatingFace, id);
    }
  };

  rubiksCube.prototype.captureCubes = function (startPos, rayDir, sliceDir) {
    startPos = startPos.clone();
    rayDir = rayDir.clone();
    var allCaptures = [];
    var capturedCubes = [];
    var raycaster;

    for (var i = 0; i < window.cubeDimensions; i++) {
      raycaster = new THREE.Raycaster(startPos, rayDir);
      allCaptures = allCaptures.concat(raycaster.intersectObjects(this.scene.children));

      var newPos = (window.cubieSize + window.cubieOffset) * sliceDir.mag;
      startPos[sliceDir.axis] += newPos;
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

  rubiksCube.prototype.captureMiddles = function (face) {
    var vector = this[face].vector;
    var rightMiddle = vector.startPos.clone();
    var leftMiddle = vector.startPos.clone();

    rightMiddle[this[face].rotationAxis] += cubieSize * this[face].rotationDir;
    leftMiddle[this[face].rotationAxis] -= cubieSize * this[face].rotationDir;

    var left = this.captureCubes(rightMiddle, vector.rayDir, vector.sliceDir);
    var right = this.captureCubes(leftMiddle, vector.rayDir, vector.sliceDir);
    return left.concat(right);
  };

  // TODO: prototypify this on THREE.Color
  rubiksCube.prototype.colorToString = function (color) {
    if (color.equals(new THREE.Color(1, 1, 1)))  return 'U';
    if (color.equals(new THREE.Color(1, 0, 0)))  return 'R';
    if (color.equals(new THREE.Color(0, 1, 0)))  return 'F';
    if (color.equals(new THREE.Color(0, 0, 1)))  return 'D';
    if (color.equals(new THREE.Color(1, .5, 0))) return 'L';
    if (color.equals(new THREE.Color(1, 1, 0)))  return 'B';
  };

  rubiksCube.prototype.finishAnimation = function (rotatingFace, id) {
    cancelAnimationFrame(id);

    // Detach cubes from rotatingFace before removing rotatingFace from scene
    while (rotatingFace.children.length > 0) {
      THREE.SceneUtils.detach(rotatingFace.children[0], rotatingFace, this.scene);
    }
    this.scene.remove(rotatingFace);
    this.animating = false;
    this._updateSolveState();
  };

  rubiksCube.prototype.getColorsOfFace = function (face) {
    var cubesToRotate = this.captureCubes(
      this[face].vector.startPos.clone(),
      this[face].vector.rayDir,
      this[face].vector.sliceDir
    );
    var point = new THREE.Vector3();
    point[this[face].rotationAxis] = (window.cubeStartPos + 300) * -this[face].rotationDir;
    var cubePos, dir, ray, intersects;
    var colors = [];

    for (var i = 0; i < cubesToRotate.length; i++) {
      cubePos = cubesToRotate[i].position.clone();
      cubePos.sub(cubePos.clone().normalize().multiplyScalar(10));
      dir = cubePos.sub(point).normalize();
      ray = new THREE.Raycaster(point, dir);
      intersects = ray.intersectObjects(this.scene.children);

      for (var j = 0; j < intersects.length; j++) {
        if (intersects[0].object.name === "cubie")
        colors.push(intersects[0].face.color);
        break;
      }
    }

    return colors;
  };

  rubiksCube.prototype.move = function (name) {
    if (typeof name !== 'string') {
      this.animate(name.rotatingFace, name.rotationAxis, name.rotationDir);
      return;
    }

    this.isSolved = false;
    if (['up', 'down', 'right', 'left'].indexOf(name) > -1) {
      this.rotateCube(name);
      return;
    }

    var face = this[name[0]];
    var cubesToRotate = this.captureCubes(
      face.vector.startPos,
      face.vector.rayDir,
      face.vector.sliceDir
    );
    var rotationAxis = face.rotationAxis;
    var rotationDir = face.rotationDir;
    if (name.indexOf('Prime') > -1) {
      rotationDir *= -1;
    }

    if (name.indexOf('Double') > -1) {
      var middle = face.vector.startPos.clone();
      middle[face.rotationAxis] += cubieSize * face.rotationDir;
      var middleCubes = this.captureCubes(
        middle,
        face.vector.rayDir,
        face.vector.sliceDir
      );
      cubesToRotate = cubesToRotate.concat(middleCubes);
    }

    if (['m', 'e', 's'].indexOf(name[0]) > -1 && cubeDimensions % 2 === 0) {
      cubesToRotate = this.captureMiddles(name[0]);
    }

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], this.scene, rotatingFace);
    }
    this.scene.add(rotatingFace)
    this.animate(rotatingFace, rotationAxis, rotationDir);
  };

  rubiksCube.prototype.oppositeMove = function (name) {
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

  rubiksCube.prototype.randomMove = function () {
    if (cubeDimensions <= 5) {
      var randIndex = ~~(Math.random() * (this.possibleMoves.length - 1));
      return this.possibleMoves[randIndex];
    }
    var sliceDir, cubesToRotate, rotationAxis, rotationDir;
    var axes = ['x', 'z', 'y'];
    var startPos = new THREE.Vector3();
    var rayDir = new THREE.Vector3();

    var randNormal = axes[~~(Math.random() * axes.length)]; // 'z'
    axes.splice(axes.indexOf(randNormal), 1);
    sliceDir = { axis: randNormal, mag: -1 }

    var randAxis = axes[~~(Math.random() * axes.length)]; // 'y'
    axes.splice(axes.indexOf(randAxis), 1);
    rayDir[axes[0]] = -1;
    rotationAxis = randAxis;

    // ray starts at a cubie position
    var randCubie = ~~(Math.random() * window.cubeDimensions); // 0, 1, 2, etc.
    startPos[randAxis] = (window.cubeStartPos) - (randCubie * (window.cubieSize + window.cubieOffset));
    startPos[axes[0]] = window.cubeStartPos + 200;
    startPos[randNormal] = window.cubeStartPos;

    cubesToRotate = this.captureCubes(startPos, rayDir, sliceDir);
    rotatingFace = new THREE.Object3D();
    for (var j = 0; j < cubesToRotate.length; j++) {
      THREE.SceneUtils.attach(cubesToRotate[j], this.scene, rotatingFace);
    }
    rotationDir = Math.random() < .5 ? -1 : 1;

    return {
      rotatingFace: rotatingFace,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
  };

  rubiksCube.prototype.rotateCube = function (name) {
    var cubesToRotate = allCubes;
    var rotationAxis, rotationDir;
    if (name === 'left') {
      rotationAxis = 'y';
      rotationDir = 1;
    } else if (name === 'right') {
      rotationAxis = 'y';
      rotationDir = -1;
    } else if (name === 'up') {
      rotationAxis = 'x';
      rotationDir = 1;
    } else if (name === 'down') {
      rotationAxis = 'x';
      rotationDir = -1;
    }

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(cubesToRotate[i], this.scene, rotatingFace);
    }
    this.scene.add(rotatingFace);
    this.animate(rotatingFace, rotationAxis, rotationDir);
  };

  rubiksCube.prototype.solve = function () {
    return Cube.fromString(this.stringifyFaces());
    return cube.solve();
  };

  rubiksCube.prototype.stringifyFaces = function () {
    var u = this.getColorsOfFace('u');
    var r = this.getColorsOfFace('r');
    var f = this.getColorsOfFace('f');
    var d = this.getColorsOfFace('d');
    var l = this.getColorsOfFace('l');
    var b = this.getColorsOfFace('b');

    var uString = '';
    var rString = '';
    var fString = '';
    var dString = '';
    var lString = '';
    var bString = '';

    for (var i = 0; i < u.length; i++) {
      uString += this.colorToString(u[i]);
      rString += this.colorToString(r[i]);
      fString += this.colorToString(f[i]);
      dString += this.colorToString(d[i]);
      lString += this.colorToString(l[i]);
      bString += this.colorToString(b[i]);
    }
    return uString + rString + fString + dString + lString + bString;
  };

  rubiksCube.prototype._updateSolveState = function () {
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

  rubiksCube.prototype._colorsAreSame = function (colors) {
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
