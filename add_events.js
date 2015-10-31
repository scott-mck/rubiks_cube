addEvents = function () {
  $('.scramble').on('click', function () {
    eventHandler.scramble();
  });

  $('.solve.enabled').on('click', function () {
    eventHandler.solve();
  });

  $('.display-solve-moves.enabled').on('click', function () {
    eventHandler.displaySolveMoves();
  });

  if (cubeDimensions === 3) {
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

  $(window).resize(function () {
    camera.aspect = $('#canvas').width() / $('#canvas').height();
    camera.updateProjectionMatrix();
    renderer.setSize($('#canvas').width(), $('#canvas').height());
    renderer.render(scene, camera);
  });
};
