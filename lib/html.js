'use strict';

var highlightText = require('./text.js');

module.exports = function highlightHtml(text, query, options) {
  // Generate HTML mapping

  var ret = highlightText(text, query, options);

  return ret.text;
};
