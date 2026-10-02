The "draw.bare" include library creates SVG vector drawings of shapes, paths, text, and images. The
library maintains a single **current drawing** - [drawNew](#var.vGroup='draw.bare'&drawnew) starts a
new current drawing, the other "draw" functions operate on it, and
[drawRender](#var.vGroup='draw.bare'&drawrender) renders it. Coordinates are in pixels from the
drawing's top-left corner, and shapes and text use the most recently set
[drawStyle](#var.vGroup='draw.bare'&drawstyle) and
[drawTextStyle](#var.vGroup='draw.bare'&drawtextstyle).

```bare-script
include <draw.bare>

drawNew(400, 300)
drawStyle('black', 2, 'lightblue')
drawRect(50, 50, 120, 80)
drawCircle(280, 150, 60)
drawTextStyle(20, 'black', true)
drawText('Hello, World!', 200, 260)
drawRender()
```
