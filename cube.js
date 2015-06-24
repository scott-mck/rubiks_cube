(function () {
  if (typeof Cube === "undefined") {
    window.Cube = {};
  }

  Cube.Cube = {
    colors: {
      Y: 'rgb(255,255,0)',
      W: 'rgb(0,0,0)',
      B: 'rgb(255,0,0)',
      G: 'rgb(0,255,0)',
      R: 'rgb(255,255,0)',
      O: 'rgb(255,165,0)'
    },

    up: [['Y', 'Y', 'Y'],
         ['Y', 'Y', 'Y'],
         ['Y', 'Y', 'Y']],

    right: [['R', 'R', 'R'],
            ['R', 'R', 'R'],
            ['R', 'R', 'R']],

    front: [['B', 'B', 'B'],
            ['B', 'B', 'B'],
            ['B', 'B', 'B']],

    left: [['O', 'O', 'O'],
           ['O', 'O', 'O'],
           ['O', 'O', 'O']],

    back: [['G', 'G', 'G'],
           ['G', 'G', 'G'],
           ['G', 'G', 'G']],

    down: [['W', 'W', 'W'],
           ['W', 'W', 'W'],
           ['W', 'W', 'W']]
  };
})();
