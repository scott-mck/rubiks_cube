// TODO: Refactor clickRelease
// TODO: Keep track of average solve times
// TODO: Do not allow movement of cube while scrambling

(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = window.Game.EventHandler = function (cube) {
    this.cube = cube;
    this.eventLoop = [];
    this.scrambleMoves = [];
    this.scrambled = false;
    this.timing = false;

    $(window).on('keyup', this.handleEvents.bind(this));
    $('#canvas').on('mousedown', this.click.bind(this));
    $('#canvas').on('mouseup', this.clickRelease.bind(this));
    setInterval(this.triggerEvent.bind(this), 10);
  };

  EventHandler.prototype.click = function click(event) {
    this.normal = undefined;
    this.mousex = event.clientX;
    this.mousey = event.clientY;

    var canvasBox = renderer.domElement.getBoundingClientRect();
    var canvasMouseX = event.clientX - canvasBox.left;
    var canvasMouseY = event.clientY - canvasBox.top;

    var mouse = new THREE.Vector2();
    mouse.x = (canvasMouseX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(canvasMouseY / renderer.domElement.clientHeight) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      var object = intersects[0];
      this.object = object.object;
      this.normal = new THREE.Matrix4().extractRotation(this.object.matrixWorld)
        .multiplyVector3(object.face.normal.clone());
    }
  };

  EventHandler.prototype.clickRelease = function click( event ) {
    if (!this.normal) {
      if (event.clientX < this.mousex - 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'right'));
        this.scrambleMoves.push('left');
      } else if (event.clientX > this.mousex + 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'left'));
        this.scrambleMoves.push('right');
      } else if (event.clientY < this.mousey - 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
        this.scrambleMoves.push('up');
      } else if (event.clientY > this.mousey + 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.scrambleMoves.push('down');
      }
      return;
    }

    if (this.scrambled) {
      this.startTimer();
    }

    // RIGHT FACE
    if (this.normal.z == 1) {
      if (this.cube.up.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
          this.scrambleMoves.push('uPrime');
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
          this.scrambleMoves.push('u');
          return;
        }
      } else if (this.cube.down.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
          this.scrambleMoves.push('d');
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
          this.scrambleMoves.push('dPrime');
          return;
        }
      }

      if (this.cube.right.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
          this.scrambleMoves.push('rPrime');
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
          this.scrambleMoves.push('r');
          return;
        }
      } else if (this.cube.left.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
          this.scrambleMoves.push('l');
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
          this.scrambleMoves.push('lPrime');
          return;
        }
      }

      // UP FACE
    } else if (this.normal.y == 1) {
      if (this.cube.front.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
          this.scrambleMoves.push('f');
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
          this.scrambleMoves.push('fPrime');
          return;
        }
      } else if (this.cube.back.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
          this.scrambleMoves.push('bPrime');
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
          this.scrambleMoves.push('b');
          return;
        }
      }

      if (this.cube.right.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
          this.scrambleMoves.push('rPrime');
          return;
        } else if (event.clientY > this.mousey + 40 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
          this.scrambleMoves.push('r');
          return;
        }
      } else if (this.cube.left.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 20 &&
            event.clientY > this.mousey + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
          this.scrambleMoves.push('lPrime');
          return;
        } else if (event.clientX > this.mousex + 20 &&
                   event.clientY < this.mousey - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
          this.scrambleMoves.push('l');
          return;
        }
      }

      // RIGHT FACE
    } else if (this.normal.x == 1) {
      if (this.cube.up.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
          this.scrambleMoves.push('u');
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
          this.scrambleMoves.push('uPrime');
          return;
        }
      } else if (this.cube.down.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
          this.scrambleMoves.push('dPrime');
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
          this.scrambleMoves.push('d');
          return;
        }
      }

      if (this.cube.front.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
          this.scrambleMoves.push('f');
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
          this.scrambleMoves.push('fPrime');
          return;
        }
      } else if (this.cube.back.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
          this.scrambleMoves.push('bPrime');
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
          this.scrambleMoves.push('b');
          return;
        }
      }
    }
  };

  EventHandler.prototype.displayElapsedTime = function () {
    this.startTime = this.startTime || new Date();
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time.toFixed(2));
  };

  EventHandler.prototype.displaySolveMoves = function () {
    if (this.cube.solved()) {
      this.scrambleMoves = [];
    }
    $('.solve-moves').empty();
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var letter = window.Game.Cube.keyMap[this.scrambleMoves[this.scrambleMoves.length - i - 1]]
      $('.solve-moves').append(letter);
    }
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this.scrambled &&
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
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'left'));
        this.scrambleMoves.push('right');
        break;
      case 67: // c
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));

        this.scrambleMoves.push('down');
        this.scrambleMoves.push('rPrime');
        break;
      case 68: // d
        this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
        this.scrambleMoves.push('lPrime');
        break;
      case 69: // e
        this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
        this.scrambleMoves.push('l');
        break;
      case 70: // f
        this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
        this.scrambleMoves.push('u');
        break;
      case 71: // g
        this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
        this.scrambleMoves.push('f');
        break;
      case 72: // h
        this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
        this.scrambleMoves.push('fPrime');
        break;
      case 73: // i
        this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
        this.scrambleMoves.push('rPrime');
        break;
      case 74: // j
        this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
        this.scrambleMoves.push('uPrime');
        break;
      case 75: // k
        this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
        this.scrambleMoves.push('r');
        break;
      case 76: // l
        this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
        this.scrambleMoves.push('d');
        break;
      case 77: // m
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));

        this.scrambleMoves.push('down');
        this.scrambleMoves.push('l');
        break;
      case 78: // n
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.scrambleMoves.push('down');
        break;
      case 80: // q
        this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
        this.scrambleMoves.push('b');
        break;
      case 81: // p
        this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
        this.scrambleMoves.push('bPrime');
        break;
      case 82: // r
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));

        this.scrambleMoves.push('up');
        this.scrambleMoves.push('r');
        break;
      case 83: // s
        this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
        this.scrambleMoves.push('dPrime');
        break;
      case 85: // u
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));

        this.scrambleMoves.push('up');
        this.scrambleMoves.push('lPrime');
        break;
      case 89: // y
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
        this.scrambleMoves.push('up');
        break;
      case 186: // semi-colon
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'right'));
        this.scrambleMoves.push('left');
        break;
    }
  };

  EventHandler.prototype.sampleSolve = function () {
    this.cube.isSolved = false;
    var scramble = 'iqssdllklffesshqsfpgldsdpjllhh';
    var solve = ';; yy; ;; a ; dkgjijdjyy ; ; fijiifi ; ;; jejdijk;ijjkfdjjeajefd hejjdjjdhheh f kfi;ii;skjifilhh';
    for (var i = 0; i < scramble.length; i++) {
      this.eventLoop.push(this.cube.move.bind(
        this.cube,
        window.Game.Cube.inverseKeyMap[scramble[i]]
      ));
    }

    setTimeout(function () {
      for (var i = 0; i < solve.length; i++) {
        if (solve[i] === ' ') {
          this.eventLoop.push(this._sleep.bind(this, 400));
        } else {
          this.eventLoop.push(this.cube.move.bind(
            this.cube,
            window.Game.Cube.inverseKeyMap[solve[i]]
          ));
        }
      }
    }.bind(this), 5000);
  };

  EventHandler.prototype._sleep = function (milli) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milli) {
        break;
      }
    }
  };

  EventHandler.prototype.scramble = function () {
    $('.solve-moves').empty();
    $('.timer').text('0.00').css('color', 'white');
    $('.scramble').addClass('solve').html('Solve');
    var oppositeMove = '';
    var prevRandIndex = -1;
    for (var i = 0; i < 30; i++) {
      var randIndex = ~~(Math.random() * this.cube.possibleMoves.length);
      fn = this.cube.possibleMoves[randIndex];
      while (fn === oppositeMove || randIndex == prevRandIndex) {
        randIndex = ~~(Math.random() * this.cube.possibleMoves.length);
        fn = this.cube.possibleMoves[randIndex];
      }
      this.eventLoop.push(this.cube.move.bind(this.cube, fn));
      if (fn.indexOf('Prime') > -1) {
        oppositeMove = fn.slice(0, fn.indexOf('Prime'));
      } else {
        oppositeMove = fn + 'Prime';
      }
      this.scrambleMoves.push(oppositeMove);
    }
    this.scrambled = true;
  };

  EventHandler.prototype.solve = function () {
    this.scrambled = false;
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var fn = this.scrambleMoves[this.scrambleMoves.length - i - 1];
      this.eventLoop.push(this.cube.move.bind(this.cube, fn));
    }
    this.scrambleMoves = [];
    $('.scramble').removeClass('solve').html('Scramble');
  };

  EventHandler.prototype.startTimer = function () {
    $('.timer').css('color', 'red');
    this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
    this.scrambled = false;
    this.timing = true;
  };

  EventHandler.prototype.stopTimer = function () {
    clearInterval(this.timeId);
    this.timing = false;
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time).css('color', 'green');
    $('.scramble').removeClass('solve').html('Scramble');
    $('.solve-moves').empty();
  };

  EventHandler.prototype.triggerEvent = function () {
    if (this.cube.solved() && this.timing) {
      this.stopTimer();
      this.eventLoop = [];
      this.scrambleMoves = [];
      this.startTime = undefined;
    }
    if (!this.cube.animating && this.eventLoop.length > 0) {
      this.eventLoop.shift().call(this.cube);
    }
    if (this.cube.solved()) {
      $('.solve-moves').empty();
      this.scrambleMoves = [];
    }
  };
})();
