The "markdownElements.bare" include library provides functions for converting a parsed
[Markdown model](model.html#var.vName='Markdown') into an
[element model](https://github.com/craigahobbs/element-model#readme) for rendering.

To render Markdown content as HTML elements, first parse the Markdown text with
[markdownParse](#var.vGroup='markdownParser.bare'&markdownparse), then generate the element model:

~~~ bare-script
include <markdownParser.bare>
include <markdownElements.bare>

markdown = markdownParse('# Hello, World!', '', 'This is a paragraph with **bold** text.')
elements = markdownElements(markdown)
elementModelRender(elements)
~~~

For applications that include asynchronous code block renderers, use the
[markdownElementsAsync](#var.vGroup='markdownElements.bare'&markdownelementsasync) function instead.
