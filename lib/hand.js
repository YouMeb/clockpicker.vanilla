'use strict';

var Emitter = require('emitter');
var createSvgElement = require('./create-svg-element');

module.exports = Hand;

Emitter(Hand.prototype);

function Hand(options) {
  options || (options = {});
  this.scale = options.scale;
  this.el = createSvgElement('line');
  this.el.classList.add('clockpicker-hand');
  this._active = false;
  this._from;
  this._top;
}

Hand.prototype.from = function (point) {
  if (point) {
    setPoint.call(this, 1, point);
    this._from = point;
    return this;
  }
  return this._from;
};

Hand.prototype.to = function (point) {
  if (point) {
    setPoint.call(this, 2, point);
    this._to = point;
    return this;
  }
  return this._to;
};

Hand.prototype.isActive = function () {
  return this._active;
};

Hand.prototype.active = function () {
  this._active = true;
  this.el.classList.add('active');
  this.emit('active', this);
  return this;
};

Hand.prototype.inactive = function () {
  this._active = false;
  this.el.classList.remove('active');
  this.emit('inactive', this);
  return this;
};

function setPoint(n, point) {
  this.el.setAttribute('x' + n, point.x);
  this.el.setAttribute('y' + n, point.y);
}
