The "markdownUp.bare: schema" section contains functions for rendering schema type documentation.
These functions create interactive documentation for data structures defined using
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/).

Generate documentation element model for a schema type:

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
elements = schemaElements(types, 'Person')
elementModelRender(elements)
~~~
