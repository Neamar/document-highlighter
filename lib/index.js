'use strict';

var normalizeToken = require('./normalize.js');
var tokenizeQuery = require('./tokenize.js');
var generateQueries = require('./subqueries.js');

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

  // Split query into tokens
  var tokens = tokenizeQuery(query, languageDatas);

  // Normalize those tokens
  tokens.forEach(function(token) {
    token.original = token.token;
    if(!token.stopword) {
      token.token = normalizeToken(token.token, languageDatas);
    }

    return token.token;
  });


  // Store all matches.
  // In a first round, we will replace them with special placeholder (@0@, @1@, @2@...) for each match.
  // This avoids highlighting the same subquery multiple times.
  // We will then replace every placeholder with the matched value, as stored in highlightTerms array.
  var placeholders = [];

  var insertPlaceholders = function(match) {
    placeholders.push(options.before + match + options.after);
    return '@' + (placeholders.length - 1) + '@';
  };


  // Create subqueries
  var queries = generateQueries(tokens);

  for(var i=0; i < queries.length; i += 1) {
    var regexpQuery = queries[i];

    text = applyRegexp(text, regexpQuery, insertPlaceholders);
  }


  // Now, replace placeholders
  var removePlaceholders = function(match, p1) {
    return placeholders[p1];
  };
  text = text.replace(new RegExp("@([0-9]+)@", "ig"), removePlaceholders);
  return text;
};
