'use strict';

var Emitter = require('emitter');
var animate = require('./animate');

module.exports = Pop;

Emitter(Pop.prototype);

function Pop() {
  this.el = document.createElement('div');
  this.done = document.createElement('button');
  this.el.classList.add('clockpicker-pop');
  this.el.appendChild(this.done);
  this.animate = animate(this.el);
  bind.call(this);
}

Pop.prototype.show = function (cb) {
  this.animate.show(cb);
  return this;
};

Pop.prototype.hide = function (cb) {
  this.animate.hide(cb);
  return this;
};

Pop.prototype.setText = function (text) {
  this.done.innerHTML = text;
  return this;
};

function bind() {
  this.el.addEventListener('click', stop);
  this.done.addEventListener('click', this.emit.bind(this, 'done'));
}

function stop(e) {
  e.stopPropagation();
}
