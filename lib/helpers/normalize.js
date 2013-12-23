'use strict';
// This file normalize a query to match :
// * case
// * standard suffix (e.g. plural words)
// * standard unicode variations (e.g. accents)
// * ...

/**
 * Append suffix at the end of every word, for plural use.
 */
var normalizeSuffix = function normalizeSuffix(regexpToken, languageDatas) {
  var suffixes = '(?:' + languageDatas.suffix.join('|') + ')';

  // Remove existing suffix in place
  regexpToken = regexpToken.replace(new RegExp(suffixes + '$', 'i'), '');

  // Add them as optional
  regexpToken += suffixes + "?";

  return regexpToken;
};


/**
 * Append punctuation onto the query
 */
var normalizePunctuation = function normalizePunctuation(regexpToken, languageDatas) {
  // Double question marke for ungreedy quantifier
  regexpToken += '[,;:\\.\\!\\?]??';

  return regexpToken;
};


/**
 * Replaces accented characters with their latin equivalents
 */
var normalizeUnicode = function normalizeUnicode(regexpToken, languageDatas) {
  for(var letter in languageDatas.unicode || {}) {
    var letterMutations = languageDatas.unicode[letter].slice(0);
    letterMutations.unshift(letter);

    var charClass = '(?:' + letterMutations.join('|') + ')';

    // Search for pattern charClass and replace it... with charClass, i.e. "e" becomes (é|è|e), and so do é.
    regexpToken = regexpToken.replace(new RegExp(charClass, 'g'), charClass);
  }

  return regexpToken;
};


/**
 * Normalize the token for suffix and unicode matching.
 *
 * E.G. "wélcôME" will become "w(e|é|è|ê)lcom(e|é|è|ê)s?" for french.
 */
module.exports = function(token, languageDatas) {
  var regexpToken = token;

  // Suffix words
  regexpToken = normalizeSuffix(regexpToken, languageDatas);
  // Add punctuation
  regexpToken = normalizePunctuation(regexpToken, languageDatas);
  // Special chars
  regexpToken = normalizeUnicode(regexpToken, languageDatas);

  return regexpToken;
};
