'use strict';
require('should');

var documentHighlight = require('../lib');

var generateIts = function(its) {
  for(var itShould in its) {
    var itDatas = its[itShould];
    it(itShould, function() {
      documentHighlight(itDatas[0], itDatas[1]).should.eql(itDatas[2]);
    });
  }
};

describe('Standard mode', function() {
  describe('with text content', function() {
    var its = {
      'should not modify non matching text': ['Some text', 'non matching query', 'Some text']
    };

    generateIts(its);
  });

  describe('with HTML content', function() {

  });
});

describe('Strict mode', function() {
  describe('with text content', function() {

  });

  describe('with HTML content', function() {

  });
});
