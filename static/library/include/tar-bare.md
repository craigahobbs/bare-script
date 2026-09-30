The "tar.bare" include library provides functions for creating and extracting tar archives. The
archive and each file's content are byte value arrays - ordinary arrays of integers 0 to 255, the
same representation the [stringEncode](#var.vGroup='string'&stringencode) and
[stringDecode](#var.vGroup='string'&stringdecode) functions use.

To create a tar archive from an array of file objects, each with a "name" (the file path), "bytes"
(the file content as a byte value array or a string, as UTF-8), and an optional "mtime" (the
modification datetime; the default is the Unix epoch):

```bare-script
include <tar.bare>

tarBytes = tarCreate([ \
    {'name': 'README.md', 'bytes': '# My Project\n'}, \
    {'name': 'data/values.bin', 'bytes': [0, 128, 255]} \
])
```

To extract an archive's regular files:

```bare-script
files = tarExtract(tarBytes)
# [{'name': 'README.md', 'bytes': [35, 32, ...], 'mtime': <datetime>}, {'name': 'data/values.bin', ...}]
```

The [tarExtract](#var.vGroup='tar.bare'&tarextract) function reads USTAR, GNU, and PAX archives,
skipping directory and link entries. It returns null on invalid data and logs the error in
[debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).

Combine with the [gzip.bare](#var.vGroup='gzip.bare') include library to create or read
".tar.gz" files. In MarkdownUp, the
[windowURLObject](#var.vGroup='markdownUp.bare'&windowurlobject) function creates a download
URL for the archive bytes:

```bare-script
include <gzip.bare>
include <tar.bare>

tarGzBytes = gzipCompress(tarCreate(files))
downloadURL = windowURLObject(tarGzBytes, 'application/gzip')
```
