'use strict';


/**
 * Highlight all matching regexpQuery in text.
 */
var highlight = function(text, regexpQuery, replacer) {
  var r = new RegExp(regexpQuery, 'i');

  text = text.replace(r, replacer);
  return text;
};


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
  
  // Suffix
  var suffixes = '(' + languageDatas.suffix.join('|') + ')';
  // Remove existing suffix in place
  regexpQuery = regexpQuery.replace(new RegExp(suffixes + '(\\s|$)', 'ig'), '$2');
  // Add them everywhere as optional
  suffixes = suffixes + "?";
  regexpQuery = regexpQuery.replace(/([0-9a-z])([^0-9a-z]|$)/ig, '$1' + suffixes + '$2');

  // Special chars
  for(var letter in languageDatas.unicode || {}) {
    var letterMutations = languageDatas.unicode[letter].slice(0);
    letterMutations.unshift(letter);

    var charClass = '(' + letterMutations.join('|') + ')';

    // Search for pattern charClass and replace it... with charClass, i.e. "e" becomes (é|è|e), and so do é.
    regexpQuery = regexpQuery.replace(new RegExp(charClass, 'g'), charClass);
  }

  var highlightsTerms = [];

  var insertPlaceholders = function(match) {
    highlightsTerms.push(options.before + match + options.after);
    return '@' + (highlightsTerms.length - 1) + '@';
  };

  // Try to highlight "complete query"
  text = highlight(text, regexpQuery, insertPlaceholders);

  // Now, replace placeholders
  var removePlaceholders = function(match, p1) {
    return highlightsTerms[p1];
  };

  text = text.replace(new RegExp("@([0-9]+)@", "ig"), removePlaceholders);
  return text;
};
