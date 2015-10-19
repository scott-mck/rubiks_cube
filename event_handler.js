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
      188: ',',
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

  EventHandler.prototype.fadeOutSolveMove = function (glow) {
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

  EventHandler.prototype.checkCorrectMove = function (keyPressed) {
    if (['space', 'return'].indexOf(keyPressed) > -1 || !keyPressed || !this.displayedMoves) {
      return;
    }

    if ($('.undo-moves').children('.available').length > 0) {
      this._checkUndoMove(keyPressed);
      return;
    }

    var letterToCheck = $('.white').eq(0);
    if (letterToCheck.text() === keyPressed) {
      letterToCheck.removeClass('white');
      letterToCheck.css('color', 'green');
    } else {
      this._showCorrectMove(keyPressed);
      letterToCheck.css('color', 'red');
    }
  };

  EventHandler.prototype.click = function (mouseDown) {
    if (this.cube.isSolved) {
      this.hideSolveMoves();
    }
    if (this.cube.animating) {
      return;
    }

    var intersects = this._getIntersects(mouseDown);
    var mouseUpFn;
    if (intersects.length === 0) {
      mouseUpFn = function (mouseUp) {
        this._rotateCube(mouseDown, mouseUp);
      };
    } else {
      var clickedCube = intersects[0].object;
      if (clickedCube.name !== 'cubie') {
        return;
      }

      var normalVector = new THREE.Matrix4().extractRotation(clickedCube.matrixWorld)
        .multiplyVector3(intersects[0].face.normal.clone());
      var normal;
      if (normalVector.x === 1) normal = 'x';
      else if (normalVector.y === 1) normal = 'y';
      else if (normalVector.z === 1) normal = 'z';

      mouseUpFn = function (mouseUp) {
        this._mouseUp(clickedCube, normal, mouseDown, mouseUp);
      };
    }

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
    this.repeatSolveMove = setTimeout(this.displaySolveMoves.bind(this), 2000);
    var solveMove = this.scrambleMoves[this.scrambleMoves.length - 1];
    if (typeof solveMove !== 'string') return;

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

    var capturedCubes = this.cube.captureCubes(
      this.cube[solveMove[0]].vector.startPos,
      this.cube[solveMove[0]].vector.rayDir,
      this.cube[solveMove[0]].vector.sliceDir
    );

    var geomSize = new THREE.Vector3(cubieSize * 3, cubieSize * 3, cubieSize * 3);
    var rotationAxis = this.cube[solveMove[0]].rotationAxis;
    geomSize[rotationAxis] = cubieSize;
    var geom = new THREE.BoxGeometry(geomSize.x, geomSize.y, geomSize.z);

    var glow = new THREE.Mesh(geom, glowMaterial.clone());
    glow.position.copy(capturedCubes[~~(capturedCubes.length / 2)].position);
    glow.scale.multiplyScalar(1.2);
    scene.add(glow);

    var rotationDir = this.cube[solveMove[0]].rotationDir;
    if (solveMove.indexOf('Prime') > -1) {
      rotationDir *= -1;
    }
    this.animateSolveMove(glow, rotationAxis, rotationDir);

    // if (this.displayedMoves || cubeDimensions > 5) {
    //   return;
    // }
    // this.displayedMoves = true;
    //
    // for (var i = 0; i < this.scrambleMoves.length; i++) {
    //   var move = this.scrambleMoves[this.scrambleMoves.length - i - 1];
    //   if (typeof move === 'string') {
    //     this._stringSolveMove(move);
    //   } else {
    //     this._objSolveMove(move);
    //   }
    // }
  };

  EventHandler.prototype.handleEvents = function (key) {
    if (this.cube.isSolved) {
      this.hideSolveMoves();
    }

    var keyPressed = this.keyCodeMap[key.keyCode];
    this.detectTimerStart(keyPressed);

    switch (keyPressed) {
      case 'return':
        this.displaySolveMoves();
        break;
      case 'space':
        if (this.cube.isSolved) {
          this.scramble();
        } else {
          this.solve();
        }
        break;
      case 'a':
        var fn = 'left';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'c':
        var fn = 'lDouble';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'd':
        var fn = 'l';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'e':
        var fn = 'lPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'f':
        var fn = 'uPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'g':
        var fn = 'fPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'h':
        var fn = 'f';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'i':
        var fn = 'r';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'j':
        var fn = 'u';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'k':
        var fn = 'rPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'l':
        var fn = 'dPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'm':
        var fn = 'rDoublePrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'n':
        var fn = 'up';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'o':
        var fn = 's';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'p':
        var fn = 'bPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'q':
        var fn = 'b';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'r':
        var fn = 'lDoublePrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 's':
        var fn = 'd';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 't':
        var fn = 'mPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'u':
        var fn = 'rDouble';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'v':
        var fn = 'm';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'w':
        var fn = 'sPrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'y':
        var fn = 'down';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case 'z':
        var fn = 'e';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case ';':
        var fn = 'right';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      case '/':
        var fn = 'ePrime';
        this._eventLoop.push(this.cube.move.bind(this.cube, fn));
        this.scrambleMoves.push(this.cube.oppositeMove(fn));
        break;
      }
    this.checkCorrectMove(keyPressed);
  };

  EventHandler.prototype.hideSolveMoves = function () {
    $('.solve-moves').empty();
    $('.undo-moves').empty();
    this.displayedMoves = false;
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
    if (this._sampling) {
      return;
    }
    if (cubeDimensions > 5) {
      this.scrambleForBigCubes();
      return;
    }

    this.hideSolveMoves();
    $('.timer').text('0.00').css('color', 'white');

    var prevMove = ''; // no two scramble moves are the same
    var oppositeMove = ''; // no two scramble moves cancel out

    for (var i = 0; i < scrambleLength; i++) {
      // Get random move, make sure no two in a row are the same
      var randMove = this.cube.randomMove();
      while (randMove === oppositeMove || randMove === prevMove) {
        randMove = this.cube.randomMove();
      }
      this._eventLoop.push(this.cube.move.bind(this.cube, randMove));
      prevMove = randMove;
      oppositeMove = this.cube.oppositeMove(randMove);

      this.scrambleMoves.push(oppositeMove);
    }
    this.scrambled = true;
    this.cube.isSolved = false;
  };

EventHandler.prototype.scrambleForBigCubes = function () {
    this.scrambled = true;
    this.cube.isSolved = false;
    this.hideSolveMoves();
    $('.timer').text('0.00').css('color', 'white');

    // TODO: don't allow moves that cancel each other out
    for (var i = 0; i < scrambleLength; i++) {
      this._eventLoop.push(function () {
        var randMove = this.cube.randomMove();
        this.scrambleMoves.push(randMove);
        this.cube.move(randMove);
      }.bind(this));
    }
  };

  EventHandler.prototype.solve = function () {
    if (this.cube.animating) {
      return;
    }
    this.scrambled = false;
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var fn = this.scrambleMoves[this.scrambleMoves.length - 1 - i];
      fn.rotationDir *= -1;
      this._eventLoop.push(this.cube.move.bind(this.cube, fn));
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
      this.scrambleMoves = [];
      this.startTime = undefined;
    }
    if (!this.cube.animating && this._eventLoop.length > 0) {
      this._eventLoop.shift()();
    }
    if (this.cube.isSolved) {
      this.scrambleMoves = [];
      $('.solve-moves span').css('color', 'gold');
      $('.solve').removeClass('enabled').addClass('disabled');
    } else {
      $('.solve').removeClass('disabled').addClass('enabled');
    }
  };

  EventHandler.prototype._checkUndoMove = function (keyPressed) {
    var letterToCheck = $('.undo-moves').children('.available').last();
    if (keyPressed === letterToCheck.text()) {
      letterToCheck.removeClass('available');
      letterToCheck.css('opacity', 0);
      letterToCheck.css('position', 'absolute');
      letterToCheck.css('font-size', '4vh');
      letterToCheck.one('transitionend', function () {
        letterToCheck.remove();
      });
    } else {
      this._showCorrectMove(keyPressed);
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

    // cubesToRotate = this.cube.captureCubes(startPos, rayDir, sliceDir);
    moveDetails = {
      startPos: startPos,
      rayDir: rayDir,
      sliceDir: sliceDir,
      rotationAxis: rotationAxis,
      rotationDir: rotationDir
    };
    this._eventLoop.push(this.cube.move.bind(this.cube, moveDetails));
    this.scrambleMoves.push(moveDetails);

    this.detectTimerStart('click');
    this.checkCorrectMove();
  };

  EventHandler.prototype._objSolveMove = function (move) {
    var movedCubes = this.cube.captureCubes(
      move.startPos,
      move.rayDir,
      move.sliceDir
    );

    for (var i = 0; i < this.cube.faces.length; i++) {
      var face = this.cube.faces[i];
      if (this.cube[face].rotationAxis === move.rotationAxis) {
        var moveString = face;
        var testCubes = this.cube.captureCubes(
          this.cube[face].vector.startPos,
          this.cube[face].vector.rayDir,
          this.cube[face].vector.sliceDir
        );

        if (movedCubes[~~(movedCubes.length/2)] === testCubes[~~(testCubes.length/2)]) {
          if (move.rotationDir === this.cube[face].rotationDir) {
            moveString += 'Prime';
          }
          this._stringSolveMove(moveString);
          return;
        }
      }
    }

    if (move.rotationDir === this.cube[face].rotationDir) {
      moveString += 'Prime';
    }
    this._stringSolveMove(moveString);
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

  EventHandler.prototype._showCorrectMove = function (keyPressed) {
    var fn = Game.Cube.keyToMoveMap[keyPressed];
    var oppFn = this.cube.oppositeMove(fn);

    if (fn === 'right') {
      oppFn = 'left';
    } else if (fn === 'left') {
      oppFn = 'right';
    } else if (fn === 'up') {
      oppFn = 'down';
    } else if (fn === 'down') {
      oppFn = 'up';
    }

    var oppLetter = Game.Cube.moveToKeyMap[oppFn];
    var move = $('<span>').addClass('available').text(oppLetter);
    $('.undo-moves').append(move);
  };

  EventHandler.prototype._sleep = function (milli) {
    clearInterval(this.interval);
    setTimeout(function () {
      this.interval = setInterval(this.triggerEvent.bind(this), 10);
    }.bind(this), milli);
  };

  EventHandler.prototype._stringSolveMove = function (move) {
    var key = Game.Cube.moveToKeyMap[move];
    var $letter = $('<span>').addClass('white').css('color', 'white');
    $letter.html(key);
    $('.solve-moves').append($letter);
  };
})();
