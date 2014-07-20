'use strict';

var Emitter = require('emitter');
var inlineStyle = require('inline-style');
var autoprefix = require('inline-style-auto-prefix');
var createSvgElement = require('./create-svg-element');
var Dial = require('./dial');
var Hand = require('./hand');
var Point = require('./point');

module.exports = Clock;

Emitter(Clock.prototype);

function Clock(options) {
  this.options = options;
  init.call(this);
}

Clock.prototype.getValue = function () {
  return [
    this.hourHand.value | 0,
    this.minuteHand.value | 0,
    this.secondHand.value | 0
  ].join(':');
};

Clock.prototype.setValue = function (time) {
  if (typeof time === 'string') {
    time = time.split(':');
  } else {
    time = [
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    ];
  }

  this.setHour(time[0]);
  this.setMinute(time[1]);
  this.setSecond(time[2]);

  return this;
};

Clock.prototype.setHour = function (n) {
  n = n % 12;
  updateHand.call(this, this.hourHand, this.hourDial, n);
  return this;
};

Clock.prototype.setMinute = function (n) {
  n = n % 60;
  updateHand.call(this, this.minuteHand, this.minuteDial, n);
  return this;
};

Clock.prototype.setSecond = function (n) {
  n = n % 60;
  updateHand.call(this, this.secondHand, this.secondDial, n);
  return this;
};

Clock.prototype.getHour = function (n) {
  return this.hourDial.value;
};

Clock.prototype.getMinute = function () {
  return this.minuteDial.value;
};

Clock.prototype.getSecond = function () {
  return this.secondDial.value;
};

Clock.prototype.switchDial = function (dial) {
  if (this.currentDial !== dial) {
    dial.show();
    this.currentDial && this.currentDial.hide();
    this.currentDial = dial;
  }
  return this;
};

Clock.prototype.resize = function (size) {
  this.options.size = size;

  var helfSize = size / 2;
  var oPoint = new Point(0, 0);
  var translate = 'translate(' + helfSize + ', ' + helfSize + ')';
  var tickSize = this.hourDial.tickSize();
  var handSize = helfSize - tickSize;

  this.canvas.setAttribute('width', size);
  this.canvas.setAttribute('height', size);

  this.hourHand.from(oPoint);
  this.minuteHand.from(oPoint);
  this.secondHand.from(oPoint);

  this.hourDial.updateTicksPosition(handSize);
  this.minuteDial.updateTicksPosition(handSize);
  this.secondDial.updateTicksPosition(handSize);

  this.handsContainer.setAttribute('transform', translate);

  this.style.set('width', size + 'px');
  this.style.set('height', size + 'px');
  this.style.render();
};

Clock.prototype.onMousedown = function (e) {
  var point = getPointFromMouseEvent.call(this, e);
  var nearest = this.nearestHand(point);
  var last = this._lastNearestHand;

  last && last.inactive();
  nearest.active();

  nearest.emit('change', point);

  this._lastNearestHand = nearest;

  this._mousedown = true;
};

Clock.prototype.onMouseup = function (e) {
  this._mousedown = false;
};

Clock.prototype.onMousemove = function (e) {
  if (!this._mousedown) {
    return;
  }

  var hand = this.activeHand();
  var point;
  
  if (!hand) {
    return;
  }

  point = getPointFromMouseEvent.call(this, e);
  hand.emit('change', point);
};

Clock.prototype.activeHand = function () {
  var hands = [
    this.hourHand,
    this.minuteHand,
    this.secondHand
  ];

  hands = hands.filter(function (hand) {
    return hand.isActive();
  });

  return hands[0];
};

Clock.prototype.nearestHand = function (point) {
  var hands = [
    this.hourHand,
    this.minuteHand,
    this.secondHand
  ];

  var getDist = function (hand) {
    var dist = point.distToSegmentSquared(hand.from(), hand.to());
    return {
      hand: hand,
      dist: dist
    };
  };

  var sortByDist = function (a, b) {
    return a.dist - b.dist;
  };

  hands = hands
    .map(getDist)
    .sort(sortByDist);

  return hands.sort()[0].hand;
};

function init() {
  this.el = document.createElement('div');
  this.el.classList.add('clockpicker-clock');

  this.canvas = createSvgElement('svg');
  this.el.appendChild(this.canvas);

  this.handsContainer = createSvgElement('g');
  this.canvas.appendChild(this.handsContainer);

  this.hourHand = new Hand({ scale: 0.5 });
  this.minuteHand = new Hand({ scale: 0.7 });
  this.secondHand = new Hand({ scale: 2 });

  this.hourHand.el.classList.add('hour');
  this.minuteHand.el.classList.add('minute');
  this.secondHand.el.classList.add('second');

  this.handsContainer.appendChild(this.hourHand.el);
  this.handsContainer.appendChild(this.minuteHand.el);
  this.handsContainer.appendChild(this.secondHand.el);

  this.hourDial = new Dial(12);
  this.minuteDial = new Dial(60);
  this.secondDial = new Dial(60);

  this.el.appendChild(this.hourDial.el);
  this.el.appendChild(this.minuteDial.el);
  this.el.appendChild(this.secondDial.el);

  this.center = createSvgElement('circle');
  this.center.classList.add('clockpicker-clock-center');
  this.center.setAttribute('cx', 0);
  this.center.setAttribute('cy', 0);
  this.center.setAttribute('r', 3);
  this.handsContainer.appendChild(this.center);

  this.style = inlineStyle(this.el);
  this.style.use(autoprefix);

  bind.call(this);
}

function bind() {
  this.el.addEventListener('mousedown', this.onMousedown.bind(this));
  this.el.addEventListener('mouseup', this.onMouseup.bind(this));
  this.el.addEventListener('mousemove', this.onMousemove.bind(this));
  bindHand.call(this, this.hourHand, this.hourDial);
  bindHand.call(this, this.minuteHand, this.minuteDial);
  bindHand.call(this, this.secondHand, this.secondDial);
}

function bindHand(hand, dial) {
  hand.on('active', this.switchDial.bind(this, dial));
  hand.on('inactive', this.switchDial.bind(this, this.hourDial));
  hand.on('change', pointToValueAndUpdateHand.bind(this, hand, dial));
}

function pointToValueAndUpdateHand(hand, dial, point) {
  var value = pointToValue(point, dial.n);
  var rad = value * dial.n;
  updateHand.call(this, hand, dial, value);
}

function pointToValue(point, n) {
  var rad = Math.atan2(point.x, - point.y);
  var deg = rad * 180 / Math.PI;
  var value;

  value = n / 360 * deg;

  return Math.round(value) % n;
}

function updateHand(hand, dial, n) {
  var point = new Point(0, 0);
  var helfSize = this.options.size / 2;
  var deg = 360 / dial.n * n - 90;
  var rad = deg * Math.PI / 180;

  point.x = helfSize * Math.cos(rad) * hand.scale;
  point.y = helfSize * Math.sin(rad) * hand.scale;

  hand.to(point);
  
  if (!n) {
    hand.value = dial.n;
  } else if (n < 0) {
    hand.value = dial.n + n;
  } else {
    hand.value = n;
  }
}

function getPointFromMouseEvent(e) {
  var bodyRect = document.body.getBoundingClientRect();
  var rect = this.el.getBoundingClientRect();

  var offset = {
    top: rect.top - bodyRect.top,
    left: rect.left - bodyRect.left
  };

  var helfSize = this.options.size / 2;

  var point = new Point(
    e.clientX - offset.left - helfSize,
    e.clientY - offset.top - helfSize
  );

  return point;
}
