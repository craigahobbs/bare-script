The "schemaParser.bare" include library parses
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text into a
[type model](model.html#var.vName='Types'&var.vURL='') for validating values with the
[schema.bare](#var.vGroup='schema.bare'&_top) include library.

```bare-script
include <schemaParser.bare>

types = schemaParse( \
    '# A person', \
    'struct Person', \
    '', \
    "    # The person's name", \
    '    string name' \
)
```
