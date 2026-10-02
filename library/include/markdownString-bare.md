The "markdownString.bare" include library renders a
[Markdown model](model.html#var.vName='Markdown') back to Markdown text. Together with
[markdownParse](#var.vGroup='markdownParser.bare'&markdownparse), it works as a Markdown formatter.
The rendered text is normalized, not source-preserving:

- Paragraph text is re-wrapped to the wrap width
- Setext headers are rendered as hash headers and indented code blocks are rendered fenced
- The "\_" and "\~" character styles are normalized to "\*" and "\~\~"
- Auto-links stay angle-bracket form when the parser would recognize them
- Table cells are padded to the column width and alignment
- Only the characters that require escaping are escaped

```bare-script
include <markdownParser.bare>
include <markdownString.bare>

text = markdownToString(markdownParse('#   Hello, World!', '', 'This is a', 'paragraph.'))
```
