The "markdownUp.bare: elementModel" section contains functions for rendering
[element models](https://github.com/craigahobbs/element-model#readme). Element models provide a
declarative way to create HTML elements and handle user interactions.

Render an element model:

~~~ bare-script
element = { \
    'html': 'p', \
    'elem': [ \
        {'html': 'span', 'attr': {'style': 'font-weight: bold;'}, 'elem': {'text': 'Hello'}}, \
        {'text': ' '}, \
        {'html': 'span', 'elem': {'text': 'World!'}} \
    ] \
}

elementModelRender(element)
~~~

Create elements with event handlers:

~~~ bare-script
function myAppMain():
    button = { \
        'html': 'button', \
        'elem': {'text': 'Click me'}, \
        'callback': {'click': myAppOnClick} \
    }
    elementModelRender(button)
endfunction

function myAppOnClick():
    markdownPrint('Button clicked!')
endfunction

myAppMain()
~~~

Element models support various HTML elements, attributes, styles, and event callbacks. This provides
a powerful way to create interactive user interfaces in MarkdownUp applications without writing HTML
directly.
