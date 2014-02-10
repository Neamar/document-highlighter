'use strict';
require('should');

var documentHighlight = require('../lib');

describe('Highlight query', function() {
  it('can be empty', function() {
    var text = "some sample text";

    var ret = documentHighlight.text(text);
    ret.should.have.keys(['text', 'indexes']);
    ret.text.should.equal(text);
    ret.indexes.should.eql([]);
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
    documentHighlight.html("my <strong>text is awesome</strong>", "my text", {before: '<span>', beforeSecond:'<span class=sec>', after: '</span>'}).html.should.eql("<span>my </span><strong><span class=sec>text</span> is awesome</strong>");
  });

  it('should allow global override of before and after', function() {
    var defaultDefaultOptionsBefore = documentHighlight.defaultOptions.before;
    var defaultDefaultOptionsAfter = documentHighlight.defaultOptions.after;
    documentHighlight.defaultOptions.before = 'g^';
    documentHighlight.defaultOptions.after = 'g$';

    documentHighlight.text("my text", "text").text.should.eql("my g^textg$");

    // Restore default options
    documentHighlight.defaultOptions.before = defaultDefaultOptionsBefore;
    documentHighlight.defaultOptions.after = defaultDefaultOptionsAfter;
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
