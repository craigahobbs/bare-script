The "wsgiAPIDoc.bare" include library is the API documentation
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme) application for
[wsgi.bare](#var.vGroup='wsgi.bare'&_top) applications. A `wsgiCreateAPIApplication` application with
the "doc" option hosts it at "/doc/", with a page that runs:

```bare-script
include <wsgiAPIDoc.bare>

wsgiAPIDocMain()
```
