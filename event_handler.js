// TODO: Keep track of average solve times
// TODO: Do not allow movement of cube while scrambling
// TODO: make more 'videos'

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = window.Game.EventHandler = function (scene, camera, cube, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.cube = cube;
    this.renderer = renderer;
    this._eventLoop = [];
    this.scrambleMoves = [];
    this.scrambled = false;
    this._timing = false;
    this._sampling = false;

    $(window).on('keyup', this.handleEvents.bind(this));
    $('#canvas').on('mousedown', this.click.bind(this));
    this.interval = setInterval(this.triggerEvent.bind(this), 10);

    this.keyCodeMap = {
      13: 'return',
      32: 'space',
      65: 'a',
      67: 'c',
      68: 'd',
      69: 'e',
      70: 'f',
      71: 'g',
      72: 'h',
      73: 'i',
      74: 'j',
      75: 'k',
      76: 'l',
      77: 'm',
      78: 'n',
      79: 'o',
      80: 'p',
      81: 'q',
      82: 'r',
      83: 's',
      84: 't',
      85: 'u',
      86: 'v',
      87: 'w',
      89: 'y',
      90: 'z',
      186: ';',
      191: '/'
    };
  };

  EventHandler.prototype.animateSolveMove = function (glow, rotationAxis, rotationDir) {
    var id = requestAnimationFrame(function () {
      this.animateSolveMove(glow, rotationAxis, rotationDir);
      renderer.render(scene, camera);
    }.bind(this));
    if (glow.material.uniforms.p.value <= .4) {
      cancelAnimationFrame(id);
      this.rotateSolveMove(glow, rotationAxis, rotationDir);
      return;
    }
    this.glowPower = this.glowPower || .7;
    glow.material.uniforms.p.value -= this.glowPower;
    this.glowPower *= .89;
  };

  EventHandler.prototype.rotateSolveMove = function (glow, rotationAxis, rotationDir) {
    var id = requestAnimationFrame(function () {
      this.rotateSolveMove(glow, rotationAxis, rotationDir);
      renderer.render(scene, camera);
    }.bind(this));

    if (glow.rotation[rotationAxis] >= Math.PI / 2 ||
        glow.rotation[rotationAxis] <= -Math.PI / 2) {
      cancelAnimationFrame(id);
      this.glowRotation = false;
      this.fadeOutSolveMove(glow);
      return;
    }
    glow.rotation[rotationAxis] += rotationDir * (Math.PI / 2) / (8 * 4);
  };

  EventHandler.prototype.fadeOutSolveMove = function (glow, rotationAxis) {
    var id = requestAnimationFrame(function () {
      this.fadeOutSolveMove(glow);
      renderer.render(scene, camera);
    }.bind(this));
    if (glow.material.uniforms.p.value >= 6) {
      cancelAnimationFrame(id);
      this.glowPower = false;
      scene.remove(glow);
      return;
    }
    glow.material.uniforms.p.value += this.glowPower;
    this.glowPower *= (1 / .8);
  };

  EventHandler.prototype.click = function (mouseDown) {
    if (this.cube.animating) {
      return;
    }

    var intersects = this._getIntersects(mouseDown);
    var clickedMesh;
    for (var i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === 'cubie') {
        clickedMesh = intersects[i];
        break;
      }
    }

    if (!clickedMesh) {
      var mouseUpFn = function (mouseUp) {
        this._rotateCube(mouseDown, mouseUp);
      };
      $('#canvas').one('mouseup', mouseUpFn.bind(this));
      return;
    }

    var vector = new THREE.Matrix4();
    vector = vector.extractRotation(clickedMesh.object.matrixWorld);
    vector = vector.multiplyVector3(clickedMesh.face.normal.clone());

    var normal;
    if (vector.x === 1) normal = 'x';
    else if (vector.y === 1) normal = 'y';
    else if (vector.z === 1) normal = 'z';

    var mouseUpFn = function (mouseUp) {
      this._mouseUp(clickedMesh.object, normal, mouseDown, mouseUp);
    };

    $('#canvas').one('mouseup', mouseUpFn.bind(this));
  };

  EventHandler.prototype.detectTimerStart = function (keyPressed) {
    if (this.scrambled && !this.timing && keyPressed === 'click') {
      this.startTimer();
    }
    var move = Game.Cube.keyToMoveMap[keyPressed];
    if (!move) return;
    if (['left', 'right', 'up', 'down'].indexOf(move) > -1) return;
    if (this.scrambled && !this.timing) {
      this.startTimer();
    }
  };

  EventHandler.prototype.displayElapsedTime = function () {
    this.startTime = this.startTime || new Date();
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time.toFixed(2));
  };

  EventHandler.prototype.displaySolveMoves = function () {
    var solveMove = this.cube.movesMade[this.cube.movesMade.length - 1];

    var glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "c":   { type: "f", value: .5 },
        "p":   { type: "f", value: 6 },
        glowColor: { type: "c", value: new THREE.Color(0xffff00) },
        viewVector: { type: "v3", value: camera.position }
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    var location;
    var geomSize = new THREE.Vector3(
      (cubieSize * cubeDimensions),
      (cubieSize * cubeDimensions),
      (cubieSize * cubeDimensions)
    );

    var width = solveMove.cubesToRotate.length / Math.pow(cubeDimensions, 2);
    geomSize[solveMove.rotationAxis] = cubieSize * width;

    var geometry = new THREE.BoxGeometry(geomSize.x, geomSize.y, geomSize.z);
    var glow = new THREE.Mesh(geometry, glowMaterial.clone());
    glow.name = 'glow';

    var cubiePos = solveMove.cubesToRotate[~~(solveMove.cubesToRotate.length / 2)].position;
    var glowPos = new THREE.Vector3(0, 0, 0);
    glowPos[solveMove.rotationAxis] = cubiePos[solveMove.rotationAxis];

    glow.position.copy(glowPos);
    glow.scale.multiplyScalar(1.1);
    scene.add(glow);

    var rotationDir = solveMove.rotationDir * -1;
    this.animateSolveMove(glow, solveMove.rotationAxis, rotationDir);
  };

  EventHandler.prototype.handleEvents = function (key) {
    var keyPressed = this.keyCodeMap[key.keyCode];
    this.detectTimerStart(keyPressed);

    switch (keyPressed) {
    case 'return':
      clearInterval(this.repeatSolveMoveId);
      this.displaySolveMoves();
      this.repeatSolveMoveId = setInterval(function () {
        this.displaySolveMoves();
      }.bind(this), 2000);
      return;
    case 'space':
      if (this.cube.isSolved) {
        this.scramble();
      } else {
        this.solve();
      }
      return;
    }

    var move = Game.Cube.keyToMoveMap[keyPressed];
    this._eventLoop.push(function () {
      this.cube.move(move);
    }.bind(this));
  };

  EventHandler.prototype.sampleSolve = function () {
    if (this._sampling) {
      return;
    }
    this._sampling = true;

    var scramble = 'iqssdllklffesshqsfpgldsdpjllhh';
    var solve = ' ;; yy; ;; a ; dkgjijdjyy ; ; fijiifi ; ;; jejdijk;ijjkfdjjeajefd hejjdjjdhheh f kfi;ii;skjifilhh';
    for (var i = 0; i < scramble.length; i++) {
      this._eventLoop.push(
        this.cube.move.bind(this.cube, Game.Cube.keyToMoveMap[scramble[i]])
      );
    }

    for (var i = 0; i < solve.length; i++) {
      if (solve[i] === ' ') {
        this._eventLoop.push(this._sleep.bind(this, 400));
      } else {
        this._eventLoop.push(
          this.cube.move.bind(this.cube, Game.Cube.keyToMoveMap[solve[i]])
        );
      }
    }

    this._eventLoop.push(function () {
      this._sampling = false;
    }.bind(this));
  };

  EventHandler.prototype.scramble = function () {
    this.scrambled = true;
    this.cube.isSolved = false;
    $('.timer').text('0.00').css('color', 'white');

    for (var i = 0; i < scrambleLength; i++) {
      this._eventLoop.push(function () {
        var randMove = this.cube.randomMove();
        this.cube.move(randMove);
      }.bind(this));
    }
  };

  EventHandler.prototype.solve = function () {
    if (this.cube.animating) {
      return;
    }
    // this.scrambled = false;
    while (this.cube.movesMade.length > 0) {
      var moveDetails = this.cube.movesMade.pop();
      moveDetails.rotationDir *= -1;
      this._eventLoop.push(this.cube.move.bind(this.cube, moveDetails));
    }
  };

  EventHandler.prototype.startTimer = function () {
    $('.timer').css('color', 'red');
    this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
    this.scrambled = false;
    this._timing = true;
  };

  EventHandler.prototype.stopTimer = function () {
    clearInterval(this.timeId);
    this._timing = false;
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time).css('color', 'green');
  };

  EventHandler.prototype.triggerEvent = function () {
    if (this.cube.isSolved && this._timing) {
      this.stopTimer();
      this._eventLoop = [];
      this.cube.movesMade = [];
      this.startTime = undefined;
    }
    if (!this.cube.animating && this._eventLoop.length > 0) {
      this._eventLoop.shift()();
    }
    if (this.cube.isSolved) {
      this.cube.movesMade = [];
      clearInterval(this.repeatSolveMoveId);
    }
  };

  EventHandler.prototype._getIntersects = function (event) {
    var canvasBox = this.renderer.domElement.getBoundingClientRect();
    var canvasMouseX = event.clientX - canvasBox.left;
    var canvasMouseY = event.clientY - canvasBox.top;

    var mouse = new THREE.Vector2();
    mouse.x = (canvasMouseX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(canvasMouseY / this.renderer.domElement.clientHeight) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    return raycaster.intersectObjects(this.scene.children);
  };

  EventHandler.prototype._mouseUp = function (clickedCube, normal, mouseDown, mouseUp) {
    var axes = ['x', 'z', 'y'];
    axes.splice(axes.indexOf(normal), 1);

    var startPos = clickedCube.position.clone();
    startPos[normal] = cubeStartPos;
    var rayDir = new THREE.Vector3();
    var sliceDir = { axis: normal, mag: -1 }
    var cubesToRotate, rotationAxis;
    var rotationDir = 1;

    if (mouseUp.clientX > mouseDown.clientX + 40 ||
        mouseUp.clientX < mouseDown.clientX - 40) {
      startPos[axes[0]] = window.cubeStartPos + 200;
      rayDir[axes[0]] = -1;
      rotationAxis = axes[1];
      if (mouseUp.clientX < mouseDown.clientX - 40) rotationDir *= -1;
      if (normal === 'y') rotationDir *= -1;
    } else if (mouseUp.clientY > mouseDown.clientY + 40 ||
               mouseUp.clientY < mouseDown.clientY - 40) {
      startPos[axes[1]] = window.cubeStartPos + 200;
      rayDir[axes[1]] = -1;
      rotationAxis = axes[0];
      if (mouseUp.clientY < mouseDown.clientY - 40) rotationDir *= -1;
      if (normal === 'x') rotationDir *= -1;
    } else {
      return;
    }

    var cubesToRotate = this.cube.captureCubes(startPos, rayDir, sliceDir);
    moveDetails = {
      cubesToRotate: cubesToRotate,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
    this._eventLoop.push(function () {
      this.cube.move(moveDetails);
    }.bind(this));

    this.detectTimerStart('click');
  };

  EventHandler.prototype._rotateCube = function (mouseDown, mouseUp) {
    if (mouseUp.clientX < mouseDown.clientX - 40) {
      this._eventLoop.push(this.cube.move.bind(this.cube, 'right'));
      this.scrambleMoves.push('left');
    }
    if (mouseUp.clientX > mouseDown.clientX + 40) {
      this._eventLoop.push(this.cube.move.bind(this.cube, 'left'));
      this.scrambleMoves.push('right');
    }
    if (mouseUp.clientY > mouseDown.clientY + 40) {
      this._eventLoop.push(this.cube.move.bind(this.cube, 'up'));
      this.scrambleMoves.push('down');
    }
    if (mouseUp.clientY < mouseDown.clientY - 40) {
      this._eventLoop.push(this.cube.move.bind(this.cube, 'down'));
      this.scrambleMoves.push('up');
    }
  };

  EventHandler.prototype._sleep = function (milli) {
    clearInterval(this.interval);
    setTimeout(function () {
      this.interval = setInterval(this.triggerEvent.bind(this), 10);
    }.bind(this), milli);
  };
})();
