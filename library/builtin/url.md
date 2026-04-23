URL functions provide operations for encoding URLs and URL components. These functions ensure that
special characters in URLs are properly escaped for use in web requests and links.

Encode a complete URL:

~~~ bare-script
url = 'path?param=value with spaces'
encoded = urlEncode(url)
~~~

Encode a URL component (query parameter, path segment, etc.):

~~~ bare-script
# Build a URL with encoded parameters
baseUrl = 'search'
query = urlEncodeComponent('term with spaces')
fullUrl = baseUrl + '?q=' + query
~~~
