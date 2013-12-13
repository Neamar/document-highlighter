'use strict';

module.exports = function(text, query, options) {
  if(!options) {
    options = {};
  }
  options.before = options.before || "<strong>";
  options.after = options.after || "</strong>";
  options.language = options.language ? options.language.replace(/[^a-z]/g, '') : "en";

  var languageDatas = require('../datas/' + options.language);

  // Escape regexp components from query
  var regexpQuery = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  for(var letter in languageDatas.unicode || {}) {
    languageDatas.unicode[letter].unshift(letter);

    var charClass = '[' + languageDatas.unicode[letter].join('|') + ']';
    regexpQuery = regexpQuery.replace(new RegExp(letter, 'g'), charClass);
  }

  var r = new RegExp(regexpQuery, 'i');

  var replacer = function (match) {
    return options.before + match + options.after;
  };

  text = text.replace(r, replacer);
  return text;
};
