'use strict';
require('should');

var documentHighlight = require('../lib');

describe('Highlight options', function() {
  it('should not be mandatory', function() {
    documentHighlight("my text", "text").should.eql("my <strong>text</strong>");
  });

  it('should allow override of before and after', function() {
    documentHighlight("my text", "text", {before: '^', after: '$'}).should.eql("my ^text$");
  });

  it('should load language datas', function() {
    // No match in en
    documentHighlight("my téxt", "text", {language: "en"}).should.eql("my téxt");

    // Match in fr
    documentHighlight("my téxt", "text", {language: "fr"}).should.eql("my <strong>téxt</strong>");
  });

  it('should forbid unknown languages', function() {
    try {
      documentHighlight("my text", "text", {language: "nope"});
    } catch(e) {
      return;
    }

    throw new Error("Unknown language should be forbidden.");
  });

  it('should allow for regexp chars in query', function() {
    documentHighlight("my ^text$", "^text$").should.eql("my <strong>^text$</strong>");
  });
});
