The "markdownUp.bare: document" section contains functions for interacting with the document and
browser DOM. These functions allow you to manipulate the document title, get input values, set
focus, and handle keyboard events.

Set the document title:

~~~ bare-script
documentSetTitle('My Application')
~~~

Get the value of an input element:

~~~ bare-script
value = documentInputValue('myInput')
~~~

Set focus to an element:

~~~ bare-script
documentSetFocus('myInput')
~~~

Set a keyboard event handler:

~~~ bare-script
function myAppMain():
    markdownPrint('Press any key...')
    documentSetKeyDown(myAppOnKeyDown)
endfunction

function myAppOnKeyDown(event):
    key = objectGet(event, 'key')
    markdownPrint('You pressed: ' + key)
endfunction

myAppMain()
~~~

Get the document font size:

~~~ bare-script
fontSize = documentFontSize()
~~~

Get the document-relative URL:

~~~ bare-script
url = documentURL('path/to/resource')
~~~

Set the document reset element (the element to focus when the page resets):

~~~ bare-script
documentSetReset('myResetID')
~~~
