(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('gsap'), require('three')) :
  typeof define === 'function' && define.amd ? define(['jquery', 'gsap', 'three'], factory) :
  (factory(global.$,global.TweenMax,global.THREE));
}(this, (function ($,TweenMax,THREE) { 'use strict';

$ = 'default' in $ ? $['default'] : $;
TweenMax = 'default' in TweenMax ? TweenMax['default'] : TweenMax;
THREE = 'default' in THREE ? THREE['default'] : THREE;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

var camera$1 = new THREE.PerspectiveCamera();

var g = {};
g.allCubes = [];

var init$1 = function init$1(cubeDimensions) {
  g.dimensions = cubeDimensions;
  g.cubieOffset = 0.5;
  g.cubieSize = 20;
  g.cubieDistance = g.cubieSize + g.cubieOffset;
  g.startPos = (g.dimensions - 1) / 2 * (g.cubieSize + g.cubieOffset);
  g.scrambleLength = 25 + 3 * (g.dimensions - 3);
  g.lineHelperWidth = 5 - (g.dimensions - 2) * 0.3;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var Grabber = function () {
  function Grabber() {
    classCallCheck(this, Grabber);
  }

  createClass(Grabber, [{
    key: 'setAnchor1',
    value: function setAnchor1(cube) {
      this.anchor1 = cube.position.clone();
    }
  }, {
    key: 'setAnchor2',
    value: function setAnchor2(cube) {
      this.anchor2 = cube.position.clone();
    }
  }, {
    key: 'init',
    value: function init() {
      this._faceMap = {
        r: { anchor: this.anchor1, shoot: ['z', 'y'], dir: -1 },
        u: { anchor: this.anchor1, shoot: ['z', 'x'], dir: -1 },
        f: { anchor: this.anchor1, shoot: ['x', 'y'], dir: -1 },
        l: { anchor: this.anchor2, shoot: ['z', 'y'], dir: 1 },
        d: { anchor: this.anchor2, shoot: ['z', 'x'], dir: 1 },
        b: { anchor: this.anchor2, shoot: ['x', 'y'], dir: 1 }
      };
    }
  }, {
    key: 'grabFace',
    value: function grabFace(str) {
      if (str[0] === 'x' || str[0] === 'y') {
        return scene.children.filter(function (object) {
          return object.name === 'cubie';
        });
      }

      this._face = this._faceMap[str];

      var shootAxis = this._face.shoot[0].toUpperCase();
      var shootDir = new THREE.Vector3()['set' + shootAxis](1 * this._face.dir);

      var fillAxis = this._face.shoot[1].toUpperCase();
      var fillDir = new THREE.Vector3()['set' + fillAxis](1);

      var raycaster = new THREE.Raycaster(this._face.anchor, shootDir);
      var intersects = this.raycast(raycaster);

      this.filterIntersects(intersects);

      this.fillOutFace(intersects, fillDir);

      return intersects;
    }
  }, {
    key: 'getClickData',
    value: function getClickData(x, y) {
      var mouse = new THREE.Vector2();
      var raycaster = new THREE.Raycaster();

      mouse.x = x / renderer.domElement.clientWidth * 2 - 1;
      mouse.y = -(y / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length === 0) {
        return null;
      }

      var object = intersects[0].object;
      var normal = intersects[0].face.normal;

      var normalVector = new THREE.Matrix4();
      normalVector = normalVector.extractRotation(object.matrixWorld);
      normalVector = normalVector.multiplyVector3(normal.clone());

      return { object: object, normal: this.axisFromVector(normalVector) };
    }
  }, {
    key: 'shoot',
    value: function shoot(cube, normal) {
      var point = cube.position.clone();
      var direction = normal.negate().clone();
      var raycaster = new THREE.Raycaster(point, direction);

      return this.filterIntersects(this.raycast(raycaster));
    }
  }, {
    key: 'fillOutFace',
    value: function fillOutFace(intersects, dir) {
      var cubes = intersects;
      var captures = [];

      var firstPoint = intersects[0].position.clone();
      var lastPoint = intersects[intersects.length - 1].position.clone();
      var point = firstPoint.clone();

      var shootDir = this.axisFromVector(firstPoint.sub(lastPoint));

      point = point['set' + shootDir.toUpperCase()](g.startPos);
      var inc = new THREE.Vector3()['set' + shootDir.toUpperCase()](g.cubieDistance);

      var i = void 0,
          raycaster = void 0;
      for (i = 0; i < g.dimensions; i++) {
        raycaster = new THREE.Raycaster(point, dir);
        captures = this.raycast(raycaster);
        cubes = cubes.concat(captures);

        raycaster = new THREE.Raycaster(point, dir.negate());
        captures = this.raycast(raycaster);
        cubes = cubes.concat(captures);

        point = point.sub(inc);
      }

      this.filterIntersects(cubes);

      intersects.splice(0);
      for (i = 0; i < cubes.length; i++) {
        intersects.push(cubes[i]);
      }
    }
  }, {
    key: 'filterIntersects',
    value: function filterIntersects(intersects) {
      var cubes = [];
      var i = void 0;
      var object = void 0;

      for (i = 0; i < intersects.length; i++) {
        object = intersects[i];
        if (object.name === 'cubie' && cubes.indexOf(object) === -1) {
          cubes.push(object);
        }
      }

      intersects.splice(0);
      for (i = 0; i < cubes.length; i++) {
        intersects.push(cubes[i]);
      }

      return intersects;
    }
  }, {
    key: 'raycast',
    value: function raycast(raycaster) {
      return raycaster.intersectObjects(scene.children).map(function (data) {
        return data.object;
      });
    }
  }, {
    key: 'axisFromVector',
    value: function axisFromVector(vector) {
      if (Math.abs(Math.round(vector.x)) >= 1) return 'x';
      if (Math.abs(Math.round(vector.y)) >= 1) return 'y';
      if (Math.abs(Math.round(vector.z)) >= 1) return 'z';
    }
  }, {
    key: 'vectorFromAxis',
    value: function vectorFromAxis(str) {
      var mag = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      str = str.toUpperCase();
      return new THREE.Vector3()['set' + str](mag);
    }
  }]);
  return Grabber;
}();

var grabber$1 = new Grabber();

var renderer$1 = new THREE.WebGLRenderer();

var RubiksCube = function () {
  function RubiksCube() {
    classCallCheck(this, RubiksCube);

    this._rotateMap = {
      r: { axis: 'x', dir: -1 },
      l: { axis: 'x', dir: -1 },
      u: { axis: 'y', dir: -1 },
      d: { axis: 'y', dir: 1 },
      f: { axis: 'z', dir: -1 },
      b: { axis: 'z', dir: 1 }
    };

    this._rotateMap.x = this._rotateMap.r;
    this._rotateMap.y = this._rotateMap.u;

    this._queue = [];
  }

  createClass(RubiksCube, [{
    key: 'move',
    value: function move(_move) {
      this._queue.push(_move);
      animator.go();
    }
  }, {
    key: 'nextMove',
    value: function nextMove() {
      var move = this._queue.shift();
      if (typeof move === 'string') {
        return this._getMoveDetails(move);
      } else if (typeof move === 'function') {
        return move();
      }
    }
  }, {
    key: 'scramble',
    value: function scramble() {
      var i = void 0;
      for (i = 0; i < 25; i++) {
        this._queue.push(this.randomMove());
      }
      animator.go();
    }
  }, {
    key: 'randomMove',
    value: function randomMove() {
      var axes = ['x', 'y', 'z'];
      var normal = axes.splice(~~(Math.random() * axes.length), 1)[0];
      var rayDirection = grabber$1.vectorFromAxis(normal, -1);

      var coord1 = g.startPos - g.cubieDistance * ~~(Math.random() * g.dimensions);
      var coord2 = g.startPos - g.cubieDistance * ~~(Math.random() * g.dimensions);

      var startPos = new THREE.Vector3();
      startPos['set' + axes[0].toUpperCase()](coord1);
      startPos['set' + axes[1].toUpperCase()](coord2);
      startPos['set' + normal.toUpperCase()](g.startPos);

      var raycaster = new THREE.Raycaster(startPos, rayDirection);
      var randomFillDir = axes.splice(~~(Math.random() * axes.length), 1)[0];

      return function () {
        var objects = grabber$1.raycast(raycaster);
        grabber$1.filterIntersects(objects);

        grabber$1.fillOutFace(objects, grabber$1.vectorFromAxis(randomFillDir));

        var dir = Math.random() < 0.5 ? 1 : -1;

        return { objects: objects, axis: axes[0], dir: dir };
      };
    }
  }, {
    key: '_getMoveDetails',
    value: function _getMoveDetails(move) {
      var face = move[0];
      var faceDetails = this._rotateMap[face];

      var objects = grabber$1.grabFace(face);
      var axis = faceDetails.axis;
      var dir = faceDetails.dir;

      if (move.indexOf('Prime') > -1) {
        dir *= -1;
      }

      return { objects: objects, axis: axis, dir: dir };
    }
  }]);
  return RubiksCube;
}();

var rubiksCube = new RubiksCube();

var DURATION = 0.1;
var EASE = 'linear';
var WAIT_COUNT = 1;
var SNAP_DURATION = 0.3;

var Animator = function () {
  function Animator() {
    classCallCheck(this, Animator);

    this._rotater = new THREE.Object3D();
    this._rotater.name = 'rotater';
    scene.add(this._rotater);
  }

  createClass(Animator, [{
    key: 'init',
    value: function init() {
      TweenMax.ticker.addEventListener('tick', this.render.bind(this));
    }

    // jump-starts animation sequence: looking for rubiksCube#nextMove and
    // repeating on completion

  }, {
    key: 'go',
    value: function go() {
      if (!this.animating) {
        this._next();
      }
    }
  }, {
    key: 'animate',
    value: function animate(_ref) {
      var objects = _ref.objects;
      var axis = _ref.axis;
      var dir = _ref.dir;

      if (this.animating) {
        return;
      }

      this._animate({ objects: objects, axis: axis, dir: dir });
    }
  }, {
    key: '_animate',
    value: function _animate(_ref2) {
      var _this = this,
          _TweenMax$to;

      var objects = _ref2.objects;
      var axis = _ref2.axis;
      var dir = _ref2.dir;

      this.animating = true;

      var i = void 0;
      for (i = 0; i < objects.length; i++) {
        THREE.SceneUtils.attach(objects[i], scene, this._rotater);
      }

      var onComplete = function onComplete() {
        _this._rotater.rotation[axis] = Math.PI / 2 * dir;
        _this._wait(_this._complete.bind(_this));
      };

      TweenMax.to(this._rotater.rotation, DURATION, (_TweenMax$to = {}, defineProperty(_TweenMax$to, axis, '+=' + Math.PI / 2 * dir), defineProperty(_TweenMax$to, 'ease', EASE), defineProperty(_TweenMax$to, 'onComplete', onComplete), _TweenMax$to));
    }
  }, {
    key: 'setRotation',
    value: function setRotation(axis, mag) {
      TweenMax.to(this._rotater.rotation, 0, defineProperty({}, axis, '+=' + mag));
    }
  }, {
    key: '_next',
    value: function _next() {
      var nextMove = rubiksCube.nextMove();
      if (!nextMove) {
        return;
      }

      this._animate(nextMove);
    }
  }, {
    key: 'render',
    value: function render() {
      renderer$1.render(scene, camera$1);
    }
  }, {
    key: '_complete',
    value: function _complete() {
      var _this2 = this;

      this.reset();

      this._wait(function () {
        _this2.animating = false;
        _this2._next();
      });
    }
  }, {
    key: '_wait',
    value: function _wait(callback) {
      var count = arguments.length <= 1 || arguments[1] === undefined ? WAIT_COUNT : arguments[1];

      var loop = function loop() {
        if (count === 0) {
          callback();
          return;
        }

        count -= 1;
        requestAnimationFrame(loop);
      };

      loop();
    }
  }, {
    key: 'grip',
    value: function grip(cubes, axis) {
      var i = void 0;
      for (i = 0; i < cubes.length; i++) {
        THREE.SceneUtils.attach(cubes[i], scene, this._rotater);
      }
      this._rotatingAxis = axis;
    }
  }, {
    key: 'snap',
    value: function snap() {
      var _this3 = this,
          _TweenMax$to3;

      var currentRotation = this._rotater.rotation[this._rotatingAxis];
      var negativeRotation = currentRotation < 0;
      var angle = negativeRotation ? -Math.PI / 2 : Math.PI / 2;

      var remainder = currentRotation % angle;

      if (Math.abs(remainder) > Math.PI / 4) {
        remainder = angle - remainder;
      } else {
        remainder *= -1;
      }

      TweenMax.to(this._rotater.rotation, SNAP_DURATION, (_TweenMax$to3 = {}, defineProperty(_TweenMax$to3, this._rotatingAxis, '+=' + remainder), defineProperty(_TweenMax$to3, 'onComplete', function onComplete() {
        _this3.reset();
      }), _TweenMax$to3));
    }
  }, {
    key: 'reset',
    value: function reset() {
      while (this._rotater.children[0]) {
        THREE.SceneUtils.detach(this._rotater.children[0], this._rotater, scene);
      }

      this._rotater.rotation.set(0, 0, 0);
      this._rotatingAxis = null;
    }
  }]);
  return Animator;
}();

var animator = new Animator();

var KeyMap = function () {
  function KeyMap() {
    classCallCheck(this, KeyMap);

    this.keyMap = {
      i: 'r',
      k: 'rPrime',
      j: 'u',
      f: 'uPrime',
      h: 'f',
      g: 'fPrime',
      s: 'd',
      l: 'dPrime',
      e: 'l',
      d: 'lPrime',
      q: 'b',
      p: 'bPrime',
      ';': 'y',
      a: 'yPrime',
      y: 'x',
      n: 'xPrime'
    };
  }

  createClass(KeyMap, [{
    key: 'getNotation',
    value: function getNotation(letter) {
      return this.keyMap[letter];
    }
  }]);
  return KeyMap;
}();

var keyMap = new KeyMap();

var DRAG_COEFFICIENT = 1 / 200;

var inputHandler = function () {
  function inputHandler() {
    classCallCheck(this, inputHandler);

    // Captures correct cubes when clicking on a given face (or normal)
    this._normalMap = {
      x: { horizontal: 'z', vertical: 'y' },
      y: { horizontal: 'x', vertical: 'z' },
      z: { horizontal: 'x', vertical: 'y' }
    };

    this._rotationMap = {
      x: 1,
      y: 1,
      z: -1
    };
  }

  createClass(inputHandler, [{
    key: 'init',
    value: function init() {
      this.$canvas = $('#canvas');
      this.addEvents();
    }
  }, {
    key: 'addEvents',
    value: function addEvents() {
      $('#scramble').click(function () {
        rubiksCube.scramble();
      });
      $(window).on('keyup', this.type.bind(this));
      this.$canvas.on('mousedown', this.mousedown.bind(this));
    }

    /* Steps */
    // ---- On MouseDown:
    // 1) Get clicked cube and normal and save to this._clickData
    // 2) Shoot through normal and save cubes to this._cubes
    // 3) On mousemove, determine whether user moves vertically or horizontally,
    //    save to this._clickData
    // 4) "Fill out face"
    // 5) Animate this._cubes based on mouse movement
    // ---- On Mouseup:
    // 1) Snap face to nearest position
    // 2) Reset()

  }, {
    key: 'mousedown',
    value: function mousedown(e) {
      var _this = this;

      var canvasBox = renderer$1.domElement.getBoundingClientRect();
      var canvasMouseX = event.clientX - canvasBox.left;
      var canvasMouseY = event.clientY - canvasBox.top;

      this._currentX = e.clientX;
      this._currentY = e.clientY;

      this._clickData = grabber.getClickData(canvasMouseX, canvasMouseY);

      if (!this._clickData) {
        this._detectClickDirection(function () {
          _this._rotationAxis = _this._lockAxis === 'horizontal' ? 'y' : 'x';
          animator.grip(g.allCubes, _this._rotationAxis);
          _this.$canvas.on('mousemove.input', _this._mousemove.bind(_this));
          _this.$canvas.one('mouseup', _this._mouseup.bind(_this));
        });
        return;
      }

      var normal = grabber.vectorFromAxis(this._clickData.normal);
      this._cubes = grabber.shoot(this._clickData.object, normal);

      this._detectClickDirection(function () {
        var clickDir = _this._normalMap[_this._clickData.normal][_this._lockAxis].toUpperCase();
        _this._clickData.direction = clickDir;

        var normal = grabber.vectorFromAxis(_this._clickData.normal);
        var direction = grabber.vectorFromAxis(_this._clickData.direction);
        _this._rotationAxis = grabber.axisFromVector(normal.cross(direction));

        grabber.fillOutFace(_this._cubes, direction);
        animator.grip(_this._cubes, _this._rotationAxis);
      });

      this.$canvas.on('mousemove.input', this._mousemove.bind(this));
      this.$canvas.one('mouseup', this._mouseup.bind(this));
    }
  }, {
    key: '_detectClickDirection',
    value: function _detectClickDirection(callback) {
      var _this2 = this;

      this.$canvas.one('mousemove', function (e) {
        var magX = e.clientX - _this2._currentX;
        var magY = e.clientY - _this2._currentY;

        _this2._lockAxis = Math.abs(magX) >= Math.abs(magY) ? 'horizontal' : 'vertical';
        callback && callback();
      });
    }
  }, {
    key: '_mousemove',
    value: function _mousemove(e) {
      var magX = e.clientX - this._currentX;
      var magY = e.clientY - this._currentY;

      var mag = this._lockAxis === 'horizontal' ? magX : magY;
      mag *= Math.PI / 2 * DRAG_COEFFICIENT;

      mag *= this._rotationMap[this._rotationAxis];

      animator.setRotation(this._rotationAxis, mag);

      this._currentX = e.clientX;
      this._currentY = e.clientY;
    }
  }, {
    key: '_mouseup',
    value: function _mouseup(e) {
      animator.snap();
      this.$canvas.off('mousemove.input');

      this._clickData = null;
      this._currentX = null;
      this._currentY = null;
      this._cubes = null;
      this._lockAxis = null;
      this._rotationAxis = null;
    }
  }, {
    key: 'type',
    value: function type(e) {
      var letter = String.fromCharCode(e.keyCode).toLowerCase();

      // this is pretty annoying.
      if (e.keyCode === 186) letter = ';';

      var move = keyMap.getNotation(letter);
      if (!move) {
        return;
      }

      rubiksCube.move(move);
    }
  }]);
  return inputHandler;
}();

var inputHandler$1 = new inputHandler();

window.$ = $;
window.TweenMax = TweenMax;
window.THREE = THREE;
window.scene = scene;
window.camera = camera$1;
window.grabber = grabber$1;
window.renderer = renderer$1;
window.animator = animator;
window.inputHandler = inputHandler$1;

// no breakage

var init$2 = (function () {
  createMesh();
  createLeftAndRight();
  createUpAndDown();
  createFrontAndBack();

  camera.position.x += 40 + (g.dimensions - 2) * 25;
  camera.position.y += 40 + (g.dimensions - 2) * 25;
  camera.position.z += 60 + (g.dimensions - 2) * 35;
  camera.lookAt(new THREE.Vector3());

  inputHandler$1.init();
  grabber$1.init();
  animator.init();
});

var material = void 0;
var geometry = void 0;

var createMesh = function createMesh() {
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
    side: THREE.DoubleSide
  });

  geometry = new THREE.BoxGeometry(g.cubieSize, g.cubieSize, g.cubieSize);
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
};

var addCubie = function addCubie() {
  var cubie = new THREE.Mesh(geometry.clone(), material.clone());
  var helper = new THREE.EdgesHelper(cubie, 0x000000);
  helper.material.linewidth = g.lineHelperWidth;
  cubie.name = "cubie";
  g.allCubes.push(cubie);
  scene.add(cubie);
  scene.add(helper);
  return cubie;
};

var createLeftAndRight = function createLeftAndRight() {
  var x = void 0;
  var y = void 0;
  var z = void 0;
  var cubie = void 0;

  for (x = 0; x < 2; x++) {
    for (y = 0; y < g.dimensions; y++) {
      for (z = 0; z < g.dimensions; z++) {
        cubie = addCubie();
        cubie.position.set(g.startPos - 2 * x * g.startPos, g.startPos - y * (g.cubieSize + g.cubieOffset), g.startPos - z * (g.cubieSize + g.cubieOffset));

        var d = g.dimensions - 1;
        if (x === 0 && y === 0 && z === 0) grabber$1.setAnchor1(cubie);
        if (x === 1 && y === d && z === d) grabber$1.setAnchor2(cubie);
      }
    }
  }
};
var createUpAndDown = function createUpAndDown() {
  var x = void 0;
  var y = void 0;
  var z = void 0;
  var cubie = void 0;

  for (y = 0; y < 2; y++) {
    for (x = 0; x < g.dimensions - 2; x++) {
      for (z = 0; z < g.dimensions; z++) {
        cubie = addCubie();
        cubie.position.set(g.startPos - (x + 1) * (g.cubieSize + g.cubieOffset), g.startPos - 2 * y * g.startPos, g.startPos - z * (g.cubieSize + g.cubieOffset));
      }
    }
  }
};
var createFrontAndBack = function createFrontAndBack() {
  var x = void 0;
  var y = void 0;
  var z = void 0;
  var cubie = void 0;

  for (z = 0; z < 2; z++) {
    for (y = 0; y < g.dimensions - 2; y++) {
      for (x = 0; x < g.dimensions - 2; x++) {
        cubie = addCubie();
        cubie.position.set(g.startPos - (x + 1) * (g.cubieSize + g.cubieOffset), g.startPos - (y + 1) * (g.cubieSize + g.cubieOffset), g.startPos - 2 * z * g.startPos);
      }
    }
  }
};

var SELECT_DURATION = 0.7;

var $window = void 0;
var $backdrop = void 0;
var $select = void 0;
var $choices = void 0;
var $canvas = void 0;
var $expand = void 0;
var $sidebar = void 0;

var canvasWidth = void 0;
var canvasHeight = void 0;
var windowWidth = void 0;
var windowHeight = void 0;
var dimensions = void 0;

var timeline = new TimelineMax({ paused: true });

var EventHandler = {
  init: function init$2() {
    $window = $(window);
    $backdrop = $('.backdrop');
    $select = $('.select');
    $choices = $('.cube-size');
    $canvas = $('#canvas');
    $expand = $('#expand');
    $sidebar = $('#sidebar');

    renderer$1.setPixelRatio(devicePixelRatio);
    $canvas.append(renderer$1.domElement);

    // $window.resize(resizeWindow)
    $window.click(function (e) {
      return e.preventDefault();
    });

    $choices.click(function (e) {
      dimensions = parseInt($(e.currentTarget).find('.choice').attr('id'));
      timeline.reverse();
    });

    createTimeline();
    resizeWindow();
    timeline.play();
    renderer$1.render(scene, camera$1);
  }
};

var resizeWindow = function resizeWindow() {
  canvasWidth = $canvas.width();
  canvasHeight = $canvas.height();
  windowWidth = $window.width();
  windowHeight = $window.height();

  // if (windowWidth > windowHeight) {
  //   scale = windowWidth / canvasWidth
  //   if (canvasHeight * scale > windowHeight) scale = windowHeight / canvasHeight
  // } else {
  //   scale = windowHeight / canvasHeight
  //   if (canvasWidth * scale > windowWidth) scale = windowWidth / canvasWidth
  // }

  // $canvas.css('width', canvasWidth + 'px')
  // $canvas.css('height', canvasHeight + 'px')

  camera$1.aspect = canvasWidth / canvasHeight;
  camera$1.updateProjectionMatrix();
  renderer$1.setSize(canvasWidth, canvasHeight);
};

var createTimeline = function createTimeline() {
  timeline.to($select, SELECT_DURATION, {
    opacity: 1,
    y: 50,
    ease: Power3.easeOut
  });

  timeline.eventCallback('onReverseComplete', function () {
    $select.hide();
    $backdrop.hide();
    init$1(dimensions);
    init$2();
  });
};

// REMEMBER TO KILL ME WHEN YOU NEED TO
$(document).ready(function () {
  EventHandler.init();
});

})));
