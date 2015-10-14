init = function (cubeDimensions) {
  window.canvasWidth = $('#canvas').width();
  window.canvasHeight = $('#canvas').height();
  window.camera, window.scene, window.renderer;
  window.allCubes = [];
  window.rubiksCube, window.eventHandler;

  window.cubeDimensions = cubeDimensions;
  window.cubieSize = 125 - (20 - (cubeDimensions - 2)) * (cubeDimensions - 2);
  if (cubieSize < 40) cubieSize = 40;
  window.cubieOffset = 3;
  window.cubeStartPos = ((cubeDimensions - 1)/2) * (cubieSize + cubieOffset);
  window.cameraX = 250;
  window.cameraY = 300;
  window.cameraZ = -100;
  window.scrambleLength = 25 + 2 * (cubeDimensions - 3);

  // Setup scene
  container = document.getElementById('canvas');
  document.body.appendChild(container);
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(70, canvasWidth / canvasHeight, 1, 1000);
  camera.position.z = 600;

  scene = new THREE.Scene();

  // Make individual cube geometry
  for (var i = 0; i < cubeDimensions * cubeDimensions; i++) {
    var geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    // Color each individual cube:
    // Color right face RED
    geometry.faces[0].color.setRGB(1, 0, 0);
    geometry.faces[1].color.setRGB(1, 0, 0);
    // Color left face ORANGE
    geometry.faces[2].color.setRGB(1, .5, 0);
    geometry.faces[3].color.setRGB(1, .5, 0);
    // Color top face YELLOW
    geometry.faces[4].color.setRGB(1, 1, 0);
    geometry.faces[5].color.setRGB(1, 1, 0);
    // Color down face WHITE
    geometry.faces[6].color.setRGB(1, 1, 1);
    geometry.faces[7].color.setRGB(1, 1, 1);
    // Color front face BLUE
    geometry.faces[8].color.setRGB(0, 0, 1);
    geometry.faces[9].color.setRGB(0, 0, 1);
    // Color back face GREEN
    geometry.faces[10].color.setRGB(0, 1, 0);
    geometry.faces[11].color.setRGB(0, 1, 0);

    // Create 3 mini-cubes and position along z-axis
    for (var j = 0; j < cubeDimensions; j++) {
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.FaceColors
      });

      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (cubeStartPos) -(cubieSize + cubieOffset) * ~~(i / cubeDimensions),
        (cubeStartPos) -(cubieSize + cubieOffset) * (i % cubeDimensions),
        (cubeStartPos) -(cubieSize + cubieOffset) * j
      );
      mesh.name = "cubie"; // easy for id-ing when raycasting

      // Create mini-cube border
      var helper = new THREE.EdgesHelper( mesh, 0x000000 );
      helper.material.linewidth = 7;

      allCubes.push(mesh);
      scene.add(helper);
      scene.add(mesh);
    }
  }

  camera.position.x += cameraX;
  camera.position.y += cameraY;
  camera.position.z += cameraZ;
  camera.lookAt(new THREE.Vector3()); // look at middle of Rubik's Cube

  rubiksCube = new Game.Cube(scene, camera, renderer);
  eventHandler = new Game.EventHandler(scene, camera, rubiksCube, renderer);

  function animate () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function addEvents () {
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

  addEvents();
  animate();
}
