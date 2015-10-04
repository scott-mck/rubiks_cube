// TODO: Keep track of average solve times
// TODO: Do not allow movement of cube while scrambling
// TODO: Make title in THREE.js -- easier to move cube

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = window.Game.EventHandler = function (cube) {
    this._cube = cube;
    this._eventLoop = [];
    this.scrambleMoves = [];
    this._scrambled = false;
    this._timing = false;

    $(window).on('keyup', this.handleEvents.bind(this));
    $('#canvas').on('mousedown', this.click.bind(this));
    setInterval(this.triggerEvent.bind(this), 10);
  };

  EventHandler.prototype.click = function (event) {
    // Callbacks will be mutated depending on which cube face the user clicks on
    var callbacks = {
      leftCallback: 'leftCallbackString',
      rightCallback: 'rightCallbackString',
      upCallback: 'upCallbackString',
      downCallback: 'downCallbackString'
    };
    var intersects = this._getIntersects(event);

    if (intersects.length === 0) {
      this._getRotateCallbacks(callbacks);
      $('#canvas').one('mouseup', this._mouseUpCallback.bind(this, callbacks, event));
    } else {
      var clickedCube = intersects[0].object;
      var normal = new THREE.Matrix4().extractRotation(clickedCube.matrixWorld)
        .multiplyVector3(intersects[0].face.normal.clone());

      if (normal.x === 1) {
        this._getRightCallbacks(clickedCube, normal, callbacks);
      } else if (normal.y === 1) {
        this._getUpCallbacks(clickedCube, normal, callbacks);
      } else if (normal.z === 1) {
        this._getFrontCallbacks(clickedCube, normal, callbacks);
      }

      // When user releases mouse, this function is called and is passed the set
      // of possible callbacks, the mousedown event, and the mouseup event
      $('#canvas').one('mouseup', this._mouseUpCallback.bind(this, callbacks, event));
    }
  };

  EventHandler.prototype.displayElapsedTime = function () {
    this.startTime = this.startTime || new Date();
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time.toFixed(2));
  };

  EventHandler.prototype.displaySolveMoves = function () {
    if (this._cube.solved()) {
      this.scrambleMoves = [];
    }
    $('.solve-moves').empty();
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var letter = window.Game.Cube.keyMap[this.scrambleMoves[this.scrambleMoves.length - i - 1]]
      $('.solve-moves').append(letter);
    }
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this._scrambled &&
      ((key.keyCode >= 67 && key.keyCode <= 77) ||
      (key.keyCode >= 80 && key.keyCode <= 85)) ) {
        this.startTimer();
    }

    switch (key.keyCode) {
      case 13: // return
        this.displaySolveMoves();
        break;
      case 32: // space
        if ($('.scramble').hasClass('solve')) {
          $('.scramble').removeClass('solve');
          this.solve();
        } else {
          $('.scramble').addClass('solve');
          this.scramble();
        }
        break;
      case 65: // a
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'left'));
        this.scrambleMoves.push('right');
        break;
      case 67: // c
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'up'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'r'));
        this.scrambleMoves.push('down');
        this.scrambleMoves.push('rPrime');
        break;
      case 68: // d
        this._eventLoop.push(this._cube.move.bind(this._cube, 'l'));
        this.scrambleMoves.push('lPrime');
        break;
      case 69: // e
        this._eventLoop.push(this._cube.move.bind(this._cube, 'lPrime'));
        this.scrambleMoves.push('l');
        break;
      case 70: // f
        this._eventLoop.push(this._cube.move.bind(this._cube, 'uPrime'));
        this.scrambleMoves.push('u');
        break;
      case 71: // g
        this._eventLoop.push(this._cube.move.bind(this._cube, 'fPrime'));
        this.scrambleMoves.push('f');
        break;
      case 72: // h
        this._eventLoop.push(this._cube.move.bind(this._cube, 'f'));
        this.scrambleMoves.push('fPrime');
        break;
      case 73: // i
        this._eventLoop.push(this._cube.move.bind(this._cube, 'r'));
        this.scrambleMoves.push('rPrime');
        break;
      case 74: // j
        this._eventLoop.push(this._cube.move.bind(this._cube, 'u'));
        this.scrambleMoves.push('uPrime');
        break;
      case 75: // k
        this._eventLoop.push(this._cube.move.bind(this._cube, 'rPrime'));
        this.scrambleMoves.push('r');
        break;
      case 76: // l
        this._eventLoop.push(this._cube.move.bind(this._cube, 'dPrime'));
        this.scrambleMoves.push('d');
        break;
      case 77: // m
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'up'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'lPrime'));
        this.scrambleMoves.push('down');
        this.scrambleMoves.push('l');
        break;
      case 78: // n
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'up'));
        this.scrambleMoves.push('down');
        break;
      case 80: // q
        this._eventLoop.push(this._cube.move.bind(this._cube, 'bPrime'));
        this.scrambleMoves.push('b');
        break;
      case 81: // p
        this._eventLoop.push(this._cube.move.bind(this._cube, 'b'));
        this.scrambleMoves.push('bPrime');
        break;
      case 82: // r
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'down'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'rPrime'));
        this.scrambleMoves.push('up');
        this.scrambleMoves.push('r');
        break;
      case 83: // s
        this._eventLoop.push(this._cube.move.bind(this._cube, 'd'));
        this.scrambleMoves.push('dPrime');
        break;
      case 85: // u
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'down'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'l'));
        this.scrambleMoves.push('up');
        this.scrambleMoves.push('lPrime');
        break;
      case 89: // y
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'down'));
        this.scrambleMoves.push('up');
        break;
      case 186: // semi-colon
        this._eventLoop.push(this._cube.rotateCube.bind(this._cube, 'right'));
        this.scrambleMoves.push('left');
        break;
    }
  };

  EventHandler.prototype.sampleSolve = function () {
    this._cube.isSolved = false;
    var scramble = 'iqssdllklffesshqsfpgldsdpjllhh';
    var solve = ';; yy; ;; a ; dkgjijdjyy ; ; fijiifi ; ;; jejdijk;ijjkfdjjeajefd hejjdjjdhheh f kfi;ii;skjifilhh';
    for (var i = 0; i < scramble.length; i++) {
      this._eventLoop.push(this._cube.move.bind(
        this._cube,
        window.Game.Cube.inverseKeyMap[scramble[i]]
      ));
    }

    setTimeout(function () {
      for (var i = 0; i < solve.length; i++) {
        if (solve[i] === ' ') {
          this._eventLoop.push(this._sleep.bind(this, 400));
        } else {
          this._eventLoop.push(this._cube.move.bind(
            this._cube,
            window.Game.Cube.inverseKeyMap[solve[i]]
          ));
        }
      }
    }.bind(this), 5000);
  };

  EventHandler.prototype.scramble = function () {
    $('.solve-moves').empty();
    $('.timer').text('0.00').css('color', 'white');
    $('.scramble').addClass('solve').html('Solve');
    var oppositeMove = '';
    var prevRandIndex = -1;
    for (var i = 0; i < 30; i++) {
      var randIndex = ~~(Math.random() * this._cube.possibleMoves.length);
      fn = this._cube.possibleMoves[randIndex];
      while (fn === oppositeMove || randIndex == prevRandIndex) {
        randIndex = ~~(Math.random() * this._cube.possibleMoves.length);
        fn = this._cube.possibleMoves[randIndex];
      }
      this._eventLoop.push(this._cube.move.bind(this._cube, fn));
      if (fn.indexOf('Prime') > -1) {
        oppositeMove = fn.slice(0, fn.indexOf('Prime'));
      } else {
        oppositeMove = fn + 'Prime';
      }
      this.scrambleMoves.push(oppositeMove);
    }
    this._scrambled = true;
  };

  EventHandler.prototype.solve = function () {
    this._scrambled = false;
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var fn = this.scrambleMoves[this.scrambleMoves.length - i - 1];
      this._eventLoop.push(this._cube.move.bind(this._cube, fn));
    }
    this.scrambleMoves = [];
    $('.scramble').removeClass('solve').html('Scramble');
  };

  EventHandler.prototype.startTimer = function () {
    $('.timer').css('color', 'red');
    this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
    this._scrambled = false;
    this._timing = true;
  };

  EventHandler.prototype.stopTimer = function () {
    clearInterval(this.timeId);
    this._timing = false;
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time).css('color', 'green');
    $('.scramble').removeClass('solve').html('Scramble');
    $('.solve-moves').empty();
  };

  EventHandler.prototype.triggerEvent = function () {
    if (this._cube.solved() && this._timing) {
      this.stopTimer();
      this._eventLoop = [];
      this.scrambleMoves = [];
      this.startTime = undefined;
    }
    if (!this._cube.animating && this._eventLoop.length > 0) {
      this._eventLoop.shift().call(this._cube);
    }
    if (this._cube.solved()) {
      $('.solve-moves').empty();
      this.scrambleMoves = [];
    }
  };

  EventHandler.prototype._getFrontCallbacks = function (clickedCube, normal, callbacks) {
    var cubeX = clickedCube.position.x;
    var cubeY = clickedCube.position.y;

    // Get possible vertical moves
    if (~~cubeX > 0) {
      callbacks.upCallback = 'r';
      callbacks.downCallback = 'rPrime';
    } else if (~~cubeX < 0) {
      callbacks.upCallback = 'lPrime';
      callbacks.downCallback = 'l';
    }

    // Get possible horizontal moves
    if (~~cubeY > 0) {
      callbacks.leftCallback = 'uPrime';
      callbacks.rightCallback = 'u';
    } else if (~~cubeY < 0) {
      callbacks.leftCallback = 'd';
      callbacks.rightCallback = 'dPrime';
    }
  };

  EventHandler.prototype._getIntersects = function (event) {
    var canvasBox = renderer.domElement.getBoundingClientRect();
    var canvasMouseX = event.clientX - canvasBox.left;
    var canvasMouseY = event.clientY - canvasBox.top;

    var mouse = new THREE.Vector2();
    mouse.x = (canvasMouseX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(canvasMouseY / renderer.domElement.clientHeight) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children);
  };

  EventHandler.prototype._getRightCallbacks = function (clickedCube, normal, callbacks) {
    var cubeY = clickedCube.position.y;
    var cubeZ = clickedCube.position.z;

    // Get possible vertical moves
    if (~~cubeY > 0) {
      callbacks.leftCallback = 'uPrime';
      callbacks.rightCallback = 'u';
    } else if (~~cubeY < 0) {
      callbacks.leftCallback = 'd';
      callbacks.rightCallback = 'dPrime';
    }

    // Get possible horizontal moves
    if (~~cubeZ > 0) {
      callbacks.upCallback = 'fPrime';
      callbacks.downCallback = 'f';
    } else if (~~cubeZ < 0) {
      callbacks.upCallback = 'b';
      callbacks.downCallback = 'bPrime';
    }
  };

  EventHandler.prototype._getRotateCallbacks = function (callbacks) {
    callbacks.leftCallback = 'left';
    callbacks.rightCallback = 'right';
    callbacks.upCallback = 'down';
    callbacks.downCallback = 'up';
  };

  EventHandler.prototype._getUpCallbacks = function (clickedCube, normal, callbacks) {
    var cubeX = clickedCube.position.x;
    var cubeZ = clickedCube.position.z;

    // Get possible vertical moves
    if (~~cubeX > 0) {
      callbacks.upCallback = 'r';
      callbacks.downCallback = 'rPrime';
    } else if (~~cubeX < 0) {
      callbacks.upCallback = 'lPrime';
      callbacks.downCallback = 'l';
    }

    // Get possible horizontal moves
    if (~~cubeZ > 0) {
      callbacks.leftCallback = 'f';
      callbacks.rightCallback = 'fPrime';
    } else if (~~cubeZ < 0) {
      callbacks.leftCallback = 'bPrime';
      callbacks.rightCallback = 'b';
    }
  };

  EventHandler.prototype._mouseUpCallback = function (callbacks, mouseDown, mouseUp) {
    if (mouseUp.clientX > mouseDown.clientX + 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.leftCallback)
      );
    } else if (mouseUp.clientX < mouseDown.clientX - 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.rightCallback)
      );
    } else if (mouseUp.clientY > mouseDown.clientY + 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.downCallback)
      );
    } else if (mouseUp.clientY < mouseDown.clientY - 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.upCallback)
      );
    }
  };

  EventHandler.prototype._sleep = function (milli) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milli) {
        break;
      }
    }
  };
})();
