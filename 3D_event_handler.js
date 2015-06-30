(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = window.Game.EventHandler = function (cube) {
    this.cube = cube;
    this.eventLoop = [];
    this.scrambleMoves = [];
    this.started = false;
    this.timing = false;

    window.addEventListener('keyup', this.handleEvents.bind(this), false);
    window.addEventListener( 'mousedown', this.click.bind(this), false );
    window.addEventListener( 'mouseup', this.clickRelease.bind(this), false );
    this.triggerId = setInterval(this.triggerEvent.bind(this), 10);
  };

  EventHandler.prototype.click = function click( event ) {
    this.mousex = event.clientX;
    this.mousey = event.clientY;

    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if ( intersects.length > 0 ) {
      this.object = intersects[0];

      // var vector = new THREE.Vector3(this.object.face.normal.clone())
      // var test = vector.applyMatrix4(normalWorld);
      // this.normal = this.object.face.normal;
      var normalWorld = new THREE.Matrix4().extractRotation( this.object.object.matrixWorld ).multiplyVector3( this.object.face.normal.clone() );
      this.normal = normalWorld;
    }
  };

  EventHandler.prototype.clickRelease = function click( event ) {
    if (this.normal && this.normal.z == 1) {
      if (this.cube.right.indexOf(this.object.object) > -1) {
        if (event.clientY < this.mousey - 50) {
          this.cube.r();
        } else if (event.clientY > this.mousey + 50) {
          this.cube.rPrime();
        }
      }
    }
    this.normal = undefined;
  };

  EventHandler.prototype.displayElapsedTime = function () {
    this.startTime = this.startTime || new Date();
    var time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;
    $('.timer').text(time);
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this.started &&
      ((key.keyCode >= 67 && key.keyCode <= 77) ||
      (key.keyCode >= 80 && key.keyCode <= 85)) ) {
        this.timeId = setInterval(this.displayElapsedTime.bind(this), 60/1000);
        this.started = false;
        this.timing = true;
    }

    switch (key.keyCode) {
      case 13:
        this.solve();
        break;
      case 32: // space
        this.cube.isSolved = false;
        for (var i = 0; i < 5; i++) {
          var randIndex = ~~(Math.random() * this.cube.possibleMoves.length)
          var fn = this.cube.possibleMoves[randIndex];
          this.eventLoop.push(fn);

          var fnName = fn.name;
          if (fnName.indexOf('Prime') > -1) {
            fnName = fnName.slice(0, fnName.indexOf('Prime'));
          } else {
            fnName += 'Prime';
          }
          this.scrambleMoves.push(fnName);
        }
        this.started = true;
        break;
      case 65: // a
        this.eventLoop.push(this.cube.seeLeft);
        break;
      case 67: // c
        this.eventLoop.push(this.cube.seeUp);
        this.eventLoop.push(this.cube.r);
        break;
      case 68: // d
        this.eventLoop.push(this.cube.l);
        break;
      case 69: // e
        this.eventLoop.push(this.cube.lPrime);
        break;
      case 70: // f
        this.eventLoop.push(this.cube.uPrime);
        break;
      case 71: // g
        this.eventLoop.push(this.cube.fPrime);
        break;
      case 72: // h
        this.eventLoop.push(this.cube.f);
        break;
      case 73: // i
        this.eventLoop.push(this.cube.r);
        break;
      case 74: // j
        this.eventLoop.push(this.cube.u);
        break;
      case 75: // k
        this.eventLoop.push(this.cube.rPrime);
        break;
      case 76: // l
        this.eventLoop.push(this.cube.dPrime);
        break;
      case 77: // m
        this.eventLoop.push(this.cube.seeUp);
        this.eventLoop.push(this.cube.lPrime);
        break;
      case 78: // n
        this.eventLoop.push(this.cube.seeUp);
        break;
      case 80: // q
        this.eventLoop.push(this.cube.bPrime);
        break;
      case 81: // p
        this.eventLoop.push(this.cube.b);
        break;
      case 82: // r
        this.eventLoop.push(this.cube.seeDown);
        this.eventLoop.push(this.cube.rPrime);
        break;
      case 83: // s
        this.eventLoop.push(this.cube.d);
        break;
      case 85: // u
        this.eventLoop.push(this.cube.seeDown);
        this.eventLoop.push(this.cube.l);
        break;
      case 89: // y
        this.eventLoop.push(this.cube.seeDown);
        break;
      case 186: // semi-colon
        this.eventLoop.push(this.cube.seeRight);
        break;
    }
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
