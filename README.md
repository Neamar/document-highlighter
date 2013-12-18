Content aware document Highlighter
=======================
![Build Status](https://travis-ci.org/Neamar/document-highlighter.png)
![Coverage Status](https://coveralls.io/repos/Neamar/document-highlighter/badge.png?branch=master)

Add highlight to a raw / HTML document for the specified query.

The following text :

> The index analysis module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query strings. It maps to the Lucene Analyzer.

When highlighted for the query `The index analysis string` will become:

> **The index analysis** module acts as a configurable registry of Analyzers that can be used in order to both break indexed (analyzed) fields when a document is indexed and process query **strings**. It maps to the Lucene Analyzer.

This also works for HTML documents, e.g. :

> This document contains _italics_ and stuff.

When highlighted for the query `it contains some italic empty` will become:
> This document **contains _italics_** and stuff.

Stopwords are not analyzed nor highlighted.
