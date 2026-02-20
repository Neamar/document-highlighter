'use strict';
require('should');

var documentHighlight = require('../lib');

describe('Turkish Language Support', function() {
  describe('Unicode normalization', function() {
    it('should match ı with i', function() {
      var ret = documentHighlight.text('Isparta şehrinde', 'isparta', {language: 'tr'});
      ret.text.should.include('<strong>');
    });

    it('should match ö with o', function() {
      var ret = documentHighlight.text('Öğrenci çalışıyor', 'ogrenci', {language: 'tr'});
      ret.text.should.eql('<strong>Öğrenci</strong> çalışıyor');
    });

    it('should match ü with u', function() {
      var ret = documentHighlight.text('Ütü masası', 'utu', {language: 'tr'});
      ret.text.should.eql('<strong>Ütü</strong> masası');
    });

    it('should match ğ with g', function() {
      var ret = documentHighlight.text('Dağcılık sporu', 'dagcilik', {language: 'tr'});
      ret.text.should.eql('<strong>Dağcılık</strong> sporu');
    });

    it('should match ç with c', function() {
      var ret = documentHighlight.text('Çocuklar oynuyor', 'cocuk', {language: 'tr'});
      ret.text.should.eql('<strong>Çocuklar</strong> oynuyor');
    });

    it('should match ş with s', function() {
      var ret = documentHighlight.text('Şehir merkezi', 'sehir', {language: 'tr'});
      ret.text.should.eql('<strong>Şehir</strong> merkezi');
    });
  });

  describe('Turkish stopwords', function() {
    it('should handle "ve" as stopword', function() {
      var ret = documentHighlight.text('Kitap ve kalem', 'kitap kalem', {language: 'tr'});
      ret.text.should.eql('<strong>Kitap ve kalem</strong>');
    });

    it('should handle "için" as stopword', function() {
      var ret = documentHighlight.text('Okul için kitap', 'okul kitap', {language: 'tr'});
      ret.text.should.eql('<strong>Okul için kitap</strong>');
    });

    it('should handle "ile" as stopword', function() {
      var ret = documentHighlight.text('Arkadaş ile sohbet', 'arkadas sohbet', {language: 'tr'});
      ret.text.should.eql('<strong>Arkadaş ile sohbet</strong>');
    });

    it('should handle "da/de" as stopword', function() {
      var ret = documentHighlight.text('İstanbulda yaşamak güzel', 'istanbul yasamak guzel', {language: 'tr'});
      ret.text.should.eql('<strong>İstanbulda yaşamak güzel</strong>');
    });
  });

  describe('Case insensitivity', function() {
    it('should match uppercase İ with lowercase i', function() {
      var ret = documentHighlight.text('İSTANBUL güzel', 'istanbul', {language: 'tr'});
      ret.text.should.eql('<strong>İSTANBUL</strong> güzel');
    });

    it('should match mixed case text', function() {
      var ret = documentHighlight.text('ÇALIŞKAN öğrenciler', 'caliskan ogrenci', {language: 'tr'});
      ret.text.should.eql('<strong>ÇALIŞKAN öğrenciler</strong>');
    });
  });

  describe('HTML content with Turkish characters', function() {
    it('should preserve HTML tags', function() {
      var ret = documentHighlight.html('<p>Güzel <strong>şehir</strong></p>', 'guzel sehir', {language: 'tr'});
      ret.html.should.include('<strong>');
      ret.html.should.include('</strong>');
    });

    it('should handle complex HTML', function() {
      var ret = documentHighlight.html(
        '<div>Türkiye\'de <em>öğrenci</em> olmak</div>',
        'turkiye ogrenci',
        {language: 'tr'}
      );
      ret.html.should.include('<strong>Türkiye</strong>');
      ret.html.should.include('<strong><em>öğrenci</em></strong>');
    });
  });

  describe('Real world Turkish examples', function() {
    it('should highlight news headline', function() {
      var text = 'Cumhurbaşkanı Ankara\'da toplantı düzenledi';
      var query = 'cumhurbaskani ankara toplanti';
      var ret = documentHighlight.text(text, query, {language: 'tr'});
      ret.indices.length.should.be.above(0);
    });

    it('should highlight product description', function() {
      var text = 'Yüksek kaliteli ürünler için tıklayın';
      var query = 'yuksek kalite urun';
      var ret = documentHighlight.text(text, query, {language: 'tr'});
      ret.text.should.include('<strong>');
    });

    it('should handle longer text', function() {
      var text = 'Türkiye\'nin en güzel şehirlerinden biri olan İstanbul, tarihi ve kültürel zenginlikleriyle ünlüdür';
      var query = 'turkiye guzel istanbul tarihi kultur';
      var ret = documentHighlight.text(text, query, {language: 'tr'});
      ret.indices.length.should.be.above(2);
    });
  });

  describe('Custom highlight options', function() {
    it('should use custom before/after tags', function() {
      var ret = documentHighlight.text(
        'Merhaba dünya',
        'merhaba dunya',
        {
          language: 'tr',
          before: '<mark>',
          after: '</mark>'
        }
      );
      ret.text.should.eql('<mark>Merhaba dünya</mark>');
    });

    it('should use custom CSS classes', function() {
      var ret = documentHighlight.html(
        'Güzel <span>şehir</span>',
        'guzel sehir',
        {
          language: 'tr',
          before: '<span class="hl">',
          after: '</span>'
        }
      );
      ret.html.should.include('class="hl"');
    });
  });
});
