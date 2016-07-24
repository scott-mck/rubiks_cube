var c = {};

var set = function(dimensions) {
  c.cubeDimensions = dimensions;
  c.cubieSize = 125 - (20 - (dimensions - 2)) * (dimensions - 2);
  if (c.cubieSize < 40) c.cubieSize = 40;
  c.cubieOffset = 3;
  c.cubeStartPos = ((dimensions - 1)/2) * (c.cubieSize + c.cubieOffset);
  c.scrambleLength = 25 + 3 * (dimensions - 3);
};

var get = function(key) {
  return c.key;
};

module.exports = {
  set: set,
  get: get
};
