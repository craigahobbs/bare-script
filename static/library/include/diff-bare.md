The "diff.bare" include library computes the line-by-line differences between two strings or arrays
of strings, as an array of [difference models](model.html#var.vName='Differences').

```bare-script
include <diff.bare>

differences = diffLines('Line 1\nLine 2', 'Line 1\nLine 2 modified\nLine 3')
```
