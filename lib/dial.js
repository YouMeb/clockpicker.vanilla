'use strict';

var Point = require('./point');
var Tick = require('./tick');
var animate = require('./animate');

module.exports = Dial;

function Dial(n) {
  this.n = n;
  this.el = document.createElement('div');
  this.el.classList.add('clockpicker-dial');
  this.animate = animate(this.el);
  this.ticks = {};
  this.draw();
}

Dial.prototype.show = function (cb) {
  this.animate.show(cb);
  return this;
};

Dial.prototype.hide = function (cb) {
  this.animate.hide(cb);
  return this;
};

Dial.prototype.tickSize = function () {
  var key = Object.keys(this.ticks)[0];
  var tick = this.ticks[key];
  return tick && tick.size();
};

Dial.prototype.updateTicksPosition = function (length) {
  var ticks = this.ticks;

  Object.keys(ticks).forEach(function (key) {
    var tick = ticks[key];
    tick.update(length);
  });

  return this;
};

Dial.prototype.draw = function () {
  var container = this.el;
  var docfrag = document.createDocumentFragment();
  var n = this.n;
  var angle = 30;
  var o = new Point(0, 0);
  var point = new Point(0, 1);
  var step = n / 12;

  var deg = -60;
  var ticks = this.ticks;
  var tick;
  var i, rad;

  for (i = 1; i <= 12; i += 1) {
    switch (deg) {
    case 180:
      point.x = -1;
      point.y = 0;
      break;
    case 270:
      point.x = 0;
      point.y = -1;
      break;
    case 90:
      point.x = 0;
      point.y = 1;
      break;
    default:
      rad = deg * Math.PI / 180;
      point.x = Math.cos(rad);
      point.y = Math.sin(rad);
    }

    tick = new Tick(i * step, point, o);

    docfrag.appendChild(tick.el);

    ticks[tick.value] = tick;

    deg += angle;
  }

  container.innerHTML = '';
  container.appendChild(docfrag);

  return this;
};

Dial.prototype.moveTo = function (tick, emit) {
  if (!(tick instanceof Tick)) {
    tick = this.ticks[tick];
  }
  this.currentTick = tick;
  return this;
};
