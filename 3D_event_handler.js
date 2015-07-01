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
        this.cube.seeRight();
      } else if (event.clientX > this.mousex + 50) {
        this.cube.seeLeft();
      } else if (event.clientY < this.mousey - 50) {
        this.cube.seeDown();
      } else if (event.clientY > this.mousey + 50) {
        this.cube.seeUp();
      }
      return;
    }

    if (this.scrambled) {
      this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
      this.scrambled = false;
      this.timing = true;
    }

    if (this.normal.z == 1) { // front face
      if (this.cube.right.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.cube.r();
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.cube.rPrime();
          return;
        }
      } else if (this.cube.left.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.cube.lPrime();
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.cube.l();
          return;
        }
      }

      if (this.cube.up.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.cube.u();
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.cube.uPrime();
          return;
        }
      } else if (this.cube.down.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 40) {
          this.cube.dPrime();
          return;
        } else if (event.clientX > this.mousex + 40) {
          this.cube.d();
          return;
        }
      }
    } else if (this.normal.y == 1) { // top face
      if (this.cube.front.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.cube.fPrime();
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.cube.f();
          return;
        }
      } else if (this.cube.back.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 30 &&
            event.clientY < this.mousey - 10) {
          this.cube.b();
          return;
        } else if (event.clientX > this.mousex + 30 &&
                   event.clientY > this.mousey + 10) {
          this.cube.bPrime();
          return;
        }
      }

      if (this.cube.right.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.cube.r();
          return;
        } else if (event.clientY > this.mousey + 40 &&
                   event.clientX < this.mousex - 20) {
          this.cube.rPrime();
          return;
        }
      } else if (this.cube.left.indexOf(this.object) > -1) {
        if (event.clientX < this.mousex - 20 &&
            event.clientY > this.mousey + 20) {
          this.cube.l();
          return;
        } else if (event.clientX > this.mousex + 20 &&
                   event.clientY < this.mousey - 20) {
          this.cube.lPrime();
          return;
        }
      }
    } else if (this.normal.x == 1) { // right face
      if (this.cube.up.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.cube.uPrime();
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.cube.u();
          return;
        }
      } else if (this.cube.down.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 20 &&
            event.clientX > this.mousex + 20) {
          this.cube.d();
          return;
        } else if (event.clientY > this.mousey + 20 &&
                   event.clientX < this.mousex - 20) {
          this.cube.dPrime();
          return;
        }
      }

      if (this.cube.front.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.cube.fPrime();
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.cube.f();
          return;
        }
      } else if (this.cube.back.indexOf(this.object) > -1) {
        if (event.clientY < this.mousey - 40) {
          this.cube.b();
          return;
        } else if (event.clientY > this.mousey + 40) {
          this.cube.bPrime();
          return;
        }
      }
    }
  };

  EventHandler.prototype.displayElapsedTime = function () {
    this.startTime = this.startTime || new Date();
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time);
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
        this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
        this.scrambled = false;
        this.timing = true;
    }

    switch (key.keyCode) {
      case 13: // return
        this.solve();
        break;
      case 32: // space
        $('.solve-moves').empty();
        this.scrambleMoves = [];
        this.cube.isSolved = false;
        this.scramble();
        break;
      case 65: // a
        this.eventLoop.push(this.cube.seeLeft);
        break;
      case 67: // c
        this.eventLoop.push(this.cube.seeUp);
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
        this.eventLoop.push(this.cube.seeUp);
        this.eventLoop.push(this.cube.move.bind(this.cube, 'lPrime'));
        break;
      case 78: // n
        this.eventLoop.push(this.cube.seeUp);
        break;
      case 80: // q
        this.eventLoop.push(this.cube.move.bind(this.cube, 'bPrime'));
        break;
      case 81: // p
        this.eventLoop.push(this.cube.move.bind(this.cube, 'b'));
        break;
      case 82: // r
        this.eventLoop.push(this.cube.seeDown);
        this.eventLoop.push(this.cube.move.bind(this.cube, 'rPrime'));
        break;
      case 83: // s
        this.eventLoop.push(this.cube.move.bind(this.cube, 'd'));
        break;
      case 85: // u
        this.eventLoop.push(this.cube.seeDown);
        this.eventLoop.push(this.cube.move.bind(this.cube, 'l'));
        break;
      case 89: // y
        this.eventLoop.push(this.cube.seeDown);
        break;
      case 186: // semi-colon
        this.eventLoop.push(this.cube.seeRight);
        break;
      case 191: // '/'
        this.displaySolveMoves();
        break;
    }
  };

  EventHandler.prototype.scramble = function () {
    for (var i = 0; i < 30; i++) {
      var oppositeMove = oppositeMove || '';
      var randIndex = ~~(Math.random() * this.cube.possibleMoves.length);
      fn = this.cube.possibleMoves[randIndex];
      while (fn === oppositeMove ||
             (fn === this.eventLoop[this.eventLoop.length - 1] &&
             fn === this.eventLoop[this.eventLoop.length - 2])) {
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
    for (var i = 0; i < this.scrambleMoves.length; i++) {
      var fn = this.scrambleMoves[this.scrambleMoves.length - i - 1];
      this.eventLoop.push(this.cube[fn]);
    }
    this.scrambleMoves = [];
  };

  EventHandler.prototype.stopTimer = function () {
    clearInterval(this.timeId);
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time);
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
