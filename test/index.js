'use strict';
require('should');

var documentHighlight = require('../lib');

describe('Highlight query', function() {
  it('should be mandatory', function() {
    try {
      documentHighlight.text("my text");
    } catch(e) {
      return;
    }

    throw new Error("Query should be mandatory");
  });
});

describe('Highlight options', function() {
  it('should not be mandatory', function() {
    documentHighlight.text("my text", "text").text.should.eql("my <strong>text</strong>");
  });

  it('should allow override of before and after', function() {
    documentHighlight.text("my text", "text", {before: '^', after: '$'}).text.should.eql("my ^text$");
  });

  it('should allow override of beforeSecond', function() {
    documentHighlight.html("my <strong>text is awesome</strong>", "my text", {before: '<span>', beforeSecond:'<span class=sec>', after: '</span>'}).should.eql("<span>my </span><strong><span class=sec>text</span> is awesome</strong>");
  });

  it('should load language datas', function() {
    // No match in en
    documentHighlight.text("my téxt", "text", {language: "en"}).text.should.eql("my téxt");

    // Match in fr
    documentHighlight.text("my téxt", "text", {language: "fr"}).text.should.eql("my <strong>téxt</strong>");
  });

  it('should forbid unknown languages', function() {
    try {
      documentHighlight.text("my text", "text", {language: "nope"});
    } catch(e) {
      return;
    }

    throw new Error("Unknown language should be forbidden.");
  });
});
