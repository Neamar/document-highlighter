'use strict';

var highlightText = require('./text.js');
var mergeDefaultOptions = require('./options.js');

/**
 * Elements which can be nested inside our inline separators.
 * Elements not in this list are implicitly "block level".
 */
var inlineElements = ["b", "big", "i", "small", "tt,", "abbr", "acronym", "cite", "code", "dfn", "em", "kbd", "strong", "samp", "var,", "a", "bdo", "br", "img", "map", "object", "q", "span", "sub", "sup,", "button", "input", "label", "select", "textarea,"];
/**
 * Elements which are inline, but after which we'd still like to insert a space.
 * We don't want to convert "lol<br>wut" to "lolwut" but to "lol wut".
 */
var spaceNeededElements = ["br", "sup", "sub", "img"];

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
var isSpaceNeeded = {};
spaceNeededElements.forEach(function(element) {
  isSpaceNeeded[element] = true;
});


module.exports = function highlightHtml(html, query, options) {

  options = mergeDefaultOptions(options);

  // ----- Generate HTML mapping
  // This array contains the list of mappings from the text representation to the HTML.
  //
  // [ { t: 0, h: 2, l: 3, c: false, s: 0, b: false },
  // { t: 6, h: 12, l: 4, c: true, s: 0, b: false },
  // { t: 16, h: 26, l: 4, c: true, s: 1, b: true } ]
  //
  // (see below, mappings.push, for explanations on keys)
  // (keys are very short for memory benefits, probably)

  var mappings = [];

  // Let's build the raw text representation, and keep track of the match between text-index and html-index.
  var text = '';
  var i = 0;

  while(true) {
    var startIndex = html.indexOf('<', i);
    var markupElement;
    var shift = 0;
    var isBlock;

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
      isBlock = (elements[markupElement] !== "inline");
    }
    else /* !closingElement*/ {
      // 1 === "<".length;
      markupElement = html.substr(startIndex + 1, endIndex - startIndex - 1);
      // Skip any attributes or self-closing '/>'
      var matches = markupElement.match(/([a-z-])+/gi);

      if(matches && matches[0]) {
        markupElement = matches[0];
      }
      else {
        markupElement = "unknown-tag";
      }

      isBlock = (elements[markupElement] !== "inline");

      if(elements[markupElement] === "noContent") {
        // We need to find the closing matching markup element and remove all the content between from the generated text
        var matcher = markupElement + ">";
        var matchingClosing = html.indexOf(markupElement + ">", endIndex);

        // We can't find a closing item? Sadly, we can't do much.
        if(matchingClosing !== -1) {
          endIndex = matchingClosing + matcher.length;
        }
      }
    }

    // At the end of a block element (and some inline elements as well),
    // add a space separator.
    // This avoids generating Something</div><div>Lol to "SomethingLol".
    if((isBlock && isClosingElement) || isSpaceNeeded[markupElement]) {
      if(text.length > 1 && text[text.length - 1] !== ' ') {
        text += " ";
        shift += 1;
      }
      else if(text.length > 1) {
        if(mappings[mappings.length - 1].s && mappings[mappings.length - 1].t === text.length) {
          // Okay, special case (again).
          // If we have 2 consecutive spaceNeeded elements (e.g. <br></div>)
          // We remove the mapping created earlier (the <br> one) to merge it with the following.
          // This avoid setting the shift property to true on the first one but not on the second one, leading to unexpected getMapping() bug.
          var uselessMapping = mappings.pop();
          startIndex -= uselessMapping.l;
          shift += 1;
        }
      }
    }

    // t: insert index in raw text
    // h: tag end index in HTML
    // l: length of skipped HTML
    // c: is a closing tag
    // s: amount by which HTML is displaced with respect to text
    // b: whether or not this element is block-level
    mappings.push({
      t: text.length,
      h: endIndex + shift,
      l: endIndex - startIndex + 1,
      c: isClosingElement,
      s: shift,
      b: isBlock
    });

    i = endIndex + 1;
  }

  // ----- Highlight raw text
  var highlightedText = highlightText(text, query, options);

  /**
   * Map text indices to html indices, according to our `mapping` array
   * @param {Integer} Start of the string to be highlighted, in plain-text indexing
   * @param {Integer} End of the string to be highlighted, in plain-text indexing
   * @return {Array} An array of pairs (start, end) at which we should insert our highlight markup, in HTML indexing
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

        if(!mapping.c && mappings[i + 1] && mappings[i + 1].c && textEndIndex >= mappings[i + 1].t && !mapping.b) {
          // Special case: the element is totally included in our highlight, so we can continue like nothing happened.
          // E.g. *Eat <strong>drink</strong> and be merry*
          i += 1;
          htmlEndDelta += mapping.l;
          mapping = mappings[i];
        }
        else {
          // Create a new mapping unless it would be empty
          // It starts at the beginning of the highlight
          // and ends right before the start of the tag
          var subMappingStart = textStartIndex + htmlStartDelta;
          var subMappingEnd =  mapping.h - (mapping.l + mapping.s) + 1;
          if(subMappingEnd - subMappingStart > 0) {
            ret.push({
              start: subMappingStart,
              end: subMappingEnd
            });
          }

          // Update new startDelta
          htmlStartDelta = mapping.h - textStartIndex + 1;
        }
      }

      htmlStartDelta -= mapping.s;
      htmlEndDelta += mapping.l - mapping.s;
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
  highlightedText.indices.forEach(function(index) {
    // Map text-index to HTML-index
    var htmlIndices = getMapping(index.startIndex, index.endIndex);

    for(var i = 0; i < htmlIndices.length; i += 1) {
      var htmlIndex = htmlIndices[i];

      // Add indices from previous highlights
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

  return {
    html: html,
    text: highlightedText.text.trim()
  };
};
