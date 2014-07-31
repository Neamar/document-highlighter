'use strict';
require('should');

var documentHighlight = require('../lib');

var generateTextIt = function(description, text, query, options, expected) {
  it(description, function() {
    var ret = documentHighlight.text(text, query, options);
    ret.text.should.eql(expected);
  });
};

var generateHtmlIt = function(description, text, query, options, expected) {
  it(description, function() {
    var ret = documentHighlight.html(text, query, options);
    ret.html.should.eql(expected);
  });
};

var generateIts = function(its, func) {
  var defaultOptions = {
    before: '*',
    after: '*'
  };

  for(var itShould in its) {
    var itDatas = its[itShould];
    func(itShould, itDatas.text, itDatas.query, itDatas.options || defaultOptions, itDatas.expected);
  }
};

describe('Standard mode', function() {
  describe('with text content', function() {
    var its = {
      'should not modify non-matching text': {
        text: 'Hello and welcome to the real world, Neo',
        query: 'non matching query',
        expected: 'Hello and welcome to the real world, Neo'
      },
      'should highlight relevant text': {
        text: 'Hello and welcome to the real world, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to the real world*, Neo',
      },
      'should highlight all relevant text': {
        text: 'Hello and welcome to the real world, Neo. This world is mine, not your old world.',
        query: 'world',
        expected: 'Hello and welcome to the real *world*, Neo. This *world* is mine, not your old *world*.',
      },
      'should be case insensitive to the text': {
        text: 'Hello and WELCOME to the real world, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *WELCOME to the real world*, Neo',
      },
      'should be case insensitive to the query': {
        text: 'Hello and welcome to the real world, Neo',
        query: 'WELCOME to the real world',
        expected: 'Hello and *welcome to the real world*, Neo',
      },
      'should use unicode mapping for the text': {
        text: 'Vous souhaitez régler votre loyer, constituer votre épargne ou effectuer un virement régulier ?',
        query: 'regler votre loyer',
        expected: 'Vous souhaitez *régler votre loyer*, constituer votre épargne ou effectuer un virement régulier ?',
        options: {
          before: '*',
          after: '*',
          language: 'fr'
        }
      },
      'should use insensitive unicode mapping for the text': {
        text: 'Vous souhaitez RÉGLER votre loyer, constituer votre épargne ou effectuer un virement régulier ?',
        query: 'régler votre loyer',
        expected: 'Vous souhaitez *RÉGLER votre loyer*, constituer votre épargne ou effectuer un virement régulier ?',
        options: {
          before: '*',
          after: '*',
          language: 'fr'
        }
      },
      'should use unicode mapping for the query': {
        text: 'Vous souhaitez regler votre loyer, constituer votre épargne ou effectuer un virement régulier ?',
        query: 'régler votre loyer',
        expected: 'Vous souhaitez *regler votre loyer*, constituer votre épargne ou effectuer un virement régulier ?',
        options: {
          before: '*',
          after: '*',
          language: 'fr'
        }
      },
      'should match suffixes in the text': {
        text: 'Hello and welcome to the reals worlds, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to the reals worlds*, Neo',
      },
      'should match suffixes in the query': {
        text: 'Hello and welcome to the real world, Neo',
        query: 'welcome to the reals worlds',
        expected: 'Hello and *welcome to the real world*, Neo',
      },
      'should split non contiguous queries': {
        text: 'In JavaScript, you can define a callback handler in regex string replace operations',
        query: 'Javascript callback operations',
        expected: 'In *JavaScript*, you can define a *callback* handler in regex string replace *operations*',
      },
      'should split non contiguous queries and highlight longest match': {
        text: 'In JavaScript, you can define a callback handler in regex string replace operations',
        query: 'callback handler in operations',
        expected: 'In JavaScript, you can define a *callback handler in* regex string replace *operations*',
      },
      'should not highlight stop words': {
        text: 'Hello to the real world, Neo',
        query: 'Welcome to the probably real world',
        expected: 'Hello to the *real world*, Neo',
      },
      'should include stop-words queries': {
        text: 'Hello and farewell to the real world, Neo',
        query: 'farewell real world',
        expected: 'Hello and *farewell to the real world*, Neo',
      },
      'should allow for punctuations': {
        text: 'Eat, drink and be merry',
        query: 'eat drink',
        expected: '*Eat, drink* and be merry',
      },
      'should allow for numbers': {
        text: 'Similarity algorithm bm25 is awesome.',
        query: 'bm25',
        expected: 'Similarity algorithm *bm25* is awesome.',
      },
      'should allow for symbols': {
        text: 'FILE #BA/15/42',
        query: 'file ba 15 42',
        expected: '*FILE* #*BA*/*15*/*42*',
      },
      'should highlight multiple paragraphs': {
        text: 'Hello and welcome to the real world, Neo.\nTrinity will be there soon.',
        query: 'Neo Trinity',
        expected: 'Hello and welcome to the real world, *Neo*.\n*Trinity* will be there soon.',
      },
      'should work on longer texts': {
        text: "The index analysis module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query strings. It maps to the Lucene Analyzer.",
        query: "The index analysis string",
        expected: "*The index analysis* module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query *strings*. It maps to the Lucene Analyzer."
      }
    };
    generateIts(its, generateTextIt);

    it('should allow for regexp chars in query', function() {
      documentHighlight.text("my ^text$", "^text$").text.should.eql("my ^<strong>text</strong>$");
    });

    it('should return highlighted text and indices', function() {
      var ret = documentHighlight.text("Farewell and welcome to the real world.", "farewell world");

      var expected = {
        text: '<strong>Farewell</strong> and welcome to the real <strong>world</strong>.',
        indexes: [
          { startIndex: 0, endIndex: 8, content: 'Farewell'},
          { startIndex: 33, endIndex: 38, content: 'world'}
        ]
      };

      ret.should.eql(expected);
    });
  });

  describe('with HTML content', function() {
    var its = {
      'should not modify non-matching text': {
        text: 'Hello and <span>welcome to the</span> real world, Neo',
        query: 'non matching query',
        expected: 'Hello and <span>welcome to the</span> real world, Neo'
      },
      'should highlight and maintain HTML': {
        text: '<strong>Hello</strong> and welcome to the real world, Neo',
        query: 'welcome to the real world',
        expected: '<strong>Hello</strong> and *welcome to the real world*, Neo',
      },
      'should highlight and maintain HTML inside query': {
        text: 'Hello and welcome to the <strong>real</strong> world, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to the <strong>real</strong> world*, Neo',
      },
      'should highlight and maintain HTML inside query in edge case': {
        text: 'Hello and welcome to the <strong>real world</strong>, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to the <strong>real world</strong>*, Neo',
      },
      'should match multiples fragments': {
        text: 'In JavaScript, <em>you can define a callback handler in regex</em> string replace operations',
        query: 'callback handler operations',
        expected: 'In JavaScript, <em>you can define a *callback handler* in regex</em> string replace *operations*',
      },
      'should skip empty HTML': {
        text: 'Hello and welcome to<span class="a_0__0"></span> the real world, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to<span class="a_0__0"></span> the real world*, Neo',
      },
      'should skip embedded empty HTML': {
        text: 'Hello and wel<span class="a_0__0"></span>come to the real world, Neo',
        query: 'welcome to the real world',
        expected: 'Hello and *wel<span class="a_0__0"></span>come to the real world*, Neo',
      },
      'should return well-formed HTML': {
        text: 'Hello and welcome to <strong>the real world, Neo</strong>',
        query: 'welcome to the real world',
        expected: 'Hello and *welcome to *<strong>*the real world*, Neo</strong>',
      },
      'should highlight multiple paragraphs': {
        text: '<p>Hello and welcome to the real world, Neo.</p><p>Trinity will be there soon.</p>',
        query: 'Neo Trinity',
        expected: '<p>Hello and welcome to the real world, *Neo.*</p><p>*Trinity* will be there soon.</p>',
      },
      'should handle block elements': {
        text: '<p>Hello</p><p>Trinity</p>',
        query: 'Trinity',
        expected: '<p>Hello</p><p>*Trinity*</p>',
      },
      'should handle block elements with punctuation': {
        text: '<p>Hello and welcome to the real world, Neo.</p><p>Trinity will be there soon.</p>',
        query: 'Neo Trinity',
        expected: '<p>Hello and welcome to the real world, *Neo.*</p><p>*Trinity* will be there soon.</p>',
      },
      'should use secondary highlight': {
        text: '<strong>Hello and welcome to the real world</strong> Neo.',
        query: 'world Neo',
        options: {
          before: '<span>',
          beforeSecond: '<span class=secondary>',
          after: '</span>',
        },
        expected: '<strong>Hello and welcome to the real <span>world</span></strong><span class=secondary> Neo</span>.',
      },
      'should skip markup with non-textual content': {
        text: '<style>abbr { font-size:2em; }</style> <p>This font</p>',
        query: 'font',
        expected: '<style>abbr { font-size:2em; }</style> <p>This *font*</p>',
      },
      'should not fail on block markup': {
        text: 'Hello and welcome to the real world <div>Neo</div> and Trinity.',
        query: 'world Neo Trinity',
        expected: 'Hello and welcome to the real *world *<div>*Neo*</div> and *Trinity*.',
      },

      // TODO
      // 'should not fail on sentences ending with stop words': {
      //   text: 'I <p>write unicorns this</p> sentence makes no sense.',
      //   query: 'unicorns sentence',
      //   expected: 'I <p>write *unicorns this*</p> *sentence* makes no sense.',
      // }
    };
    generateIts(its, generateHtmlIt);

    it('should fail on invalid markup', function() {
      try {
        documentHighlight.html("<hello world", "world");
      } catch(e) {
        return;
      }

      throw new Error("Invalid markup should not be parsed");
    });

    describe('in edge cases with existing markup', function() {
      // [---] is the highlight query,
      // (---) the existing markup
      var its = {
        '---(--[--------]--)----': {
          text: '<strong>Eat drink and be merry</strong> for tomorrow we die',
          query: 'drink',
          expected: '<strong>Eat *drink* and be merry</strong> for tomorrow we die',
        },
        '------[-(----)-]-------': {
          text: 'Eat <strong>drink</strong> and be merry for tomorrow we die',
          query: 'Eat drink and be merry',
          expected: '*Eat <strong>drink</strong> and be merry* for tomorrow we die',
        },
        '------[(------)]-------': {
          text: 'Eat <strong>drink</strong> and be merry for tomorrow we die',
          query: 'drink',
          expected: 'Eat *<strong>drink</strong>* and be merry for tomorrow we die',
        },
        '--(---[---)----]-------': {
          text: '<strong>Eat drink and be merry</strong> for tomorrow we die',
          query: 'merry for tomorrow',
          expected: '<strong>Eat drink and be *merry*</strong>* for tomorrow* we die',
        },
        '------[----(---]---)---': {
          text: 'Eat <strong>drink and be merry</strong> for tomorrow we die',
          query: 'Eat drink',
          expected: '*Eat *<strong>*drink* and be merry</strong> for tomorrow we die',
        },
        '------[(---)---]-------': {
          text: '<strong>Eat drink</strong> and be merry for tomorrow we die',
          query: 'Eat drink and be merry',
          expected: '*<strong>Eat drink</strong> and be merry* for tomorrow we die',
        },
        '------[---(---)]-------': {
          text: 'Eat drink <strong>and be merry</strong> for tomorrow we die',
          query: 'Eat drink and be merry',
          expected: '*Eat drink <strong>and be merry</strong>* for tomorrow we die',
        },
        '--(--)[--------]-------': {
          text: '<strong>Eat</strong> drink and be merry for tomorrow we die',
          query: 'drink and be merry',
          expected: '<strong>Eat</strong> *drink and be merry* for tomorrow we die',
        },
        '------[--------](-----)': {
          text: 'Eat drink <strong>and be merry</strong> for tomorrow we die',
          query: 'for tomorrow we die',
          expected: 'Eat drink <strong>and be merry</strong> *for tomorrow we die*',
        },
      };
      generateIts(its, generateHtmlIt);
    });
  });
});

describe('Strict mode', function() {
  describe('with text content', function() {

  });

  describe('with HTML content', function() {

  });
});
