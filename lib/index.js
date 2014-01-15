'use strict';

var highlightText = require('./text.js');
var highlightHtml = require('./html.js');
var options = require('./options.js');

module.exports.text = highlightText;
module.exports.html= highlightHtml;
module.exports.defaultOptions = options.defaultOptions;
