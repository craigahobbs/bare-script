The "base64.bare" include library encodes byte value arrays (arrays of integers 0 to 255) as base64
text and decodes base64 text back to bytes. Base64 text carries binary data through string-only
channels, such as JSON, [localStorageSet](#var.vGroup='markdownUp.bare'&localstorageset), and data
URLs:

```bare-script
include <base64.bare>

dataURL = 'data:application/octet-stream;base64,' + base64Encode(bytes)
```
