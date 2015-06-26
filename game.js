(function () {
  if (typeof window.Game === "undefined") {
    window.Game = {};
  }

  var Game = window.Game.Game = function (canvas, cube) {
    this.canvas = canvas;
    this.cube = cube;
    this.ctx = this.canvas.getContext("2d");
    this.timing = false;
  };

  Game.prototype.draw = function() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Rubik's Cube", canvas.width/2, 100);

    for (var i = 0; i < 3 ; i++) {
      for (var j = 0; j < 3 ; j++) {
        //SHOW FRONT FACE
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect (500 + 100 * j, 300 + 100 * i, 99, 99);
        this.ctx.fillStyle = this.cube.colors[this.cube.front[i][j]];
        this.ctx.fillRect (503 + 100 * j, 303 + 100 * i, 93, 93);

        //SHOW TOP FACE
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.beginPath();
        this.ctx.moveTo(500 + 100 * j + 50 * (2 - i), 298 - 41 * (2 - i));
        this.ctx.lineTo(550 + 100 * j + 50 * (2 - i), 258 - 41 * (2 - i));
        this.ctx.lineTo(647 + 100 * j + 50 * (2 - i), 258 - 41 * (2 - i));
        this.ctx.lineTo(598 + 100 * j + 50 * (2 - i), 298 - 41 * (2 - i));
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = this.cube.colors[this.cube.up[i][j]];
        this.ctx.beginPath();
        this.ctx.moveTo(508 + 100 * j + 50 * (2 - i), 295 - 41 * (2 - i));
        this.ctx.lineTo(553 + 100 * j + 50 * (2 - i), 260 - 41 * (2 - i));
        this.ctx.lineTo(640 + 100 * j + 50 * (2 - i), 260 - 41 * (2 - i));
        this.ctx.lineTo(596 + 100 * j + 50 * (2 - i), 295 - 41 * (2 - i));
        this.ctx.closePath();
        this.ctx.fill();

        //SHOW RIGHT FACE
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.beginPath();
        this.ctx.moveTo(801 + 50 * j, 300 + 100 * i - 41 * j);
        this.ctx.lineTo(847 + 50 * j, 262 + 100 * i - 41 * j);
        this.ctx.lineTo(847 + 50 * j, 360 + 100 * i - 41 * j);
        this.ctx.lineTo(801 + 50 * j, 398 + 100 * i - 41 * j);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = this.cube.colors[this.cube.right[i][j]];
        this.ctx.beginPath();
        this.ctx.moveTo(805 + 50 * j, 302 + 100 * i - 41 * j);
        this.ctx.lineTo(844 + 50 * j, 270 + 100 * i - 41 * j);
        this.ctx.lineTo(844 + 50 * j, 357 + 100 * i - 41 * j);
        this.ctx.lineTo(805 + 50 * j, 390 + 100 * i - 41 * j);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }

    this.drawStaticTimer();
  };

  Game.prototype.drawElapsedTime = function () {
    this.ctx.clearRect(600, 600, this.canvas.width, this.canvas.height);
    this.time = Math.round(parseInt(new Date() - this.startTime) / 10) / 100;

    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.time, this.canvas.width/2, 700);
  };

  Game.prototype.drawStaticTimer = function () {
    this.time = this.time || "0:00";
    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.time, this.canvas.width/2, 700);
  };

  Game.prototype.endTimer = function () {
    this.timing = false;
    clearInterval(this.timer);
    this.drawStaticTimer();
  };

  Game.prototype.startTimer = function () {
    this.timing = true;
    this.startTime = new Date();
    this.timer = setInterval(this.drawElapsedTime.bind(this), 60/1000);
  };
})();
