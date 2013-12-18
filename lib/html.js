'use strict';

var highlightText = require('./text.js');

module.exports = function highlightHtml(html, query, options) {
  // Generate HTML mapping
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
    mappings.push({t: text.length, h: endIndex, l: endIndex - startIndex + 1});
    i = endIndex + 1;
  }

  // Highlight raw text
  var ret = highlightText(text, query, options);


  /**
   * Maps text indexes to html indexes, according to our mapping
   */
  var getMapping = function(textStartIndex, textEndIndex) {
    var htmlStartIndex = textStartIndex;
    var htmlEndIndex = textEndIndex;

    for(var i = 0; i < mappings.length; i += 1) {
      var mapping = mappings[i];

      // Stop mapping when going too far
      if(textEndIndex < mapping.t) {
        break;
      }

      if(mapping.t < textStartIndex) {
        htmlStartIndex += mapping.l;
      }
      htmlEndIndex += mapping.l;
    }

    return {
      start: htmlStartIndex,
      end: htmlEndIndex
    };
  };

  // Rebuild highlight in HTML, using index informations
  var globalIndexDelta = 0; // Store a "global delta", which is the length of all our options.before and options.after we added to the text (they affect the mapping).
  ret.indexes.forEach(function(index) {
    // Map text-index to HTML-index
    var htmlIndex = getMapping(index.startIndex, index.endIndex);

    // Add indexes from previous highlights
    htmlIndex.start += globalIndexDelta;
    htmlIndex.end += globalIndexDelta;

    var before = html.substr(0, htmlIndex.start);
    var content = html.substr(htmlIndex.start, htmlIndex.end - htmlIndex.start);
    var after = html.substr(htmlIndex.end);


    // Update HTML with mapping
    html = before + options.before + content + options.after + after;
    globalIndexDelta += options.before.length + options.after.length;
  });
  
  return html;
};
