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
  var processed = {};
  var replacements = [];

  // Build character groups - find all characters that should be equivalent
  for(var letter in languageData.unicode || {}) {
    if(processed[letter]) continue;

    // Collect all variations for this letter
    var group = [letter];
    var variations = languageData.unicode[letter] || [];
    
    variations.forEach(function(variant) {
      if(group.indexOf(variant) === -1) {
        group.push(variant);
      }
    });

    // Also check if any of these variants have their own mappings
    var groupCopy = group.slice(0);
    groupCopy.forEach(function(char) {
      if(languageData.unicode[char]) {
        languageData.unicode[char].forEach(function(v) {
          if(group.indexOf(v) === -1) {
            group.push(v);
          }
        });
      }
    });

    var charClass = '(?:' + group.join('|') + ')';

    // Store replacement info for each character in the group
    group.forEach(function(char) {
      if(!processed[char]) {
        replacements.push({
          char: char,
          charClass: charClass
        });
        processed[char] = true;
      }
    });
  }

  // Use placeholders to prevent nested replacements
  var placeholders = [];
  replacements.forEach(function(repl, index) {
    var placeholder = '\x00' + index + '\x00';
    var escapedChar = repl.char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regexpToken = regexpToken.replace(new RegExp(escapedChar, 'g'), placeholder);    placeholders.push({
      placeholder: placeholder,
      charClass: repl.charClass
    });
  });

  // Replace placeholders with actual char classes
  placeholders.forEach(function(ph) {
    var escapedPlaceholder = ph.placeholder.replace(/\x00/g, '\\x00');
    regexpToken = regexpToken.replace(new RegExp(escapedPlaceholder, 'g'), ph.charClass);
  });

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
