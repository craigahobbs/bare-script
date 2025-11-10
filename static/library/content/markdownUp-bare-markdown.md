The "markdownUp.bare: markdown" section contains functions for parsing, rendering, and manipulating
Markdown content. These are core functions for MarkdownUp applications.

Render Markdown text:

~~~ bare-script
markdownPrint('# Hello, World!', '', 'This is a **Markdown** document.')
~~~

Escape text for safe inclusion in Markdown:

~~~ bare-script
# Escape special characters
safeText = markdownEscape('Text with * and _ characters')
markdownPrint('**Bold:** ' + safeText)
~~~

Compute a header element ID from text:

~~~ bare-script
# Get the ID for a header
headerId = markdownHeaderId('My Section Title')
# Returns: 'my-section-title'
~~~

Extract the title from Markdown text:

~~~ bare-script
model = markdownParse('# Title', '', 'Some *text*.')
title = markdownTitle(model)
~~~

The Markdown functions support [GitHub Flavored Markdown](https://github.github.com/gfm/) including
headers, emphasis, links, lists, code blocks, and tables. They integrate seamlessly with other
MarkdownUp functions to create rich, interactive documents.
