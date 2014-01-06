var highlighter = require('./lib/');

var hl = highlighter.text(
    'In JavaScript, you can define a callback handler in regex string replace operations',
    'callback handler in operations'
);

console.log(hl.text);
// In JavaScript, you can define a <strong>callback handler in</strong> regex string replace <strong>operations</strong>




var hl = highlighter.html(
    '<em>Eat drink and be merry</em> for tomorrow we die',
    'merry for tomorrow'
);

console.log(hl.html);
// <em>Eat drink and be <strong>merry</strong></em><strong class="secondary"> for tomorrow</strong> we die
