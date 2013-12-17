'use strict';

var highlightText = require('./text.js');

module.exports = function highlightHtml(html, query, options) {
  // Generate HTML mapping
  var mappings = [];
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

  var ret = highlightText(text, query, options);

  // Return html indexes, according to our mapping
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

  ret.indexes.forEach(function(index) {
    // Map text-index to HTML-index
    var htmlIndexes = getMapping(index.startIndex, index.endIndex);

    var before = html.substr(0, htmlIndexes.start);
    var content = html.substr(htmlIndexes.start, htmlIndexes.end - htmlIndexes.start);
    var after = html.substr(htmlIndexes.end);


    // Update HTML with mapping
    html = before + options.before + content + options.after + after;
  });
  
  return html;
};
