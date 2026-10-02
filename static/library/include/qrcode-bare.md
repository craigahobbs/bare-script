The "qrcode.bare" include library draws QR codes with the
[draw.bare](#var.vGroup='draw.bare'&_top) include library. See the
[live QR code generator demo](https://craigahobbs.github.io/qrcode/) for an interactive example.

```bare-script
include <draw.bare>
include <qrcode.bare>

drawNew(300, 300)
qrcodeDraw('https://craigahobbs.github.io/qrcode/', 0, 0, 300)
drawRender()
```
