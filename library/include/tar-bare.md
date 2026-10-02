The "tar.bare" include library creates and extracts tar archives, as byte value arrays (arrays of
integers 0 to 255). Combine it with the [gzip.bare](#var.vGroup='gzip.bare'&_top) include library
for ".tar.gz" files. In MarkdownUp, [windowURLObject](#var.vGroup='markdownUp.bare'&windowurlobject)
creates a download URL for the archive:

```bare-script
include <gzip.bare>
include <tar.bare>

tarGzBytes = gzipCompress(tarCreate([ \
    {'name': 'README.md', 'bytes': '# My Project\n'}, \
    {'name': 'data/values.bin', 'bytes': [0, 128, 255]} \
]))
downloadURL = windowURLObject(tarGzBytes, 'application/gzip')
```
