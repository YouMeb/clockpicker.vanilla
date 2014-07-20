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
