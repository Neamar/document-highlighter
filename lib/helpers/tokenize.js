'use strict';

/**
 * Split the query into atomic words.
 * tokenize("drink and be merry", {en_data}) =>
 * [
 *  { token: 'drink', stopword: false },
 *  { token: 'and', stopword: true },
 *  { token: 'be', stopword: true },
 *  { token: 'merry', stopword: false }
 * ]
 */
module.exports = function tokenize(query, languageData) {
  var tokens = [];
  var splitter = function(wholeMatch, firstGroup) {
    var token = {
      // Normalized token
      token: firstGroup.toLowerCase(),
      // Is this a stopword
      stopword: (languageData.stopwords.indexOf(firstGroup.toLowerCase()) !== -1)
    };
    tokens.push(token);

    return '';
  };

  var alphaRange = '[' + languageData.alpha_range + '0-9]';
  var notAlphaRange = '[^' + languageData.alpha_range + '0-9]';
  var suffixRegexp = new RegExp('(' + alphaRange + '+)(' + notAlphaRange + '|$)', 'ig');

  // Apply splitter function to query, thus building tokens array
  query.replace(suffixRegexp, splitter);

  return tokens;
};
