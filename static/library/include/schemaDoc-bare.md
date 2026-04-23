The "schemaDoc.bare" include library provides functions for generating documentation for
[schemas](#var.vGroup='schema'). It's particularly useful for defining and documenting options
objects, file formats, and APIs.

Execute the schema documentation application for a Schema Markdown (`.smd`) file:

~~~ bare-script
include <schemaDoc.bare>

schemaDocMain('my-schema.smd', 'My Schema Documentation')
~~~

Generate Markdown documentation for a specific type:

~~~ bare-script
types = schemaParse('struct MyStruct', '    string name')
markdownLines = schemaDocMarkdown(types, 'MyStruct')
markdownPrint(markdownLines)
~~~
