The "markdownString.bare" include library renders a
[Markdown model](model.html#var.vName='Markdown') back to Markdown text.

```bare-script
include <markdownParser.bare>
include <markdownString.bare>

markdown = markdownParse('#   Hello, World!', '', 'This is a', 'paragraph.')
text = markdownToString(markdown)
```

Together with [markdownParse](#var.vGroup='markdownParser.bare'&markdownparse), it works as a
Markdown formatter — the rendered text is normalized, not source-preserving:

- Paragraph text is re-wrapped to the wrap width
- Setext headers are rendered as hash headers and indented code blocks are rendered fenced
- The "\_" and "\~" character styles are normalized to "\*" and "\~\~"
- Auto-links stay angle-bracket form when the parser would recognize them
- Table cells are padded to the column width and alignment
- Only the characters that require escaping are escaped

The "wrapWidth" argument sets the text wrap width (100 by default). It is a target for paragraph
text, not a hard maximum: links, images, and code spans are never split across lines, and fenced
code is not wrapped. Pass zero to render each paragraph on a single line:

```bare-script
text = markdownToString(markdown, 80)
oneLine = markdownToString(markdown, 0)
```

The "refCount" argument generates link and image references for repeated URLs. It is the minimum
number of occurrences of a URL for which a reference is rendered — zero (the default) renders every
link and image inline. The reference definitions are added at the end of the Markdown text:

```bare-script
text = markdownToString(markdown, 100, 2)
```
