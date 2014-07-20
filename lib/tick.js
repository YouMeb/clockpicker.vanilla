'use strict';

var inlineStyle = require('inline-style');
var autoprefix = require('inline-style-auto-prefix');

module.exports = Tick;

function Tick(val, point, oPoint) {
  this.point = point.clone();
  this.oPoint = oPoint;
  this.el = document.createElement('div');
  this.el.classList.add('clockpicker-tick');
  this.value = val;
  this.text = val;

  var style = this.style = inlineStyle(this.el);

  style.use(autoprefix());
}

Tick.prototype.update = function (length) {
  var oPoint = this.oPoint;
  var x, y;

  x = oPoint.x + length * this.point.x;
  y = oPoint.y + length * this.point.y;

  this.el.innerHTML = this.text;
  this.style.set('transform', 'translate(' + x + 'px, ' + y + 'px)');
  this.style.render();

  return this;
};

Tick.prototype.size = function () {
  var notNum = /[^-\d]/g;
  var style = window.getComputedStyle(this.el);
  var width = style.width || '';

  width = Number(width.replace(notNum, ''));

  return width;
};
