'use strict';


/**
 * Append suffix at the end of every word, for plural use.
 */
var normalizeSuffix = function(regexpQuery, languageDatas) {
  var suffixes = '(' + languageDatas.suffix.join('|') + ')';
  // Remove existing suffix in place
  regexpQuery = regexpQuery.replace(new RegExp(suffixes + '(\\s|$)', 'ig'), '$2');
  // Add them everywhere as optional
  suffixes = suffixes + "?";
  var applySuffixes = function(match, p1, p2) {
    // Don't suffix stop words
    if(languageDatas.stopwords.indexOf(p1.toLowerCase()) !== -1) {
      return p1 + p2;
    }
    return p1 + suffixes + p2;
  };
  var alphaRange = '[' + languageDatas.alpha_range + ']';
  var notAlphaRange = '[^' + languageDatas.alpha_range + ']';
  var suffixRegexp = new RegExp('(' + alphaRange + '+)(' + notAlphaRange + '|$)', 'ig');
  regexpQuery = regexpQuery.replace(suffixRegexp, applySuffixes);

  return regexpQuery;
};


/**
 * Replaces accented characters with their latin equivalents
 * TODO: skip stopwords
 */
var normalizeUnicode = function(regexpQuery, languageDatas) {
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
 * Normalize the query for suffix and unicode matching.
 *
 * E.G. "wélcôME worlds" will become "w(e|é|è|ê)lcom(e|é|è|ê)s? worlds?" for french.
 */
module.exports = function(query, languageDatas) {
  // Escape existing regexp special characters from query
  var regexpQuery = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  
  // Suffix words
  regexpQuery = normalizeSuffix(regexpQuery, languageDatas);

  // Special chars
  regexpQuery = normalizeUnicode(regexpQuery, languageDatas);

  console.log(regexpQuery);
  return regexpQuery;
};