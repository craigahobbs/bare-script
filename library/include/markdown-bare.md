The "markdown.bare" include library contains utility functions for working with Markdown text and
[Markdown models](model.html#var.vName='Markdown'). These functions are useful for escaping text,
generating header IDs, and extracting information from parsed Markdown content.

Escape special Markdown characters in a string before including it in Markdown output:

~~~ bare-script
include <markdown.bare>

title = 'Hello & "World" <Test>'
markdownPrint('# ' + markdownEscape(title))
~~~

Generate a Markdown header anchor ID from a heading string. This produces the same ID that
[markdownElements.bare](#var.vGroup='markdownElements.bare'&_top) generates for headers:

~~~ bare-script
headerId = markdownHeaderId('My Section Title')
# headerId => 'my-section-title'
~~~

Extract the title (first heading) from a parsed Markdown model:

~~~ bare-script
include <markdownParser.bare>

markdown = markdownParse('# My Page Title', '', 'Some content.')
title = markdownTitle(markdown)
# title => 'My Page Title'
~~~
