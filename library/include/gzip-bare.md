The "gzip.bare" include library compresses and uncompresses byte value arrays (arrays of integers 0
to 255) in the standard gzip format, which any gzip tool can read. The compressor and uncompressor
are written in BareScript.

```bare-script
include <gzip.bare>

compressed = gzipCompress('hello hello hello')
text = stringDecode(gzipUncompress(compressed))
# text is 'hello hello hello'
```
