`markdownUp.bare` implements the [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
runtime functions - `markdownPrint`, `elementModelRender`, and the `document*`, `window*`, and
`*Storage*` functions - so that many MarkdownUp applications run on plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

**Do not `include <markdownUp.bare>` from application code.** Two reasons:

1. In the real [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme) browser runtime,
   these functions are built-in. Including this file would **overwrite those built-ins with the
   logging stubs**, and the application would silently stop rendering.
2. Under the `bare` CLI, the `-m` (Markdown text output) and `-l` (HTML output) flags prepend
   `include <markdownUp.bare>` for you, so an explicit include is redundant.

To run a MarkdownUp application with the `bare` CLI, use the `-m` flag. Without it, the MarkdownUp
runtime functions are undefined. For an "app.bare" that calls `markdownPrint('# Hello!')`:

```sh
$ bare -m app.bare
# Hello!

$ bare app.bare
app.bare:1: Undefined function "markdownPrint"
```
