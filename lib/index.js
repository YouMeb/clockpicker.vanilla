'use strict';

var Emitter = require('emitter');
var defaultOptions = require('./default-options');
var Clock = require('./clock');
var Pop = require('./pop');

module.exports = Clockpicker;

Emitter(Clockpicker.prototype);

function Clockpicker(options) {
  this.options = defaultOptions(options || {});
  init.call(this);
  bind.call(this);
}

Clockpicker.prototype.done = function (cb) {
  updateInput.call(this);
  this.hide(cb);
};

Clockpicker.prototype.show = function (cb) {
  clearTimeout(this._timer);

  var bodyRect = document.body.getBoundingClientRect();
  var rect = this.el.getBoundingClientRect();
  var popRect;

  this.pop.el.style.display = 'block';
  popRect = this.pop.el.getBoundingClientRect();
  this.pop.el.style.display = '';

  var width = popRect.right - popRect.left;
  var height = popRect.bottom - popRect.top;
  var helfWidth = width / 2;

  var scrollY = (window.pageYOffset !== undefined)
    ? window.pageYOffset
    : (document.documentElement
        || document.body.parentNode
        || document.body)
    .scrollTop;

  var scrollX = (window.pageXOffset !== undefined)
    ? window.pageXOffset
    : (document.documentElement
        || document.body.parentNode
        || document.body)
    .scrollLeft;

  var pos = {
    top: rect.top + scrollY,
    left: rect.left + scrollX
  };

  pos.top += rect.bottom - rect.top + 24;
  pos.left -= helfWidth - (rect.right - rect.left) / 2;

  if (pos.top > scrollY + window.screen.height / 2) {
    pos.top -= 72 + height;
  }

  if (pos.left < 0) {
    pos.left = 0;
  } else if (pos.left + width > bodyRect.right) {
    pos.left -= size;
  }

  this.pop.el.style.top = pos.top + 'px';
  this.pop.el.style.left = pos.left + 'px';

  this._timer = setTimeout(function () {
    this.pop.show(cb);
  }.bind(this), 32);

  return this;
};

Clockpicker.prototype.hide = function (cb) {
  this.pop.hide(cb);
  return this;
};

Clockpicker.prototype.init = function () {
  this.clock.setValue(this.options.default || new Date());
  this.clock.resize(this.options.clockSize);
  updateInput.call(this);
};

function init() {
  var options = this.options;

  if (!options.el) {
    options.el = document.createElement('input');
    options.el.type = 'text';
  }

  this.el = options.el;

  this.clock = new Clock({
    hour: options.hour,
    minute: options.minute,
    second: options.second,
    size: options.clockSize
  });

  this.pop = new Pop();
  this.pop.setText(this.options.donetext);
  this.pop.el.appendChild(this.clock.el);

  this.clock.switchDial(this.clock.hourDial);

  document.body.appendChild(this.pop.el);
}

function bind() {
  document.body.addEventListener('click', this.hide.bind(this));
  this.el.addEventListener('focus', this.show.bind(this));
  this.el.addEventListener('click', stop);
  this.el.addEventListener('change', updateClock.bind(this));
  this.pop.on('done', this.done.bind(this));
}

function stop(e) {
  e.stopPropagation();
}

function updateInput() {
  var value = this.clock.getValue();
  this.el.value = value;
  this.emit('change', value);
}

function updateClock() {
  var value = this.el.value;
  this.clock.setValue(value);
}
