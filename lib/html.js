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
  var globalDelta = 0;

  console.log("INDEXES", ret.indexes);
  // Build real indexes, according to our mapping
  ret.indexes.forEach(function(index) {
    // Map text-index to HTML-index
    var delta = 0;
    for(var i = 0; i < mappings.length; i += 1) {
      var mapping = mappings[i];
      if(index.startIndex < mapping.t) {
        break;
      }
      
      delta += mapping.l;
    }
    console.log("UPDATED INDEXES", delta);

    // Update HTML with mapping
    html = html.substr(0, index.startIndex + delta) + options.before + index.content + options.after + html.substr(index.endIndex + delta);
    globalDelta += delta;
  });
  
  return html;
};
