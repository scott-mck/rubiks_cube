// TODO: Keep track of average solve times
// TODO: Do not allow movement of cube while scrambling
// TODO: make more 'videos'

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
    this._sampling = false;

    $(window).on('keyup', this.handleEvents.bind(this));
    $('#canvas').on('mousedown', this.click.bind(this));
    this.interval = setInterval(this.triggerEvent.bind(this), 10);
  };

  Game.EventHandler.keyCodeMap = {
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
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    85: 'u',
    89: 'y',
    186: ';'
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
    console.log(keyPressed);
    console.log(letterToCheck.text());

    if (letterToCheck.text() === keyPressed) {
      letterToCheck.removeClass('white');
      letterToCheck.css('color', 'green');
    } else {
      this._showCorrectMove(keyPressed);
      letterToCheck.css('color', 'red');
    }
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
    if (this._cube.isSolved) {
      this.scrambleMoves = [];
    }
    if (this.displayedMoves) {
      return;
    }
    this.displayedMoves = true;

    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var move = this.scrambleMoves[this.scrambleMoves.length - i - 1];
      var key = Game.Cube.moveToKeyMap[move];

      var $letter = $('<span>').addClass('white').css('color', 'white');
      $letter.html(key);
      $('.solve-moves').append($letter);
    }
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this._scrambled &&
      ((key.keyCode >= 67 && key.keyCode <= 77) ||
      (key.keyCode >= 80 && key.keyCode <= 85)) ) {
        this.startTimer();
    }
    if (this._cube.isSolved) {
      this.hideSolveMoves();
      $('.undo-moves').empty();
    }

    var keyPressed = Game.EventHandler.keyCodeMap[key.keyCode];
    this.checkCorrectMove(keyPressed);

    switch (keyPressed) {
      case 'return':
        this.displaySolveMoves();
        break;
      case 'space':
        if ($('.scramble').hasClass('solve')) {
          $('.scramble').removeClass('solve');
          this.solve();
        } else {
          $('.scramble').addClass('solve');
          this.scramble();
        }
        break;
      case 'a':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'left'));
        this.scrambleMoves.push('right');
        break;
      case 'c':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'up'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'r'));
        this.scrambleMoves.push('down');
        this.scrambleMoves.push('rPrime');
        break;
      case 'd':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'l'));
        this.scrambleMoves.push('lPrime');
        break;
      case 'e':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'lPrime'));
        this.scrambleMoves.push('l');
        break;
      case 'f':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'uPrime'));
        this.scrambleMoves.push('u');
        break;
      case 'g':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'fPrime'));
        this.scrambleMoves.push('f');
        break;
      case 'h':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'f'));
        this.scrambleMoves.push('fPrime');
        break;
      case 'i':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'r'));
        this.scrambleMoves.push('rPrime');
        break;
      case 'j':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'u'));
        this.scrambleMoves.push('uPrime');
        break;
      case 'k':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'rPrime'));
        this.scrambleMoves.push('r');
        break;
      case 'l':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'dPrime'));
        this.scrambleMoves.push('d');
        break;
      case 'm':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'up'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'lPrime'));
        this.scrambleMoves.push('down');
        this.scrambleMoves.push('l');
        break;
      case 'n':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'up'));
        this.scrambleMoves.push('down');
        break;
      case 'p':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'bPrime'));
        this.scrambleMoves.push('b');
        break;
      case 'q':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'b'));
        this.scrambleMoves.push('bPrime');
        break;
      case 'r':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'down'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'rPrime'));
        this.scrambleMoves.push('up');
        this.scrambleMoves.push('r');
        break;
      case 's':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'd'));
        this.scrambleMoves.push('dPrime');
        break;
      case 'u':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'down'));
        this._eventLoop.push(this._cube.move.bind(this._cube, 'l'));
        this.scrambleMoves.push('up');
        this.scrambleMoves.push('lPrime');
        break;
      case 'y':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'down'));
        this.scrambleMoves.push('up');
        break;
      case  ';':
        this._eventLoop.push(this._cube.move.bind(this._cube, 'right'));
        this.scrambleMoves.push('left');
        break;
    }
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
        this._cube.move.bind(this._cube, Game.Cube.keyToMoveMap[scramble[i]])
      );
    }

    for (var i = 0; i < solve.length; i++) {
      if (solve[i] === ' ') {
        this._eventLoop.push(this._sleep.bind(this, 400));
      } else {
        this._eventLoop.push(
          this._cube.move.bind(this._cube, Game.Cube.keyToMoveMap[solve[i]])
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
    this.hideSolveMoves();
    $('.timer').text('0.00').css('color', 'white');
    $('.scramble').addClass('solve').html('Solve');

    var prevMove = ''; // no two scramble moves are the same
    var oppositeMove = ''; // no two scramble moves cancel out

    for (var i = 0; i < 30; i++) {
      // Get random move, make sure no two in a row are the same
      var randMove = this._cube.randomMove();
      while (randMove === oppositeMove || randMove === prevMove) {
        randMove = this._cube.randomMove();
      }
      this._eventLoop.push(this._cube.move.bind(this._cube, randMove));
      prevMove = randMove;
      oppositeMove = this._cube.oppositeMove(randMove);

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
  };

  EventHandler.prototype.triggerEvent = function () {
    if (this._cube.isSolved && this._timing) {
      this.stopTimer();
      this._eventLoop = [];
      this.scrambleMoves = [];
      this.startTime = undefined;
    }
    if (!this._cube.animating && this._eventLoop.length > 0) {
      this._eventLoop.shift().call(this._cube);
    }
    if (this._cube.isSolved) {
      this.scrambleMoves = [];
      $('.solve-moves span').css('color', 'gold');
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
      this.scrambleMoves.push(this._cube.oppositeMove(callbacks.leftCallback));
    } else if (mouseUp.clientX < mouseDown.clientX - 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.rightCallback)
      );
      this.scrambleMoves.push(this._cube.oppositeMove(callbacks.rightCallback));
    } else if (mouseUp.clientY > mouseDown.clientY + 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.downCallback)
      );
      this.scrambleMoves.push(this._cube.oppositeMove(callbacks.downCallback));
    } else if (mouseUp.clientY < mouseDown.clientY - 40) {
      this._eventLoop.push(
        this._cube.move.bind(this._cube, callbacks.upCallback)
      );
      this.scrambleMoves.push(this._cube.oppositeMove(callbacks.upCallback));
    }
  };

  EventHandler.prototype._showCorrectMove = function (keyPressed) {
    var fn = Game.Cube.keyToMoveMap[keyPressed];
    var oppFn = this._cube.oppositeMove(fn);

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
})();
