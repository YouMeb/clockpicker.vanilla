
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("component~emitter@1.1.3", function (exports, module) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});

require.register("poying~inline-style@0.0.4", function (exports, module) {
'use strict';

module.exports = createInlineStyle;

createInlineStyle.InlineStyle = InlineStyle;

function createInlineStyle(el) {
  return new InlineStyle(el);
};

function InlineStyle(el) {
  this.el = el;
  this.style = this.parse(el);
  this.middleware = [];
};

var proto = InlineStyle.prototype;

proto.use = function (mw) {
  this.middleware.push(mw);
  return this;
};

proto.get = function (prop) {
  return this.style[prop];
};

proto.set = function (prop, value) {
  this.style[prop] = value;
  return this;
};

proto.render = function () {
  var style = this.toString();
  this.el.setAttribute('style', style);
  return this;
};

proto.parse = function (el) {
  var str = el.getAttribute('style') || '';
  var state = 0;
  var len = str.length;
  var i, char_;
  var key = '', val = '';
  var data = {};

  var define = function () {
    data[key.trim()] = val.trim();
    key = '';
    val = '';
  };

  for (i = 0; i < len; i += 1) {
    char_ = str[i];
    switch (state) {
      case 0:
        if (char_ === ':') {
          state = 1;
        } else {
          key += char_;
        }
        break;
      case 1:
        if (char_ === ';') {
          state = 2;
          i -= 1;
        } if (char_ === ':') {
          throw new Error('Syntax Error');
        } else {
          val += char_;
        }
        break;
      case 2:
        define();
        state = 0;
        break;
    }
  }

  if (key && val) {
    define();
  }

  return data;
};

proto.run = function (ctx) {
  var i, len;
  var mw = this.middleware;
  var fn;

  for (i = 0, len = mw.length; i < len; i += 1) {
    mw[i].call(ctx);
  }

  return ctx;
};

proto.toString = function () {
  var style = this.style;
  var prop, ctx;
  var str = [];
  
  for (prop in style) {
    if (style.hasOwnProperty(prop)) {
      ctx = this.run({
        style: this,
        key: prop,
        value: style[prop]
      });
      str.push(ctx.key + ': ' + String(ctx.value));
    }
  }

  return str.join('; ');
};

});

require.register("poying~inline-style-auto-prefix@v0.0.0", function (exports, module) {
'use strict';

var getStyle = window.getComputedStyle;
var vendorPrefix = getVendorPrefix();

module.exports = function () {
  return function () {
    var key = this.key;
    if (needPrefix(key)) {
      this.key = vendorPrefix + key[0].toUpperCase() + key.slice(1);
    }
  };
};

function getVendorPrefix() {
  var prefix;

  if (getStyle) {
    var style = getStyle(document.documentElement, '');
    var match;
    style = Array.prototype.join.call(style, '');
    match = style.match(/-(?:O|Moz|webkit|ms)-/i);
    if (match) {
      prefix = match[0];
    }
  }

  return prefix;
}

function needPrefix(key) {
  if (getStyle) {
    var r = new RegExp('^-\\w+-' + (key || ''), 'm');
    return r.test(Array.prototype.join.call(getStyle(document.body), '\n'));
  }
  return false;
}

});

require.register("poying~transition-duration@master", function (exports, module) {
'use strict';

var map = {
  s: 1000
};

var ms = function (duration) {
  duration = duration.trim();

  var match = duration.match(/^([\.\d]+)(ms|s)/);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * (map[match[2]] | 0);
};

module.exports = function (el, detail) {
  var computed = window.getComputedStyle(el);
  var duration = computed.transitionDuration || '';

  duration = duration
    .split(',')
    .map(ms)
    .sort(function (a, b) {
      return b - a;
    });

  if (!detail) {
    return duration[0] | 0;
  }

  var transition = {};
  var property = computed.transitionProperty;

  property
    .split(',')
    .forEach(function (name, index) {
      name = name.trim();
      transition[name] = duration[index];
    });

  return transition;
};

});

require.register("clockpicker.vanilla", function (exports, module) {
'use strict';

var Emitter = require("component~emitter@1.1.3");
var defaultOptions = require("clockpicker.vanilla/lib/default-options.js");
var Clock = require("clockpicker.vanilla/lib/clock.js");
var Pop = require("clockpicker.vanilla/lib/pop.js");

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

  var pos = {
    top: rect.top - bodyRect.top,
    left: rect.left - bodyRect.left
  };

  pos.top += rect.bottom - rect.top + 24;
  pos.left -= helfWidth;

  if (pos.top > window.screen.height / 2) {
    pos.top -= 48 + height;
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

});

require.register("clockpicker.vanilla/lib/create-svg-element.js", function (exports, module) {
'use strict';

module.exports = function (tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
};

});

require.register("clockpicker.vanilla/lib/default-options.js", function (exports, module) {
'use strict';

var defaultOptions = {
  el: null,
  default: '',
  button: true,
  donetext: 'Done',
  twelvehour: false,
  clockSize: 200
};

module.exports = function (options) {
  var ret = {};

  Object.keys(defaultOptions).forEach(function (key) {
    if (options.hasOwnProperty(key)) {
      ret[key] = options[key];
    } else {
      ret[key] = defaultOptions[key];
    }
  });

  return ret;
};

});

require.register("clockpicker.vanilla/lib/dial.js", function (exports, module) {
'use strict';

var Point = require("clockpicker.vanilla/lib/point.js");
var Tick = require("clockpicker.vanilla/lib/tick.js");
var animate = require("clockpicker.vanilla/lib/animate.js");

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

});

require.register("clockpicker.vanilla/lib/hand.js", function (exports, module) {
'use strict';

var Emitter = require("component~emitter@1.1.3");
var createSvgElement = require("clockpicker.vanilla/lib/create-svg-element.js");

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

});

require.register("clockpicker.vanilla/lib/point.js", function (exports, module) {
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

});

require.register("clockpicker.vanilla/lib/pop.js", function (exports, module) {
'use strict';

var Emitter = require("component~emitter@1.1.3");
var animate = require("clockpicker.vanilla/lib/animate.js");

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

});

require.register("clockpicker.vanilla/lib/tick.js", function (exports, module) {
'use strict';

var inlineStyle = require("poying~inline-style@0.0.4");
var autoprefix = require("poying~inline-style-auto-prefix@v0.0.0");

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

});

require.register("clockpicker.vanilla/lib/clock.js", function (exports, module) {
'use strict';

var Emitter = require("component~emitter@1.1.3");
var inlineStyle = require("poying~inline-style@0.0.4");
var autoprefix = require("poying~inline-style-auto-prefix@v0.0.0");
var createSvgElement = require("clockpicker.vanilla/lib/create-svg-element.js");
var Dial = require("clockpicker.vanilla/lib/dial.js");
var Hand = require("clockpicker.vanilla/lib/hand.js");
var Point = require("clockpicker.vanilla/lib/point.js");

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

});

require.register("clockpicker.vanilla/lib/animate.js", function (exports, module) {
'use strict';

var duration = require("poying~transition-duration@master");

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

});

if (typeof exports == "object") {
  module.exports = require("clockpicker.vanilla");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("clockpicker.vanilla"); });
} else {
  this["clockpicker"] = require("clockpicker.vanilla");
}
})()
