'use strict';

var highlightText = require('./text.js');
var mergeDefaultOptions = require('./options.js');

// Elements which can be nested inside our inline separators.
// Elements not in this list are implicitly "block level".
var inlineElements = ["b", "big", "i", "small", "tt,", "abbr", "acronym", "cite", "code", "dfn", "em", "kbd", "strong", "samp", "var,", "a", "bdo", "br", "img", "map", "object", "q", "span", "sub", "sup,", "button", "input", "label", "select", "textarea,"];

// Elements which must not be highlighted, no matter what, under penalty of ruining the document.
var noContentElements = ["style", "head", "script", "svg"];


// Build a data-hash for faster access (elements["strong"] === "inline", faster than elements.indexOf("strong") !== "-1")
var elements = {};
inlineElements.forEach(function(inline) {
  elements[inline] = "inline";
});
noContentElements.forEach(function(noContent) {
  elements[noContent] = "noContent";
});


module.exports = function highlightHtml(html, query, options) {

  options = mergeDefaultOptions(options);

  // ----- Generate HTML mapping
  // This array contains the list of mappings from the text representation to the HTML.
  //
  // [ { t: 0, h: 2, l: 3, c: false },
  // { t: 6, h: 12, l: 4, c: true },
  // { t: 16, h: 26, l: 4, c: true } ]
  //
  // (see below, mappings.push, for explanations on keys)

  var mappings = [];

  // Let's build the raw text representation, and keep track of the match between text-index and html-index.
  var text = '';
  var i = 0;

  while(true) {
    var startIndex = html.indexOf('<', i);
    var markupElement;

    if(startIndex === -1) {
      // We're done. Add the remainder from the html buffer and break out.
      text += html.substr(i);
      break;
    }

    // We got a new markup element
    var endIndex = html.indexOf('>', startIndex);
    if(endIndex === -1) {
      throw new Error("Invalid HTML markup.");
    }

    // Add content to text, until element starts
    text += html.substr(i, startIndex - i);

    var isClosingElement = (html[startIndex + 1] === '/');

    if(isClosingElement) {
      // 2 == "</".length
      markupElement = html.substr(startIndex + 2, endIndex - startIndex - 2);
      if(elements[markupElement] !== "inline") {
        // End of block element, add a space separator.
        // This avoids generating Something</div><div>Lol to "SomethingLol".
        text += " ";

        // TODO: this fixes the test case, but generates invalid text in one of the intermediary steps
        // Fix could have something to do with `globalIndexDelta`
        // startIndex += 1;
        // endIndex += 1;
      }
    }
    else /* !closingElement*/ {
      // 1 === "<".length;
      // TODO: take only one word (the HTML element name) and ignore the attributes
      markupElement = html.substr(startIndex + 1, endIndex - startIndex - 1);

      if(elements[markupElement] === "noContent") {
        // We need to find the closing matching markup element and remove all the content between from the generated text
        var matcher = markupElement + ">";
        endIndex = html.indexOf(markupElement + ">", endIndex) + matcher.length;
      }
    }

    // t: index in raw text
    // h: index in HTML
    // l: length of skipped HTML
    // c: is a closing item
    mappings.push({
      t: text.length,
      h: endIndex,
      l: endIndex - startIndex + 1,
      c: isClosingElement
    });

    i = endIndex + 1;
  }

  // ----- Highlight raw text
  console.log(text);
  console.log();
  var highlightedText = highlightText(text, query, options);


  /**
   * Map text indexes to html indexes, according to our `mapping` array
   * @param {Integer} Start of the string to be highlighted, in plain-text indexing
   * @param {Integer} End of the string to be highlighted, in plain-text indexing
   * @return {Array} An array of pairs (start, end) at which we should insert highlight markup in HTML indexing
   */
  var getMapping = function(textStartIndex, textEndIndex) {
    var ret = [];

    var htmlStartDelta = 0;
    var htmlEndDelta = 0;

    for(var i = 0; i < mappings.length; i += 1) {
      var mapping = mappings[i];

      // Stop end-mapping when going after endIndex
      if(textEndIndex <= mapping.t) {
        break;
      }

      // Stop start-mapping when going after startIndex
      if(mapping.t < textStartIndex) {
        htmlStartDelta += mapping.l;
      }
      else {
        // We have an element defined after the start of our highlight and before the end (e.g. <span>something *our </span> highlight*), we need to generate multiple indices (<span>something *our* </span> *highlight*)

        if(!mapping.c && mappings[i + 1] && mappings[i + 1].c && textEndIndex >= mappings[i + 1].t) {
          // Special case: the element is totally included in our highlight, so we can continue like nothing happened.
          // E.G. *Eat <strong>drink</strong> and be merry*
          i += 1;
          htmlEndDelta += mapping.l;
          mapping = mappings[i];
        }
        else {
          // Create a new mapping unless it would be empty
          if(textStartIndex + htmlStartDelta !== mapping.h - mapping.l + 1) {
            ret.push({
              start: textStartIndex + htmlStartDelta,
              end: mapping.h - mapping.l + 1
            });
          }

          // Update new startDelta
          htmlStartDelta = mapping.h - textStartIndex + 1;
        }
      }

      htmlEndDelta += mapping.l;
    }

    ret.push({
      start: textStartIndex + htmlStartDelta,
      end: textEndIndex + htmlEndDelta
    });

    return ret;
  };

  // ----- Rebuild highlight in HTML, using index informations

  /**
   * This global delta tracks the length of all our additions to
   * the text (multiple options.before and options.after were inserted).
   * We must shift the mappings by that much.
   */
  var globalIndexDelta = 0;
  highlightedText.indexes.forEach(function(index) {
    // Map text-index to HTML-index
    var htmlIndices = getMapping(index.startIndex, index.endIndex);

    for(var i = 0; i < htmlIndices.length; i +=1) {
      var htmlIndex = htmlIndices[i];
      // Add indexes from previous highlights
      htmlIndex.start += globalIndexDelta;
      htmlIndex.end += globalIndexDelta;

      var before = html.substr(0, htmlIndex.start);
      var content = html.substr(htmlIndex.start, htmlIndex.end - htmlIndex.start);
      var after = html.substr(htmlIndex.end);


      // Update HTML with mapping
      var highlightBefore = (i === 0 ? options.before : options.beforeSecond);
      html = before + highlightBefore + content + options.after + after;
      globalIndexDelta += highlightBefore.length + options.after.length;
    }
  });

  return { html: html, text: highlightedText.text };
};
