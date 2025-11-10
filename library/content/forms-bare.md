The "forms.bare" include library provides functions for creating form elements using
[element models](https://github.com/craigahobbs/element-model#readme). These functions simplify the
creation of common form controls for MarkdownUp applications.

Create a text input element:

~~~ bare-script
include <forms.bare>

function myAppMain():
    textInput = formsTextElements('myInput', 'Initial text', 20, myAppOnEnter)
    elementModelRender(textInput)
endfunction

function myAppOnEnter():
    value = documentInputValue('myInput')
    markdownPrint('You entered: ' + value)
endfunction

myAppMain()
~~~

Create a link element:

~~~ bare-script
link = formsLinkElements('Click me', 'other.html')
elementModelRender(link)
~~~

Create a link button element with a click handler:

~~~ bare-script
function myAppMain():
    button = formsLinkButtonElements('Click me', myAppOnClick)
    elementModelRender(button)
endfunction

function myAppOnClick():
    markdownPrint('Button clicked!')
endfunction

myAppMain()
~~~

These helper functions create properly structured element models that can be rendered with the
[elementModelRender](#var.vGroup='markdownUp.bare%3A%20elementModel'&elementmodelrender) function.
