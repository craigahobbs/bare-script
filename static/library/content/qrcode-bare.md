The "qrcode.bare" include library provides functions for drawing QR codes.

To draw a QR code:

~~~ bare-script
include <qrcode.bare>

drawNew(300, 300)
qrcodeDraw('https://craigahobbs.github.io/qrcode/', 0, 0, 300)
~~~

The library supports four error correction levels: `'low'`, `'medium'`, `'quartile'`, and `'high'`.
Higher error correction levels can store less data but are more robust against damage.

See the [live QR code generator demo](https://craigahobbs.github.io/qrcode/) for an interactive example.
