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
      case 74:
        that.cube.u();
        break;
      case 73:
        that.cube.r();
      default:
        console.log('key pressed');
        break;
    }
    draw();
  };

})();
