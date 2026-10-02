Create a regular expression with [regexNew](#var.vGroup='regex'&regexnew), then use it with the
match, replace, and split functions. Patterns use the
[JavaScript regular expression syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern).
A backslash in a string literal must be escaped, so the pattern `\d+` is written `'\\d+'`. To
match literal text, escape it with [regexEscape](#var.vGroup='regex'&regexescape).

```bare-script
match = regexMatch(regexNew('\\$([0-9]+)'), 'Price: $10')
amount = objectGet(objectGet(match, 'groups'), '1')
# amount is '10'
```
