`markdownUp.bare` contains implementations of the
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
runtime functions, which enables many MarkdownUp applications to run on plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

**Do not `include <markdownUp.bare>` from application code.** Two reasons:

1. In the real [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme) browser runtime,
   `markdownPrint`, `elementModelRender`, and the `document*` / `window*` / `*Storage*` functions
   are built-in. Including this file would **overwrite those built-ins with the logging stubs**,
   and the application would silently stop rendering.
2. Under the `bare` CLI, the `-m` (Markdown text output) and `-l` (HTML output) flags prepend
   `include <markdownUp.bare>` for you, so an explicit include is redundant.

Consider the following MarkdownUp application:

**app.md**

``` markdown
~~~ markdown-script
include 'app.bare'
~~~
```

**app.bare:**

~~~ bare-script
function appMain():
    markdownPrint('# Hello!', '')
    i = 0
    while i < 10:
        markdownPrint('- ' + (i + 1))
        i = i + 1
    endwhile
endfunction

appMain()
~~~

The application runs as expected within
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme).
However, when running in plain BareScript, the `markdownPrint` function is not defined, and the
application fails:

~~~ sh
$ bare app.bare
app.bare:
Undefined function "markdownPrint"
~~~

However, if we first include "markdownUp.bare" using the "-m" argument, the application works and
outputs the generated Markdown to the terminal:

~~~ sh
$ bare -m app.bare
# Hello!

- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
~~~
