'use strict';
require('should');

var documentHighlight = require('../lib');

var generateIts = function(its) {
  for(var itShould in its) {
    var itDatas = its[itShould];
    it(itShould, function() {
      documentHighlight(itDatas[0]).should.eql(itDatas[1]);
    });
  }
};

describe('Standard mode', function() {
  describe('with text content', function() {
    var its = {
      'should': ['hello', 'hello']
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
