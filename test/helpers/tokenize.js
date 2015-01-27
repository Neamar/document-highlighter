"use strict";
require("should");

var tokenize = require('../../lib/helpers/tokenize.js');
var languageData = require('../../lib/languages.json').en;

describe.only("tokenize()", function() {
  it("should send back tokens", function() {
    var tokens = tokenize("hello world", languageData);

    tokens.should.eql([
      {token: 'hello', stopword: true},
      {token: 'world', stopword: false}
    ]);
  });

  it("should send back tokens with custom separators", function() {
    var tokens = tokenize("hello486 world_lol", languageData);

    tokens.should.eql([
      {token: 'hello486', stopword: false},
      {token: 'world', stopword: false},
      {token: 'lol', stopword: false}
    ]);
  });

  it("should not split emails", function() {
    var tokens = tokenize("hello world test@email.com", languageData);

    tokens.should.eql([
      {token: 'hello', stopword: true},
      {token: 'world', stopword: false},
      {token: 'test@email.com', stopword: false}
    ]);
  });
});
