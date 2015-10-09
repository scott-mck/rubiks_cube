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
          (rightSideStartPos) -(cubieSize + cubieOffset) * ~~(i / cubeDimensions),
          (rightSideStartPos) -(cubieSize + cubieOffset) * (i % cubeDimensions),
          (rightSideStartPos) -(cubieSize + cubieOffset) * j
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

    camera.position.x += cameraX;
    camera.position.y += cameraY;
    camera.position.z += cameraZ;
    camera.lookAt(cubes[middle].position); // look at middle of Rubik's Cube

    rubiksCube = new Game.Cube(scene, camera, cubes);
    eventHandler = new Game.EventHandler(rubiksCube, 'game');
  }
})();
