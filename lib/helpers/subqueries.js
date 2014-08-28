'use strict';


/**
 * Method can be 'pop' or 'shift'
 */
var generateQueries = function(rawTokens, tokens, method) {
  var ret = [];

  // Apply methods to both array, to keep them in sync
  rawTokens[method]();
  tokens[method]();

  while(rawTokens.length > 0) {
    // Check the current query does not only contains stopwords
    var hasOnlyStopwords = true;
    for(var j = 0; j < rawTokens.length; j += 1) {
      if(!tokens[j].stopword) {
        hasOnlyStopwords = false;
        break;
      }
    }

    if(hasOnlyStopwords) {
      break;
    }

    ret.push(rawTokens.join("[ \\t]+"));
    rawTokens[method]();
  }

  return ret;
};


/**
 * Returns a list of subqueries from the tokens.
 */
module.exports = function(tokens) {
  var ret = [];
  var rawTokens = tokens.map(function(token) {
    return token.token;
  });

  // Add complete query
  if(rawTokens.length > 0) {
    ret.push(rawTokens.join("[ \\t]+"));
  }

  // Start removing items from the end.
  ret = ret.concat(generateQueries(rawTokens.slice(0), tokens.slice(0), 'pop'));
  // Start removing items from the start.
  ret = ret.concat(generateQueries(rawTokens.slice(0), tokens.slice(0), 'shift'));

  // Add all non stopwords
  // TODO: allow for stopwords to be part of the query?
  for(var i = 0; i < rawTokens.length; i+= 1) {
    if(!tokens[i].stopword) {
      ret.push(rawTokens[i]);
    }
  }

  // Remove duplicates
  ret = ret.reverse().filter(function (e, i, arr) {
    return (arr.indexOf(e, i+1) === -1);
  }).reverse();

  return ret;
};
