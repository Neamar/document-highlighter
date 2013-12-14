'use strict';


/**
 * Normalize the query for suffix and unicode matching.
 *
 * E.G. "wélcôME worlds" will become "w(e|é|è|ê)lcom(e|é|è|ê)s? worlds?" for french.
 */
var normalizeQuery = function(query, languageDatas) {
  // Escape existing regexp special characters from query
  var regexpQuery = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  
  // Suffix words
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

  return regexpQuery;
};


/**
 * Apply regexpQuery to text, using replacer as callback function for each match.
 */
var applyRegexp = function(text, regexpQuery, replacer) {
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

  // Load language
  var languageDatas = require('../datas/' + options.language);

  // Create regexp from query
  var regexpQuery = normalizeQuery(query, languageDatas);

  // Store all matches.
  // In a first round, we will replace them with special placeholder (@0@, @1@, @2@...) for each match.
  // This avoids highlighting the same subquery multiple times.
  // We will then replace every placeholder with the matched value, as stored in highlightTerms array.
  var placeholders = [];

  var insertPlaceholders = function(match) {
    placeholders.push(options.before + match + options.after);
    return '@' + (placeholders.length - 1) + '@';
  };

  // Try to highlight "complete query"
  text = applyRegexp(text, regexpQuery, insertPlaceholders);


  // Now, replace placeholders
  var removePlaceholders = function(match, p1) {
    return placeholders[p1];
  };
  text = text.replace(new RegExp("@([0-9]+)@", "ig"), removePlaceholders);
  return text;
};
