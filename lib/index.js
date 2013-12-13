'use strict';

module.exports = function(text, query, options) {
  var r = new RegExp(query, 'i');
  text = text.replace(r, options.before + query + options.after);
  return text;
};
