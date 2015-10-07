(function () {
  addEvents = function () {
    $('.scramble').on('click', function () {
      if ($('.scramble').hasClass('solve')) {
        $('.scramble').removeClass('solve');
        eventHandler.solve();
      } else {
        $('.scramble').addClass('solve');
        eventHandler.scramble();
      }
    });

    $('.sample').on('click', function () {
      eventHandler.solve();
      eventHandler.sampleSolve();
    });

    $('.button').hover(
      function (event) {
        $(event.currentTarget).css('background', 'green');
      },
      function (event) {
        $(event.currentTarget).css('background', 'yellow');
      }
    );

    $('.button').on('mousedown', function (event) {
      $(event.currentTarget).css('background', 'red');
    });

    $('.button').on('mouseup', function (event) {
      $(event.currentTarget).css('background', 'yellow');
    });

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
  	});
  }
})();
