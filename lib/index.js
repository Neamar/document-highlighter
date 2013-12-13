'use strict';

module.exports = function(text, query, options) {
  var r = new RegExp(query, 'i');

  var replacer = function (match) {
    return options.before + match + options.after;
  };
  
  text = text.replace(r, replacer);
  return text;
};
