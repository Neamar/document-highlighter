'use strict';

/**
 * Returns a list of subqueries from the tokens.
 */
module.exports = function(tokens) {
  var ret = [];
  var raw = tokens.map(function(token) {
    return token.token;
  });

  ret.push(raw.join(" "));

  return ret;
};
