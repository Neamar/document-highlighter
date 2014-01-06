'use strict';


/**
 * Merge options with default options
 */
module.exports = function(options) {
  if(!options) {
    options = {};
  }
  options.beforeSecond = options.beforeSecond || options.before || '<strong class="secondary">';
  options.before = options.before || "<strong>";
  options.after = options.after || "</strong>";
  options.language = options.language ? options.language.replace(/[^a-z]/g, '') : "en";

  return options;
};
