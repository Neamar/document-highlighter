'use strict';

var fs = require('fs');
var documentHighlight = require('../lib');

describe("Large file", function() {
  // Hard timeout to check performance
  this.timeout(100);


  var highlightOptions = {before:'<span style="background-color:yellow">', after:"</span>", language: 'fr'};
  var html = fs.readFileSync(__dirname + '/sample/complex.html').toString();

  it("should work in real time for simple queries", function() {
    var insa = documentHighlight.html(html, "insa", highlightOptions);
    insa.html.should.include('à <span class="ff5">l’<span style="background-color:yellow"><span class="_ _0"></span>IN<span class="_ _4"></span>SA</span> <span class="_ _2"></span>de L<span class="_ _2"></span>y<span class="_ _2"></span>on');
  });

  it("should work in real time for complex queries", function() {
    var complex = documentHighlight.html(html, "filière agiir PHP", highlightOptions);

    complex.html.should.include('<div class="t m0 x7 h8 ya ff4 fs3 fc1 sc0 ls0 ws0"><span style="background-color:yellow">Fi<span class="_ _0"></span>li<span class="_ _2"></span>ère</span><span class="_ _0"></span>');
    complex.html.should.include('<span class="_ _5"> </span><span style="background-color:yellow">Agiir</span> <span class="_ _5"> </span>N<span class="_ _4"></span>e<span class="_ _0"></span>tw<span class="_ _2">');
    complex.html.should.include('<div class="t m0 x7 h8 y12 ff3 fs3 fc1 sc0 ls0 ws0"><span style="background-color:yellow">PHP</span> (nat<span class="_ _4"></span>i<span class="_ _0"></span>f');
  });

  // it.only('real case test', function() {
  //   // Put your input file here
  //   var html = fs.readFileSync('/tmp/file.html').toString();
  //   var ch = documentHighlight.html(html, 'Projet', highlightOptions);

  //   // retrieve output here
  //   fs.writeFileSync('/tmp/file-hl.html', ch.html);
  // });
});
