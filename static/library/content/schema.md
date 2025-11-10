Schema functions provide operations for parsing, validating, and working with
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) type definitions.
Schema Markdown is a human-readable schema definition language.

Parse Schema Markdown text:

~~~ bare-script
types = schemaParse( \
    '# A person information struct', \
    'struct Person', \
    '', \
    "    # The person's name", \
    '    string name', \
    '', \
    "    # The person's age", \
    '    int age', \
    '', \
    "    # The person's email address", \
    '    optional string email' \
)
~~~

Validate data against a schema type:

~~~ bare-script
person = {'name': 'Alice', 'age': 30}
validated = schemaValidate(types, 'Person', person)
if validated != null:
    # Validation succeeded
    markdownPrint('Valid person: ' + objectGet(validated, 'name'))
endif
~~~

Validate a type model:

~~~ bare-script
# Validate that a types object conforms to the Schema Markdown type model
validatedTypes = schemaValidateTypeModel(types)
~~~

Schema validation provides:
- Type checking (strings, integers, floats, booleans, etc.)
- Required vs. optional field validation
- Array and object structure validation
- Enumeration value validation
- Custom validation constraints
- Detailed error messages

This makes it easy to define, validate, and document data structures in BareScript applications.
