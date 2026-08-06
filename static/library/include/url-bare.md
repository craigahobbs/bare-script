The "url.bare" include library provides functions for encoding and decoding URLs, URL components,
and URL query strings.

Encode an object as a query string:

```bare-script
include <url.bare>

queryString = urlEncodeQueryString({'name': 'Alice', 'scores': [90, 85]})
# name=Alice&scores.0=90&scores.1=85
```

Objects and arrays are recursed, with each member key expressed in fully-qualified form. Decode a
query string back into an object:

```bare-script
args = urlDecodeQueryString('name=Alice&scores.0=90&scores.1=85')
# {'name': 'Alice', 'scores': ['90', '85']}
```

All decoded leaf values are strings. The
[urlDecodeQueryString](#var.vGroup='url.bare'&urldecodequerystring) function returns null on
invalid input (invalid key/value pairs, out-of-order array indices, or duplicate keys) and logs
the error in [debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).

To percent-encode a URL or URL component, use the
[urlEncode](#var.vGroup='url.bare'&urlencode) and
[urlEncodeComponent](#var.vGroup='url.bare'&urlencodecomponent) functions. To decode a
percent-encoded string component, use the
[urlDecodeComponent](#var.vGroup='url.bare'&urldecodecomponent) function:

```bare-script
encoded = urlEncodeComponent('100% great')
# 100%25%20great

decoded = urlDecodeComponent('100%25%20great')
# 100% great
```
