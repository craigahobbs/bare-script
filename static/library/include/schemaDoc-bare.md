The "schemaDoc.bare" include library generates documentation for
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) schemas - useful for
documenting options objects, file formats, and APIs. Run the documentation application for a Schema
Markdown file, or generate the Markdown documentation for a single type:

```bare-script
include <schemaDoc.bare>

schemaDocMain('my-schema.smd', 'My Schema Documentation')

markdownPrint(schemaDocMarkdown(types, 'MyStruct'))
```
