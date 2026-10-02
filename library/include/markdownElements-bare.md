The "markdownElements.bare" include library converts a
[Markdown model](model.html#var.vName='Markdown') into an
[element model](https://github.com/craigahobbs/element-model#readme) for rendering:

```bare-script
include <markdownElements.bare>
include <markdownParser.bare>

elementModelRender(markdownElements(markdownParse('# Hello, World!', '', 'This is **bold** text.')))
```
