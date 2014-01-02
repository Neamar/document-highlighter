'use strict';

var highlightText = require('./text.js');
var mergeDefaultOptions = require('./options.js');


module.exports = function highlightHtml(html, query, options) {
  options = mergeDefaultOptions(options);

  // Generate HTML mapping
  // This array contains the list of mappings from the text representation to the HTML.
  var mappings = [];

  // Let's build the raw text representation, and keep track of the match between text-index and html-index.
  var text = '';
  var i = 0;
  while(true) {
    var startIndex = html.indexOf('<', i);
    if(startIndex === -1) {
      text += html.substr(i);
      break;
    }

    // We got a new markup element
    var endIndex = html.indexOf('>', startIndex);
    if(endIndex === -1) {
      throw new Error("Invalid HTML markup.");
    }

    text += html.substr(i, startIndex - i);

    var isClosingElement = (html[startIndex + 1] === '/')
    // t: index in text
    // h: index in HTML
    // l: length of skipped HTML
    // c: is a closing item
    mappings.push({t: text.length, h: endIndex, l: endIndex - startIndex + 1, c: isClosingElement});
    i = endIndex + 1;
  }

  // Highlight raw text
  var ret = highlightText(text, query, options);


  /**
   * Maps text indexes to html indexes, according to our mapping
   */
  var getMapping = function(textStartIndex, textEndIndex) {
    var ret = [];

    var htmlStartDelta = 0;
    var htmlEndDelta = 0;

    // Set to true when reading mappings inside textStartIndex / textEndIndex
    var readingZone = false;
    var openElementsInReadingZone = 0;

    for(var i = 0; i < mappings.length; i += 1) {
      var mapping = mappings[i];

      // Stop end-mapping when going after endindex
      if(textEndIndex < mapping.t) {
        break;
      }

      // Stop start-mapping when going after startindex
      if(mapping.t < textStartIndex) {
        htmlStartDelta += mapping.l;
      }
      else {
        readingZone = true;
        openElementsInReadingZone += mapping.c ? -1:1;

        if(openElementsInReadingZone == -1) {
          // We have an element that was opened BEFORE the start of our highlight(<span>something *our </span> highlight*), we need to generate multiple indices (<span>something *our* </span> *highlight*)
          ret.push({
            start: textStartIndex + htmlStartDelta,
            end: mapping.h - mapping.l + 1
          });

          // Update new startDelta
          htmlStartDelta = mapping.h - textStartIndex + 1;
          // Reset elements count
          openElementsInReadingZone = 0;
        }
      }

      htmlEndDelta += mapping.l;
    }

    console.log(openElementsInReadingZone);

    ret.push({
      start: textStartIndex + htmlStartDelta,
      end: textEndIndex + htmlEndDelta
    });

    return ret;
  };

  // Rebuild highlight in HTML, using index informations
  var globalIndexDelta = 0; // Store a "global delta", which is the length of all our options.before and options.after we added to the text (they affect the mapping).
  ret.indexes.forEach(function(index) {
    // Map text-index to HTML-index
    var htmlIndices = getMapping(index.startIndex, index.endIndex);
    console.log(htmlIndices);

    for(var i = 0; i < htmlIndices.length; i++) {
      var htmlIndex = htmlIndices[i];
      // Add indexes from previous highlights
      htmlIndex.start += globalIndexDelta;
      htmlIndex.end += globalIndexDelta;

      var before = html.substr(0, htmlIndex.start);
      var content = html.substr(htmlIndex.start, htmlIndex.end - htmlIndex.start);
      var after = html.substr(htmlIndex.end);


      // Update HTML with mapping
      html = before + options.before + content + options.after + after;
      globalIndexDelta += options.before.length + options.after.length;
    }
  });
  
  return html;
};
