'use strict';

/**
 * Method can be 'pop' or 'shift'
 */
var generateQueries = function (rawTokens, tokens, method) {
  var ret = [];

  rawTokens[method]();
  while(rawTokens.length > 0) {
    // Check the current query does not only contains stopwords
    var hasOnlyStopwords = true;
    for(var j = 0; j < rawTokens.length; j += 1) {
      if(!rawTokens[j].stopword) {
        hasOnlyStopwords = false;
        break;
      }
    }

    if(hasOnlyStopwords) {
      break;
    }

    ret.push(rawTokens.join(" "));
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
  ret.push(rawTokens.join(" "));
  // Start removing items from the end.
  ret = ret.concat(generateQueries(rawTokens.slice(0), tokens, 'pop'));
  // Start removing items from the start.
  ret = ret.concat(generateQueries(rawTokens.slice(0), tokens, 'shift'));
  
  ret.push("-----------");
  // Add all non stopwords
  for(var i = 0; i < rawTokens.length; i+= 1) {
    if(!tokens[i].stopword) {
      ret.push(rawTokens[i]);
    }
  }

  console.log(ret);
  return ret;
};
