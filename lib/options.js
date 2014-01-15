'use strict';


/**
 * Merge options with default options
 */
module.exports = function(options) {
  if(!options) {
    options = {};
  }

  options.beforeSecond = options.beforeSecond || options.before || module.exports.defaultOptions.beforeSecond || module.exports.defaultOptions.before;
  options.before = options.before || module.exports.defaultOptions.before;
  options.after = options.after || module.exports.defaultOptions.after;
  options.language = options.language ? options.language.replace(/[^a-z]/g, '') : module.exports.defaultOptions.language;

  return options;
};

module.exports.defaultOptions = {
  before: '<strong>',
  after: '</strong>',
  beforeSecond: '<strong class="secondary">',
  language: 'en'
};
