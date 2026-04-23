The "elementModel.bare" include library contains functions for validating and rendering
[element models](https://github.com/craigahobbs/element-model#readme)
to HTML or SVG strings. Element models are data structures representing HTML or SVG elements, useful
for building user interfaces in a programmatic way.

Consider the following example of creating a simple HTML element model and rendering it to a string.
First, include the "elementModel.bare" library and define an element model for a div containing a
heading and a paragraph.

~~~ bare-script
include <elementModel.bare>

elements = elementModelValidate({ \
    'html': 'div', \
    'attr': {'id': 'myDiv', 'class': 'container'}, \
    'elem': [ \
        {'html': 'h1', 'elem': {'text': 'Hello, World!'}}, \
        {'html': 'p', 'elem': {'text': 'This is a paragraph.'}} \
    ] \
})
~~~

Then, render the element model to an HTML string using the `elementModelToString` function:

~~~ bare-script
htmlString = elementModelToString(elements)
~~~

For SVG elements, set the tag to 'svg' instead of 'html'. The `elementModelToString` function will
automatically add the necessary xmlns attribute for SVG.

~~~ bare-script
elements = elementModelValidate({ \
    'svg': 'svg', \
    'attr': {'width': '100', 'height': '100'}, \
    'elem': { \
        'svg': 'circle', \
        'attr': {'cx': '50', 'cy': '50', 'r': '40', 'fill': 'blue'} \
    } \
})
svgString = elementModelToString(elements)
~~~

Element models support nested arrays of elements, text nodes, attributes, and optional callback
functions for event handling (though callbacks are ignored during stringification).
