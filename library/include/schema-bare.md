The "schema.bare" include library provides functions for validating values using
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) type models.
Schema Markdown is a human-readable schema definition language.

Validate a value against a schema type:

```bare-script
include <schema.bare>
include <schemaParser.bare>

types = schemaParse( \
    'struct Person', \
    '    string name', \
    '    int age', \
    '    optional string email' \
)

person = {'name': 'Alice', 'age': 30}
validated = schemaValidate(types, 'Person', person)
if validated != null:
    # Validation succeeded
    markdownPrint('Valid person: ' + objectGet(validated, 'name'))
endif
```

The [schemaValidate](#var.vGroup='schema.bare'&schemavalidate) function returns null if validation
fails and logs the validation error in [debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode).
For programmatic access to validation errors, use the
[schemaValidateEx](#var.vGroup='schema.bare'&schemavalidateex) function:

```bare-script
result = schemaValidateEx(types, 'Person', {'name': 'Alice'})
if objectHas(result, 'error'):
    markdownPrint('Error: ' + objectGet(result, 'error'))
    markdownPrint('Member: ' + objectGet(result, 'memberFqn'))
else:
    person = objectGet(result, 'result')
endif
```

Schema validation provides:

- Type checking and string coercion (strings, integers, floats, booleans, dates, etc.)
- Required vs. optional member validation
- Array and object structure validation
- Enumeration value validation
- Value and length constraints
- Detailed error messages
