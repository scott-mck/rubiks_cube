(function () {
  if (typeof Game === "undefined") {
    Game = {};
  }

  var rubiksCube = Game.Cube = function (scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.movesMade = [];
    this.animating = false;
    this.isSolved = true;

    this.r = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(cubeStartPos, cubeStartPos, (cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'y', mag: -1 } // TODO: make this a vector
      },
    };

    this.l = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-cubeStartPos, cubeStartPos, -(cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, 1),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.u = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(-(cubeStartPos + 100), cubeStartPos, -cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'z', mag: 1 }
      },
    };

    this.d = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-(cubeStartPos + 100), -cubeStartPos, cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'z', mag: -1 }
      },
    };

    this.b = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3((cubeStartPos + 100), cubeStartPos, -cubeStartPos),
        rayDir: new THREE.Vector3(-1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.f = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3(-(cubeStartPos + 100), cubeStartPos, cubeStartPos),
        rayDir: new THREE.Vector3(1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.m = {
      cubes: [],
      rotationAxis: 'x',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(0, cubeStartPos, (cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.e = {
      cubes: [],
      rotationAxis: 'y',
      rotationDir: 1,
      vector: {
        startPos: new THREE.Vector3(-cubeStartPos, 0, (cubeStartPos + 100)),
        rayDir: new THREE.Vector3(0, 0, -1),
        sliceDir: { axis: 'x', mag: 1 }
      },
    };

    this.s = {
      cubes: [],
      rotationAxis: 'z',
      rotationDir: -1,
      vector: {
        startPos: new THREE.Vector3((cubeStartPos + 100), cubeStartPos, 0),
        rayDir: new THREE.Vector3(-1, 0, 0),
        sliceDir: { axis: 'y', mag: -1 }
      },
    };

    this.faces = ['r', 'l', 'u', 'd', 'f', 'b', 'm', 'e', 's'];

    this.possibleMoves = [
      'r', 'rPrime', 'l', 'lPrime', 'u', 'uPrime', 'd', 'dPrime', 'f', 'fPrime',
      'b', 'bPrime', 'm', 'mPrime', 'e', 'ePrime', 's', 'sPrime'
    ];

    if (cubeDimensions > 3) {
      this.possibleMoves = this.possibleMoves.concat([
        'rDouble', 'rDoublePrime', 'lDouble', 'lDoublePrime', 'left', 'right'
      ]);
    }
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

    for (var i = 0; i < cubeDimensions; i++) {
      raycaster = new THREE.Raycaster(startPos, rayDir);
      allCaptures = allCaptures.concat(raycaster.intersectObjects(this.scene.children));

      var newPos = (cubieSize + cubieOffset) * sliceDir.mag;
      startPos[sliceDir.axis] += newPos;
    }

    for (var i = 0; i < allCaptures.length; i++) {
      // make sure captured object is a 'cubie' and no duplicates
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

  rubiksCube.prototype.checkCorrectMove = function (moveDetails) {
    if (this.movesMade.length === 0) {
      this.movesMade.push(moveDetails);
      return;
    }
    var lastMove = this.movesMade[this.movesMade.length - 1];
    if (this.isOppositeMove(moveDetails, lastMove)) {
      this.movesMade.pop();
    } else {
      this.movesMade.push(moveDetails);
    }
  };

  rubiksCube.prototype.finishAnimation = function (rotatingFace, id) {
    cancelAnimationFrame(id);
    this.animating = false;

    // Detach cubes from rotatingFace before removing rotatingFace from scene
    while (rotatingFace.children.length > 0) {
      THREE.SceneUtils.detach(rotatingFace.children[0], rotatingFace, this.scene);
    }
    this.scene.remove(rotatingFace);
    this._updateSolveState();
  };

  rubiksCube.prototype.getColorsOfFace = function (face) {
    var cubesToRotate = this.captureCubes(
      this[face].vector.startPos.clone(),
      this[face].vector.rayDir,
      this[face].vector.sliceDir
    );
    var point = new THREE.Vector3();
    point[this[face].rotationAxis] = (cubeStartPos + 300) * -this[face].rotationDir;
    var cubePos, dir, ray, intersects;
    var colors = [];

    for (var i = 0; i < cubesToRotate.length; i++) {
      cubePos = cubesToRotate[i].position.clone();
      cubePos.sub(cubePos.clone().normalize().multiplyScalar(10));
      dir = cubePos.sub(point).normalize();
      ray = new THREE.Raycaster(point, dir);
      intersects = ray.intersectObjects(this.scene.children);

      for (var j = 0; j < intersects.length; j++) {
        if (intersects[j].object.name === "cubie") {
          colors.push(intersects[j].face.color);
          break;
        }
      }
    }
    return colors;
  };

  rubiksCube.prototype.getMoveDetailsOfFace = function (name) {
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
      var secondaryCubes = this.captureCubes(
        middle,
        face.vector.rayDir,
        face.vector.sliceDir
      );
      // cubesToRotate = cubesToRotate.concat(middleCubes);
    }

    if (['m', 'e', 's'].indexOf(name[0]) > -1 && cubeDimensions % 2 === 0) {
      cubesToRotate = this.captureMiddles(name[0]);
    }

    return {
      cubesToRotate: cubesToRotate,
      secondaryCubes: secondaryCubes,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
  };

  rubiksCube.prototype.isOppositeMove = function (move1, move2) {
    var cubes1 = move1.cubesToRotate;
    var cubes2 = move2.cubesToRotate;

    var midIndex = ~~(cubes1.length / 2);
    facesAreSame = cubes1[midIndex] === cubes2[midIndex];

    if (cubeDimensions % 2 == 0) {
      facesAreSame = this._middlesAreSame(cubes1, cubes2);
    }
    return facesAreSame &&
           move1.rotationAxis === move2.rotationAxis &&
           move1.rotationDir === move2.rotationDir * -1;
  };

  rubiksCube.prototype.move = function (moveDetails) {
    this._updateSolveState(moveDetails);
    var moveDetails;
    if (typeof moveDetails === 'string') {
      if (['up', 'down', 'right', 'left'].indexOf(moveDetails) > -1) {
        moveDetails = this.getMoveDetailsOfRotation(moveDetails);
      } else {
        moveDetails = this.getMoveDetailsOfFace(moveDetails);
      }
    }

    var rotatingFace = new THREE.Object3D();
    for (var i = 0; i < moveDetails.cubesToRotate.length; i++) {
      THREE.SceneUtils.attach(moveDetails.cubesToRotate[i], this.scene, rotatingFace);
    }
    this.scene.add(rotatingFace);
    this.checkCorrectMove(moveDetails);
    this.animate(rotatingFace, moveDetails.rotationAxis, moveDetails.rotationDir);

    if (moveDetails.secondaryCubes) { // for double moves
      var secondaryFace = new THREE.Object3D();
      for (var i = 0; i < moveDetails.secondaryCubes.length; i++) {
        THREE.SceneUtils.attach(moveDetails.secondaryCubes[i], this.scene, secondaryFace);
      }
      this.scene.add(secondaryFace);
      this.checkCorrectMove({
        cubesToRotate: moveDetails.secondaryCubes,
        rotationAxis: moveDetails.rotationAxis,
        rotationDir: moveDetails.rotationDir
      });
      this.animate(secondaryFace, moveDetails.rotationAxis, moveDetails.rotationDir);
    }
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
    return oppMove;
  };

  rubiksCube.prototype.randomMove = function () {
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
    var randCubie = ~~(Math.random() * cubeDimensions); // 0, 1, 2, etc.
    startPos[randAxis] = (cubeStartPos) - (randCubie * (cubieSize + cubieOffset));
    startPos[axes[0]] = cubeStartPos + 200;
    startPos[randNormal] = cubeStartPos;

    cubesToRotate = this.captureCubes(startPos, rayDir, sliceDir);
    rotationDir = Math.random() < .5 ? -1 : 1;

    return {
      cubesToRotate: cubesToRotate,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
  };

  rubiksCube.prototype.getMoveDetailsOfRotation = function (name) {
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

    return {
      cubesToRotate: allCubes,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
  };

  rubiksCube.prototype._colorsAreSame = function (colors) {
    if (colors.length === 0) return;

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

  rubiksCube.prototype._middlesAreSame = function (cubes1, cubes2) {
    var middles1 = [];
    var middles2 = [];
    var midIndex = ~~(cubes1.length / 2) - 1;
    var midCubeIndex = midIndex - (cubeDimensions / 2);

    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2; j++) {
        middles1.push(cubes1[midCubeIndex + j + (cubeDimensions * i)]);
        middles2.push(cubes2[midCubeIndex + j + (cubeDimensions * i)]);
      }
    }

    for (var i = 0; i < 4; i++) {
      if (middles1[0] === middles2[i]) {
        return true;
      }
    }
    return false;
  };

  rubiksCube.prototype._updateSolveState = function (move) {
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
      this.movesMade = [];
    }
    if (this.isSolved &&
        move !== undefined &&
        ['left', 'right', 'up', 'down'].indexOf(move) < 0) {
      this.isSolved = false;
    }
  };
})();
