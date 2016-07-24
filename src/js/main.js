var $ = require('jquery');
var init = require('./init');
var addEvents = require('./add_events');

$(document).ready(function () {
  setTimeout(function () {
    $('.backdrop').addClass('transition');
    $('.select').addClass('show');
  }, 200);

  $('.cube-size span').click(function (event) {
    $('.select').removeClass('show');
    $('.select').one('transitionend', function () {
      $('.select').remove();
      $('.backdrop').removeClass('transition');
      $('.backdrop').one('transitionend', function () {
        $('.backdrop').remove();
      });
    });

    var dimensions = parseInt($(event.currentTarget).attr('id'));
    init(dimensions);
    addEvents();
  });
});
