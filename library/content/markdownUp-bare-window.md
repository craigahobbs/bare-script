The "markdownUp.bare: window" section contains functions for interacting with the browser window and
its environment.

Get window dimensions:

~~~ bare-script
width = windowWidth()
height = windowHeight()
markdownPrint('Window size: ' + width + ' x ' + height)
~~~

Navigate to a URL:

~~~ bare-script
windowSetLocation('other.html')
~~~

Set a window resize event handler:

~~~ bare-script
function myAppMain():
    myAppRender()
    windowSetResize(myAppOnResize)
endfunction

function myAppRender():
    markdownPrint('Window: ' + windowWidth() + ' x ' + windowHeight())
endfunction

function myAppOnResize():
    myAppRender()
endfunction

myAppMain()
~~~

Set a timeout event handler:

~~~ bare-script
function myAppMain():
    markdownPrint('Starting timer...')
    windowSetTimeout(myAppOnTimeout, 3000)
endfunction

function myAppOnTimeout():
    markdownPrint('Timer fired after 3 seconds!')
endfunction

myAppMain()
~~~

Read from the clipboard:

~~~ bare-script
async function myAppReadClipboard():
    text = windowClipboardRead()
    markdownPrint('Clipboard contains: ' + text)
endfunction
~~~

Write to the clipboard:

~~~ bare-script
async function myAppWriteClipboard():
    windowClipboardWrite('Hello, clipboard!')
endfunction
~~~
