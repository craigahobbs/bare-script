The "markdownParser.bare" include library provides functions for parsing Markdown text.

To parse a Markdown string into a [Markdown model](model.html#var.vName='Markdown'):

~~~ bare-script
include <markdownParser.bare>

markdown = markdownParse('# Hello, World!', '', 'This is a paragraph.')
~~~

You can pass multiple strings or arrays of strings — they are joined as lines of Markdown text:

~~~ bare-script
lines = ['## Section', '', '- Item 1', '- Item 2']
markdown = markdownParse(lines)
~~~

The parsed model can be rendered using the
[markdownElements](#var.vGroup='markdownElements.bare'&markdownelements) function:

~~~ bare-script
include <markdownElements.bare>

elements = markdownElements(markdown)
elementModelRender(elements)
~~~

To determine the title of a parsed [Markdown model](model.html#var.vName='Markdown'), use the
[markdownTitle](#var.vGroup='markdown.bare'&markdowntitle) function:

~~~ bare-script
include <markdown.bare>

title = markdownTitle(markdown)
~~~
