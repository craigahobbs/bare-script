The "pager.bare" include library is a simple, configurable, paged MarkdownUp application. The pager
renders a menu of links to your pages and navigation links (start, next, previous). It supports
three page types: function pages, Markdown pages, and external links.

Run the pager by defining a [pager model] and calling the [pagerMain] function. Its options hide the
menu or navigation links, set the start page, and add your own URL arguments.

```bare-script
include <pager.bare>

function funcPage(args):
    markdownPrint('This is page "' + objectGet(args, 'page') + '"')
endfunction

pagerModel = { \
    'pages': [ \
        {'name': 'Function Page', 'type': {'function': {'function': funcPage, 'title': 'The Function Page'}}}, \
        {'name': 'Markdown Page', 'type': {'markdown': {'url': 'README.md'}}}, \
        {'name': 'Link Page', 'type': {'link': {'url': 'external.html'}}} \
    ] \
}
pagerMain(pagerModel)
```


[pager model]: model.html#var.vName='Pager'
[pagerMain]: #var.vGroup='pager.bare'&pagermain
