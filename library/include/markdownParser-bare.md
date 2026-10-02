The "markdownParser.bare" include library parses Markdown text into a
[Markdown model](model.html#var.vName='Markdown'). Render the model with the
[markdownElements.bare](#var.vGroup='markdownElements.bare'&_top) include library, or render it
back to Markdown text with the [markdownString.bare](#var.vGroup='markdownString.bare'&_top) include
library.

```bare-script
include <markdownParser.bare>

markdown = markdownParse('# Hello, World!', '', 'This is a paragraph.')
```
