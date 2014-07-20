'use strict';

module.exports = Point;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};

// http://stackoverflow.com/a/2233538/2548809
Point.prototype.distToSegmentSquared = function (p1, p2) {
  var px = p2.x - p1.x;
  var py = p2.y - p1.y;

  var tmp = px * px + py * py;

  var u =  ((this.x - p1.x) * px + (this.y - p1.y) * py) / Number(tmp);

  if (u > 1) {
    u = 1;
  } else if (u < 0) {
    u = 0;
  }

  var x = p1.x + u * px;
  var y = p1.y + u * py;

  var dx = x - this.x;
  var dy = y - this.y;

  var dist = Math.sqrt(dx * dx + dy * dy);

  return dist;
};
