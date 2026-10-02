The "elementModel.bare" include library validates
[element models](https://github.com/craigahobbs/element-model#readme) and renders them to HTML or
SVG strings. An element model is a data structure of HTML or SVG elements - an element object, null,
or an array of these - which MarkdownUp applications render with
[elementModelRender](#var.vGroup='markdownUp.bare'&elementmodelrender).

```bare-script
include <elementModel.bare>

elements = { \
    'html': 'div', \
    'attr': {'class': 'container'}, \
    'elem': [ \
        {'html': 'h1', 'elem': {'text': 'Hello, World!'}}, \
        {'html': 'p', 'elem': {'text': 'This is a paragraph.'}} \
    ] \
}
htmlString = elementModelToString(elements)
```
