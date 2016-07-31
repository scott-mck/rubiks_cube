var $ = require('jquery');
var THREE = require('three');

var g = require('./globals').getGlobals();
var eventHandler = require('./event_handler').eventHandler;

var container, resizeId, canvasSize;

var addEvents = function () {
  container = $('#canvas');
  resizeId = null;
  canvasSize = .9
  resizeWindow();

  function resizeWindow () {
    var width = container.width();
    var height = container.height();
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var scale;

    if (windowWidth > windowHeight) {
      scale = windowWidth / width;
      if (height * scale > windowHeight) scale = windowHeight / height;
    } else {
      scale = windowHeight / height;
      if (width * scale > windowWidth) scale = windowWidth / width;
    }

    var sidebarWidth = $('#sidebar').width();
    var space = windowWidth - sidebarWidth;
    $('#canvas').css('left', sidebarWidth + space * .15 + 'px');
    $('#canvas').css('width', width * scale * canvasSize + 'px');
    $('#canvas').css('height', height * scale * canvasSize + 'px');

    g.camera.aspect = (width * scale) / (height * scale);
    g.camera.updateProjectionMatrix();
    g.renderer.setSize(width * scale * canvasSize, height * scale * canvasSize);
    g.renderer.render(g.scene, g.camera);
  }

  $(window).resize(function () {
    clearTimeout(resizeWindow);
    setTimeout(resizeWindow, 100);
  });

  $('.scramble').on('click', function () {
    eventHandler.scramble();
  });

  $('.solve.enabled').on('click', function () {
    eventHandler.solve();
  });

  $('.display-solve-moves.enabled').on('click', function () {
    eventHandler.displaySolveMoves();
  });

  if (g.cubeDimensions === 3) {
    $('.sample').css('display', 'block');
    $('.sample').on('click', function () {
      eventHandler.solve();
      eventHandler.sampleSolve();
    });
  }

  setInterval(function () {
    var colors = ['red', 'yellow', 'blue', 'green', 'orange', 'purple'];
    var i = ~~(Math.random() * colors.length);
    while (colors[i] === $('.title').css('color')) {
      i = ~~(Math.random() * colors.length);
    }
    $('.title').css('color', colors[i]);
  }, 5000);
};

module.exports = addEvents;
