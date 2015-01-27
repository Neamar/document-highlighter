'use strict';

var EMAIL_PLACEHOLDERS = "internalEmailPlaceholder";

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
  var emails = {};

  // Search for emails, we don't want to tokenize them
  // Without this, "test@sample.com" would generate 3 tokens (test, sample, com) and that's probably not the expected behavior
  query = query.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i, function(wholeMatch) {
    var placeHolder = EMAIL_PLACEHOLDERS + Object.keys(emails).length;
    emails[placeHolder] = wholeMatch;
    return placeHolder;
  });


  // Then tokenize according to languageData rules
  var alphaRange = '[' + languageData.alpha_range + '0-9]';
  var notAlphaRange = '[^' + languageData.alpha_range + '0-9]';
  var suffixRegexp = new RegExp('(' + alphaRange + '+)(' + notAlphaRange + '|$)', 'ig');

  var tokens = [];
  // Apply splitter function to query, thus building tokens array
  query.replace(suffixRegexp, function(wholeMatch, firstGroup) {
    if(emails[firstGroup]) {
      // This is an email placeholder, replace it
      firstGroup = emails[firstGroup];
    }

    var token = {
      // Normalized token
      token: firstGroup.toLowerCase(),
      // Is this a stopword
      stopword: (languageData.stopwords.indexOf(firstGroup.toLowerCase()) !== -1)
    };

    tokens.push(token);

    return '';
  });

  return tokens;
};
