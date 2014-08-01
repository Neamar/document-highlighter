'use strict';
/**
 * @file Normalize a query to match :
 * - case
 * - standard suffix (e.g. plural words)
 * - standard unicode variations (e.g. accents)
 * - ...
 */

/**
 * Allow all standard suffixes for this language
 * to be optionally appended to each word (e.g. plural).
 */
var normalizeSuffix = function normalizeSuffix(regexpToken, languageData) {
  var suffixes = '(?:' + languageData.suffix.join('|') + ')';

  // Remove existing suffix in place
  regexpToken = regexpToken.replace(new RegExp(suffixes + '$', 'i'), '');

  // Add them as optional
  regexpToken += suffixes + "?";

  return regexpToken;
};


/**
 * Allow punctuation to be appended to the query
 */
var normalizePunctuation = function normalizePunctuation(regexpToken) {
  // Double question mark for ungreedy quantifier
  regexpToken += '[,;:\\.\\!\\?]??';

  return regexpToken;
};


/**
 * Replace accented characters in the query by their latin equivalent
 */
var normalizeUnicode = function normalizeUnicode(regexpToken, languageData) {
  for(var letter in languageData.unicode || {}) {
    var letterMutations = languageData.unicode[letter].slice(0);
    letterMutations.unshift(letter);

    var charClass = '(?:' + letterMutations.join('|') + ')';

    // Search for pattern charClass and replace it... with charClass, i.e. "e" becomes (é|è|e), and so do é.
    regexpToken = regexpToken.replace(new RegExp(charClass, 'g'), charClass);
  }

  console.log(regexpToken);

  return regexpToken;
};


/**
 * Normalize the token for suffix and unicode matching.
 *
 * E.g. "wélcôME" will become "w(e|é|è|ê)lcom(e|é|è|ê)s?" for french.
 */
module.exports = function(token, languageData) {
  var regexpToken = token;

  // Suffix words
  regexpToken = normalizeSuffix(regexpToken, languageData);
  // Add punctuation
  regexpToken = normalizePunctuation(regexpToken, languageData);
  // Special chars
  regexpToken = normalizeUnicode(regexpToken, languageData);

  return regexpToken;
};
