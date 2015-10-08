(function () {
  init = function () {
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
    for (var j = 0; j < 9; j++) {
      var geometry = new THREE.BoxGeometry( 100, 100, 100 );

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
      for (var k = 0; k < 3; k++) {
        var material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.FaceColors
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          103 -103 * ~~(j / 3),
          103 -103 * (j % 3),
          103 - 103 * k
        );
        mesh.name = "cubie"; // easy for id-ing when raycasting

        // Create mini-cube border
        var helper = new THREE.EdgesHelper( mesh, 0x000000 );
        helper.material.linewidth = 7;

        cubes.push(mesh);
        scene.add(helper);
        scene.add(mesh);
      }
    }

    camera.position.x += 250;
    camera.position.y += 300;
    camera.position.z -= 100;
    camera.lookAt(cubes[13].position); // look at middle of Rubik's Cube

    rubiksCube = new Game.Cube(scene, camera, cubes);
    eventHandler = new Game.EventHandler(rubiksCube, 'game');
  }
})();
