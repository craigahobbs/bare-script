The "diff.bare" include library provides functions for computing line-by-line differences between
two strings or arrays of strings. This is useful for comparing text files, showing changes, or
implementing version control-like functionality.

To compute differences between two strings:

~~~ bare-script
include <diff.bare>

left = 'Line 1\nLine 2\nLine 3'
right = 'Line 1\nLine 2 modified\nLine 3\nLine 4'

differences = diffLines(left, right)
~~~

You can also pass arrays of strings:

~~~ bare-script
leftLines = ['Line 1', 'Line 2', 'Line 3']
rightLines = ['Line 1', 'Line 2 modified', 'Line 3', 'Line 4']

differences = diffLines(leftLines, rightLines)
~~~

The function returns an array of [difference models](model.html#var.vName='Differences') that
describe the changes between the two inputs. Each difference model indicates whether lines were
added, removed, or unchanged, along with the affected line text.

This is particularly useful for displaying side-by-side comparisons or unified diffs in applications
that need to show how content has changed over time.
