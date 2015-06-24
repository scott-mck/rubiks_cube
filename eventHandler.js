(function () {
  if (typeof Game === "undefined") {
    window.Game = {};
  }

  var EventHandler = Game.EventHandler = function (cube) {
    this.cube = cube;
    window.addEventListener('keyup', this.handleEvents.bind(this), false);
  };

  EventHandler.prototype.handleEvents = function (key) {
    // debugger
    var that = this;
    switch (key.keyCode) {
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
      default:
        console.log('key pressed');
        break;
    }
    draw();
    console.log(this.cube.up[0]);
    console.log(this.cube.up[1]);
    console.log(this.cube.up[2]);
    console.log('');
    console.log(this.cube.right[0]);
    console.log(this.cube.right[1]);
    console.log(this.cube.right[2]);
    console.log('');
  };

})();
