The "markdown.bare" include library contains utility functions for Markdown text and
[Markdown models](model.html#var.vName='Markdown') - escaping text, generating header IDs, finding a
document's title, extracting paragraph text, and validating Markdown models. Escape text before including it in Markdown
output:

```bare-script
include <markdown.bare>

markdownPrint('# ' + markdownEscape(title))
```
