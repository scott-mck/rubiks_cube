// TODO: Refactor clickRelease
// TODO: Move #scramble to Cube

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

    window.addEventListener('keyup', this.handleEvents.bind(this), false);
    window.addEventListener( 'mousedown', this.click.bind(this), false );
    window.addEventListener( 'mouseup', this.clickRelease.bind(this), false );
    this.triggerId = setInterval(this.triggerEvent.bind(this), 10);
  };

  EventHandler.prototype.click = function click( event ) {
    this.normal = undefined;
    this.mousex = event.clientX;
    this.mousey = event.clientY;

    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if ( intersects.length > 0 ) {
      var object = intersects[0];
      this.object = object.object;
      this.normal = new THREE.Matrix4().extractRotation( this.object.matrixWorld ).multiplyVector3( object.face.normal.clone() );
    }
  };

  EventHandler.prototype.clickRelease = function click( event ) {
    if (!this.normal) {
      if (event.clientX < this.mousex - 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'right'));
      } else if (event.clientX > this.mousex + 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'left'));
      } else if (event.clientY < this.mousey - 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
      } else if (event.clientY > this.mousey + 50) {
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
      }
      return;
    }

    if (this.scrambled) {
      $('h2').css('color', 'red');
      this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
      this.scrambled = false;
      this.timing = true;
    }

    if (this.normal.z == 1) { // front face
      if (this.cube.up.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
          return;
        }
      } else if (this.cube.down.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
          return;
        }
      }

      if (this.cube.right.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
          return;
        }
      } else if (this.cube.left.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
          return;
        }
      }

    } else if (this.normal.y == 1) { // top face
      if (this.cube.front.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
          return;
        }
      } else if (this.cube.back.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
          return;
        }
      }

      if (this.cube.right.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
          return;
        } else if (event.clientY > this.mousey + 40 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
          return;
        }
      } else if (this.cube.left.cubes.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 20 &&
            event.clientY > this.mousey + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
          return;
        } else if (event.clientX > this.mousex + 20 &&
                   event.clientY < this.mousey - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
          return;
        }
      }
    } else if (this.normal.x == 1) { // right face
      if (this.cube.up.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
          return;
        }
      } else if (this.cube.down.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
          return;
        }
      }

      if (this.cube.front.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
          return;
        }
      } else if (this.cube.back.cubes.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
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
    $('.solve-moves').empty();
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var letter = window.Game.Cube.keyMap[this.scrambleMoves[this.scrambleMoves.length - i - 1]]
      $('.solve-moves').append(letter).css('position', 'absolute');
    }
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this.scrambled &&
      ((key.keyCode >= 67 && key.keyCode <= 77) ||
      (key.keyCode >= 80 && key.keyCode <= 85)) ) {
        $('h2').css('color', 'red');
        this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
        this.scrambled = false;
        this.timing = true;
    }

    switch (key.keyCode) {
      case 13: // return
        this.scrambled = false;
        this.solve();
        break;
      case 32: // space
        $('.solve-moves').empty();
        $('.timer').text('0.00').css('color', 'white');
        this.scrambleMoves = [];
        this.cube.isSolved = false;
        this.scramble();
        break;
      case 65: // a
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'left'));
        break;
      case 67: // c
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
        break;
      case 68: // d
        this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
        break;
      case 69: // e
        this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
        break;
      case 70: // f
        this.eventLoop.push(this.cube.move.bind(this.cube, 'uPrime'));
        break;
      case 71: // g
        this.eventLoop.push(this.cube.move.bind(this.cube, 'fPrime'));
        break;
      case 72: // h
        this.eventLoop.push(this.cube.move.bind(this.cube, 'f'));
        break;
      case 73: // i
        this.eventLoop.push(this.cube.move.bind(this.cube, 'r'));
        break;
      case 74: // j
        this.eventLoop.push(this.cube.move.bind(this.cube, 'u'));
        break;
      case 75: // k
        this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
        break;
      case 76: // l
        this.eventLoop.push(this.cube.move.bind(this.cube, 'dPrime'));
        break;
      case 77: // m
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
        break;
      case 78: // n
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'up'));
        break;
      case 80: // q
        this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
        break;
      case 81: // p
        this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
        break;
      case 82: // r
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'down'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
        break;
      case 83: // s
        this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
        break;
      case 85: // u
        this.eventLoop.push(this.cube.rotateCube('down'));
        this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
        break;
      case 89: // y
        this.eventLoop.push(this.cube.rotateCube('down'));
        break;
      case 186: // semi-colon
        this.eventLoop.push(this.cube.rotateCube.bind(this.cube, 'right'));
        break;
      case 191: // '/'
        this.displaySolveMoves();
        break;
    }
  };

  EventHandler.prototype.scramble = function () {
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
    $('.solve').html('Click me to see solution!');
  };

  EventHandler.prototype.solve = function () {
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var fn = this.scrambleMoves[this.scrambleMoves.length - i - 1];
      this.eventLoop.push(this.cube.move.bind(this.cube, fn));
    }
    this.scrambleMoves = [];
  };

  EventHandler.prototype.stopTimer = function () {
    clearInterval(this.timeId);
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time).css('color', 'green');
  };

  EventHandler.prototype.triggerEvent = function () {
    if (this.cube.isSolved && this.timing) {
      this.eventLoop = [];
      this.stopTimer();
      this.timing = false;
      this.startTime = undefined;
    }
    if (!this.cube.animating && this.eventLoop.length > 0) {
      this.eventLoop.shift().call(this.cube);
    }
  };
})();
