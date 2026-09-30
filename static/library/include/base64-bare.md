The "base64.bare" include library provides functions for encoding byte value arrays as base64 text
and decoding base64 text back to bytes. A byte value array is an ordinary array of integers 0 to
255, the same representation the
[stringEncode](#var.vGroup='string'&stringencode) and
[stringDecode](#var.vGroup='string'&stringdecode) functions use.

To encode bytes (or a string, as UTF-8) as base64:

```bare-script
include <base64.bare>

encoded = base64Encode([104, 101, 108, 108, 111])
# aGVsbG8=

encoded = base64Encode('hello')
# aGVsbG8=
```

To decode base64 text to a byte value array:

```bare-script
bytes = base64Decode('aGVsbG8=')
# [104, 101, 108, 108, 111]

text = stringDecode(bytes)
# hello
```

The [base64Decode](#var.vGroup='base64.bare'&base64decode) function returns null on invalid
input (characters outside the base64 alphabet, a length that is not a multiple of four, or
misplaced padding) and logs the error in
[debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).

Base64 text is the way to carry binary data through string-only channels such as
[localStorageSet](#var.vGroup='markdownUp.bare'&localstorageset), JSON, and data URLs:

```bare-script
dataURL = 'data:application/octet-stream;base64,' + base64Encode(bytes)
```
