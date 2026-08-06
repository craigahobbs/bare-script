The "schemaParser.bare" include library provides functions for parsing
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text into
[type models](model.html#var.vName='Types'&var.vURL='').

Parse Schema Markdown text:

~~~ bare-script
include <schemaParser.bare>

types = schemaParse( \
    '# A person information struct', \
    'struct Person', \
    '', \
    "    # The person's name", \
    '    string name', \
    '', \
    "    # The person's age", \
    '    int age' \
)
~~~

The [schemaParse](#var.vGroup='schemaParser.bare'&schemaparse) function returns null if parsing
fails and logs the parse errors in [debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).
For programmatic access to parse errors, use the
[schemaParseEx](#var.vGroup='schemaParser.bare'&schemaparseex) function:

~~~ bare-script
result = schemaParseEx('struct Person', null, 'person.smd')
if objectHas(result, 'errors'):
    for error in objectGet(result, 'errors'):
        markdownPrint('', 'Error: ' + markdownEscape(error))
    endfor
else:
    types = objectGet(result, 'result')
endif
~~~

The [schemaParseEx](#var.vGroup='schemaParser.bare'&schemaparseex) function can also accumulate
multiple schemas into a single [type model](model.html#var.vName='Types'&var.vURL='') by passing the types
argument.

Use the [schemaValidate](#var.vGroup='schema.bare'&schemavalidate) function to validate a value
using the parsed type model.
