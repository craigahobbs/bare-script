The "url.bare" include library percent-encodes and decodes URLs and URL components, and encodes and
decodes query strings. Query string encoding recurses objects and arrays, expressing each member
key in fully-qualified form:

```bare-script
include <url.bare>

queryString = urlEncodeQueryString({'name': 'Alice', 'scores': [90, 85]})
# name=Alice&scores.0=90&scores.1=85
```
