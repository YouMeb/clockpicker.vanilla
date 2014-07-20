'use strict';

var duration = require('transition-duration');

module.exports = function (el) {
  return new Animate(el);
};

function Animate(el) {
  this.el = el;
  this.timer = null;
}

Animate.prototype.show = function (cb) {
  this.clear();

  if (typeof cb !== 'function') {
    cb = function () {};
  }

  this.el.classList.add('display');
  this.el.classList.add('prepare');

  this.timer = setTimeout(function () {
    var d = duration(this.el);

    this.el.classList.add('transition');

    this.timer = setTimeout(cb, d);
  }.bind(this), 32);

  return this;
};

Animate.prototype.hide = function (cb) {
  this.clear();

  if (typeof cb !== 'function') {
    cb = function () {};
  }

  this.el.classList.remove('prepare');
  this.el.classList.add('hide-prepare');

  var d = duration(this.el);

  this.el.classList.remove('transition');

  this.timer = setTimeout(function () {
    this.el.classList.remove('hide-prepare');
    this.el.classList.remove('display');
    cb();
  }.bind(this), d);

  return this;
};

Animate.prototype.clear = function (cb) {
  this.el.classList.remove(
    'hide-prepare',
    'prepare',
    'transition'
  );
  clearTimeout(this.timer);
  return this;
};
