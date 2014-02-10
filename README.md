Content aware document Highlighter
=======================
![Build Status](https://travis-ci.org/Neamar/document-highlighter.png)
![Coverage Status](https://coveralls.io/repos/Neamar/document-highlighter/badge.png?branch=master)

## What is `document highlighter`?
Add highlight to a raw / HTML document for the specified query. Handle unicode, stop-words and punctuation.
Generate HTML-compliant highlights, even for complex markup.

## Samples
### Plain text
#### Simple case
The following text :

> The index analysis module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query strings. It maps to the Lucene Analyzer.

When highlighted for the query `The index analysis string` will become:

> **The index analysis** module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query **strings**. It maps to the Lucene Analyzer.

Note generated markup is minimal (one item per match, and not one item per word)

#### Stopwords
Document highlighter handle stopwords and punctuation according to the language specified. For instance, the following text:

> Install this library, and start using it.

When highlighted for the query `install library` will become:

> **Install this library**, and start using it.

### HTML
This also works for HTML documents, e.g. :

> This document contains _italics_ and stuff.

When highlighted for the query `it contains some italic empty` will become:
> This document **contains _italics_** and stuff.

Document highlighter maintain original markup and add wrapping tags as needed.

## Usage
### Highlight text documents
```javascript
var highlighter = require('document-highlighter');

var hl = highlighter.text(
    'In JavaScript, you can define a callback handler in regex string replace operations',
    'callback handler in operations'
);

console.log(hl.text);
// "In JavaScript, you can define a <strong>callback handler in</strong> regex string replace <strong>operations</strong>"

console.log(hl.indexes);
// [
//   { startIndex: 32, endIndex: 51, content: 'callback handler in' },
//   { startIndex: 73, endIndex: 83, content: 'operations' } 
// ]
```

### Highlight html documents
```javascript
var highlighter = require('document-highlighter');

var hl = highlighter.html(
    '<em>Eat drink and be merry</em> for tomorrow we die',
    'merry for tomorrow'
);

console.log(hl.html);
// <em>Eat drink and be <strong>merry</strong></em><strong class="secondary"> for tomorrow</strong> we die

console.log(hl.text);
// Eat drink and be <strong>merry for tomorrow</strong> we die
```

### Customize highlight markup
```javascript
var highlighter = require('document-highlighter');

var hl = highlighter.text(
    'In JavaScript, you can define a callback handler in regex string replace operations',
    'callback handler in operations',
    {
        before: '<span class="hlt">',
        after: '</span>',
    }
);

console.log(hl.text);
// "In JavaScript, you can define a <span class="hlt">callback handler in</span> regex string replace <span class="hlt">operations</span>"
```

> Note: in HTML mode, your highlight may be split up in multiple items in order to keep your existing markup. The default is to add a `.secondary` class; but you can override this using the `beforeSecond` key in the option.

In some case, you may want to customize highlighting for all calls to the highlighter. You can use `defaultOptions` parameter. Be careful however, you cannot override this with a new object; you need to update the keys one by one.

```javascript
var highlighter = require('document-highlighter');
highlighter.defaultOptions.before = '<span class="hlt">';
highlighter.defaultOptions.after = '</span>';

var hl = highlighter.text(
    'In JavaScript, you can define a callback handler in regex string replace operations',
    'callback handler in operations'
);

console.log(hl.text);
// "In JavaScript, you can define a <span class="hlt">callback handler in</span> regex string replace <span class="hlt">operations</span>"
```
