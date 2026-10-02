The "forms.bare" include library creates
[element models](https://github.com/craigahobbs/element-model#readme) for common form controls -
text inputs, links, and link buttons - for MarkdownUp applications to render with
[elementModelRender](#var.vGroup='markdownUp.bare'&elementmodelrender). A control's event handler is
called when the user acts on it:

```bare-script
include <forms.bare>

function myAppMain():
    elementModelRender(formsTextElements('myInput', 'Initial text', 20, myAppOnEnter))
endfunction

function myAppOnEnter():
    markdownPrint('You entered: ' + documentInputValue('myInput'))
endfunction

myAppMain()
```
