'use strict';

var container = document.querySelector('.page-main');
var Clockpicker = require('clockpicker.vanilla');
var picker = new Clockpicker();

picker.el.classList.add('picker');
container.appendChild(picker.el);

picker.init();
picker.el.focus();
