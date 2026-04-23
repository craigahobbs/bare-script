The "draw.bare" include library contains functions for creating vector graphics drawings. These
functions provide a programmatic way to draw shapes, lines, text, and images using SVG.

Create a new drawing and draw basic shapes:

~~~ bare-script
include <draw.bare>

# Create a new drawing and fill the background
drawNew(400, 300)
drawStyle('none', 0, 'white')
drawRect(0, 0, drawWidth(), drawHeight())

# Draw a rectangle, circle, and ellipse
drawStyle('black', 2, 'blue')
drawRect(0.1 * drawWidth(), 0.1 * drawHeight(), 0.2 * drawWidth(), 0.2 * drawHeight())
drawStyle('black', 2, 'red')
drawCircle(0.3 * drawWidth(), 0.6 * drawHeight(), 0.1 * drawWidth())
drawStyle('black', 2, 'green')
drawEllipse(0.7 * drawWidth(), 0.4 * drawHeight(), 0.2 * drawWidth(), 0.1 * drawHeight())

# Render the drawing
drawRender()
~~~

Draw paths with lines and curves:

~~~ bare-script
drawStyle('black', 4, '#cc222280')
drawMove(0.7 * drawWidth(), 0.7 * drawHeight())
drawLine(0.9 * drawWidth(), 0.7 * drawHeight())
drawLine(0.9 * drawWidth(), 0.9 * drawHeight())
drawClose()
~~~

Draw text:

~~~ bare-script
drawTextStyle(0.1 * drawHeight(), 'black', true)
drawText('Hello, World!', 0.5 * drawWidth(), 0.5 * drawHeight())
~~~

Draw images:

~~~ bare-script
drawImage(0.5 * drawWidth(), 0.5 * drawHeight(), 0.2 * drawHeight(), 0.2 * drawHeight(), 'image.png')
~~~

Add click handlers to drawing objects:

~~~ bare-script
function myClickHandler():
    systemLog('Click!')
endfunction

drawStyle('black', 2, 'gray')
drawRect(0.1 * drawWidth(), 0.1 * drawHeight(), 0.1 * drawWidth(), 0.1 * drawHeight())
drawOnClick(myClickHandler)
~~~
