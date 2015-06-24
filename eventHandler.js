(function () {
  if (typeof Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = Game.EventHandler = function (cube) {
    this.cube = cube;
    window.addEventListener('keyup', this.handleEvents.bind(this), false);
  };

  EventHandler.prototype.handleEvents = function (key) {
    var that = this;
    switch (key.keyCode) {
      case 65:
        that.cube.seeLeft();
        break;
      case 68:
        that.cube.l();
        break;
      case 69:
        that.cube.lPrime();
        break;
      case 70:
        that.cube.uPrime();
        break;
      case 71:
        that.cube.fPrime();
        break;
      case 72:
        that.cube.f();
        break;
      case 73:
        that.cube.r();
        break;
      case 74:
        that.cube.u();
        break;
      case 75:
        that.cube.rPrime();
        break;
      case 76:
        that.cube.dPrime();
        break;
      case 83:
        that.cube.d();
        break;
      case 186:
        that.cube.seeRight();
        break;
    }
    draw();
  };
})();
