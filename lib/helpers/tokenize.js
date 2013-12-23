'use strict';

/**
 * Split the query into atomic words.
 */
module.exports = function tokenize(query, languageDatas) {
  var tokens = [];
  var splitter = function(match, p1) {
    var token = {
      // Normalized token
      token: p1.toLowerCase(),
      // Is this a stopword
      stopword: languageDatas.stopwords.indexOf(p1.toLowerCase()) !== -1
    };
    tokens.push(token);

    return '';
  };

  var alphaRange = '[' + languageDatas.alpha_range + ']';
  var notAlphaRange = '[^' + languageDatas.alpha_range + ']';
  var suffixRegexp = new RegExp('(' + alphaRange + '+)(' + notAlphaRange + '|$)', 'ig');
  // Apply splitter function to query, thus building tokens array
  query.replace(suffixRegexp, splitter);

  return tokens;
};
