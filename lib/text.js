'use strict';

var normalizeToken = require('./helpers/normalize.js');
var tokenizeQuery = require('./helpers/tokenize.js');
var generateQueries = require('./helpers/subqueries.js');
var mergeDefaultOptions = require('./options.js');
var languages = require('./languages.json');

/**
 * Apply regexpQuery to text, using replacer as callback function for each match.
 */
var applyRegexp = function(text, regexpQuery, replacer) {
  var r = new RegExp(regexpQuery, 'gi');

  text = text.replace(r, replacer);
  return text;
};


module.exports = function highlightText(text, query, options) {
  if(!query) {
    var ret = {
      text: text,
      indexes: []
    };

    return ret;
  }

  options = mergeDefaultOptions(options);

  // ----- Load language
  var languageData = languages[options.language];
  if (!languageData) {
    throw new Error("No language data for language '" + options.language + "'");
  }

  // ----- Split query into tokens
  var tokens = tokenizeQuery(query, languageData);

  // ----- Normalize those tokens
  tokens.forEach(function(token) {
    token.original = token.token;
    if(!token.stopword) {
      token.token = normalizeToken(token.token, languageData);
    }

    return token.token;
  });


  // Store all matches.
  // In a first round, we will replace them with special placeholder (@0@, @1@, @2@...) for each match.
  // This avoids highlighting the same subquery multiple times.
  // We will then replace every placeholder with the matched value, as stored in highlightTerms array.
  var placeholders = [];

  var insertPlaceholders = function(match, startDelimiter, content, endDelimiter) {
    placeholders.push(content);
    return startDelimiter + '@' + (placeholders.length - 1) + '@' + endDelimiter;
  };


  // ----- Create subqueries
  var queries = generateQueries(tokens);
  // ----- Try to math each query
  var alphaRange = languageData.alpha_range;
  for(var i = 0; i < queries.length; i += 1) {
    var regexpQuery = '([^' + alphaRange + ']|^)(' + queries[i] + ')([^' + alphaRange + ']|$)';
    text = applyRegexp(text, regexpQuery, insertPlaceholders);
  }

  // ----- Merge highlights separated by stopwords
  var reducePlaceholders = function(match, firstIndex, stopWords, lastIndex) {
    var newPlaceholder = placeholders[firstIndex] + stopWords + placeholders[lastIndex];
    placeholders.push(newPlaceholder);
    return '@' + (placeholders.length - 1) + '@';
  };
  var stopWordRegexp = '(?:' + languageData.stopwords.join('|') + ')';
  var reduceRegexp = new RegExp('(?:@([0-9]+)@)(\\s+(?:' + stopWordRegexp + '\\s+)*)(?:@([0-9]+)@)', 'i');

  text = text.replace(reduceRegexp, reducePlaceholders);


  // ----- Finally, replace placeholders
  var indexes = [];
  var indexDelta = 0;
  var removePlaceholders = function(match, placeholderIndex, index) {
    var placeholder = placeholders[placeholderIndex];

    indexes.push({
      startIndex: index + indexDelta,
      endIndex: index + placeholder.length + indexDelta,
      content: placeholder
    });

    // Update index delta
    indexDelta += placeholder.length - match.length;

    return options.before + placeholder + options.after;
  };
  text = text.replace(new RegExp("@([0-9]+)@", "ig"), removePlaceholders);

  var ret = {
    text: text,
    indexes: indexes,
  };

  return ret;
};
