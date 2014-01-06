Content aware document Highlighter
=======================
![Build Status](https://travis-ci.org/Neamar/document-highlighter.png)
![Coverage Status](https://coveralls.io/repos/Neamar/document-highlighter/badge.png?branch=master)

Add highlight to a raw / HTML document for the specified query. Handle unicode, stop-words and punctuation.
Generate HTML-compliant highlights, even for complex markup.

The following text :

> The index analysis module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query strings. It maps to the Lucene Analyzer.

When highlighted for the query `The index analysis string` will become:

> **The index analysis** module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query **strings**. It maps to the Lucene Analyzer.

This also works for HTML documents, e.g. :

> This document contains _italics_ and stuff.

When highlighted for the query `it contains some italic empty` will become:
> This document **contains _italics_** and stuff.

## Usage
### Highlight text documents
```javascript
var highlighter = require('./lib/');

var hl = highlighter.text(
    'In JavaScript, you can define a callback handler in regex string replace operations',
    'callback handler in operations'
);

console.log(hl.text);
// In JavaScript, you can define a <strong>callback handler in</strong> regex string replace <strong>operations</strong>
```

### Highlight html documents
```javascript
var hl = highlighter.html(
    '<em>Eat drink and be merry</em> for tomorrow we die',
    'merry for tomorrow'
);

console.log(hl);
// <em>Eat drink and be <strong>merry</strong></em><strong class="secondary"> for tomorrow</strong> we die
```
