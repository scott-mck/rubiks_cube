(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = window.Game.EventHandler = function (cube, game) {
    this.cube = cube;
    this.game = game;
    this.eventLoop = [];
    // this.started = false;
    window.addEventListener('keyup', this.handleEvents.bind(this), false);
    setInterval(this.triggerEvent.bind(this), 100);
  };

  EventHandler.prototype.handleEvents = function (key) {
    if ( this.started &&
      ((key.keyCode >= 67 && key.keyCode <= 77) ||
      (key.keyCode >= 82 && key.keyCode <= 85)) ) {
        this.game.startTimer();
        this.started = false;
    }

    switch (key.keyCode) {
      case 32:
        if (!this.game.timing) {
          this.cube.scramble();
          this.started = true;
        }
        break;
      case 65:
        this.eventLoop.push(this.cube.seeLeft);
        break;
      case 67:
        this.eventLoop.push(this.cube.doubleL);
        break;
      case 68:
        this.eventLoop.push(this.cube.l);
        break;
      case 69:
        this.eventLoop.push(this.cube.lPrime);
        break;
      case 70:
        this.eventLoop.push(this.cube.uPrime);
        break;
      case 71:
        this.eventLoop.push(this.cube.fPrime);
        break;
      case 72:
        this.eventLoop.push(this.cube.f);
        break;
      case 73:
        // this.cube.r();
        this.eventLoop.push(this.cube.r);
        break;
      case 74:
        // this.cube.u();
        this.eventLoop.push(this.cube.u);
        break;
      case 75:
        this.eventLoop.push(this.cube.rPrime);
        break;
      case 76:
        this.eventLoop.push(this.cube.dPrim);
        break;
      case 77:
        this.eventLoop.push(this.cube.doubleRPrime);
        break;
      case 78:
        this.eventLoop.push(this.cube.seeUp);
        break;
      case 82:
        this.eventLoop.push(this.cube.doubleLPrime);
        break;
      case 83:
        this.eventLoop.push(this.cube.d);
        break;
      case 85:
        this.eventLoop.push(this.cube.doubleR);
        break;
      case 89:
        this.eventLoop.push(this.cube.seeDown);
        break;
      case 186:
        this.eventLoop.push(this.cube.seeRight);
        break;
    }
  };

  EventHandler.prototype.triggerEvent = function () {
    if (!this.cube.animating && this.eventLoop.length > 0) {
      this.eventLoop.shift().call(this.cube);
    }
  };
})();
