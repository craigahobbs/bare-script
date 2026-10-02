The "schema.bare" include library validates values using
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) type models. Schema
Markdown is a human-readable schema definition language - parse it into a type model with the
[schemaParser.bare](#var.vGroup='schemaParser.bare'&_top) include library. Validation checks types,
required members, and value and length constraints, and converts strings to their member types.

```bare-script
include <schema.bare>
include <schemaParser.bare>

types = schemaParse( \
    'struct Person', \
    '    string name', \
    '    int age', \
    '    optional string email' \
)
person = schemaValidate(types, 'Person', {'name': 'Alice', 'age': 30})
```
