The "gzip.bare" include library provides functions for compressing and uncompressing byte value
arrays with the gzip format. A byte value array is an ordinary array of integers 0 to 255, the same
representation the [stringEncode](#var.vGroup='string'&stringencode) and
[stringDecode](#var.vGroup='string'&stringdecode) functions use.

To compress bytes (or a string, as UTF-8):

```bare-script
include <gzip.bare>

compressed = gzipCompress(stringEncode('hello hello hello'))
compressed = gzipCompress('hello hello hello')
```

The optional second argument is the compression level, 0 (store only) through 9 (the most
thorough match search); the default is 6. To uncompress gzip data:

```bare-script
bytes = gzipUncompress(compressed)
text = stringDecode(bytes)
# hello hello hello
```

The [gzipUncompress](#var.vGroup='gzip.bare'&gzipuncompress) function checks the gzip header,
the DEFLATE stream, and the trailer's CRC-32 and size. It returns null on invalid data and logs
the error in [debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).

The compressor and uncompressor are written in BareScript. The output is a standard gzip stream
that any gzip tool can read, and any single-member gzip stream can be uncompressed. To fetch a
gzip file, pass a binary request model to the
[systemFetch](#var.vGroup='system'&systemfetch) function:

```bare-script
async function fetchCompressed(url):
    return gzipUncompress(systemFetch({'url': url, 'binary': true}))
endfunction
```
