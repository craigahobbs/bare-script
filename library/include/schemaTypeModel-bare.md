The "schemaTypeModel.bare" include library provides the
[Schema Markdown Type Model](model.html#var.vName='Types') and type model validation functions.

Get the Schema Markdown type model:

~~~ bare-script
include <schemaTypeModel.bare>

typeModel = schemaTypeModel()
~~~

Validate a user type model (for example, one loaded from a JSON resource):

~~~ bare-script
typesJSON = jsonParse(systemFetch('model.json'))
types = schemaTypeModelValidate(typesJSON)
if types == null:
    markdownPrint('Invalid type model!')
endif
~~~

The [schemaTypeModelValidate](#var.vGroup='schemaTypeModel.bare'&schematypemodelvalidate) function
returns null if validation fails and logs the validation errors in
[debug mode](https://craigahobbs.github.io/markdown-up/#debug). For programmatic access to
validation errors, use the
[schemaTypeModelValidateEx](#var.vGroup='schemaTypeModel.bare'&schematypemodelvalidateex) function:

~~~ bare-script
result = schemaTypeModelValidateEx(typesJSON)
if objectHas(result, 'errors'):
    for error in objectGet(result, 'errors'):
        markdownPrint('', 'Error: ' + markdownEscape(error))
    endfor
else:
    types = objectGet(result, 'result')
endif
~~~
