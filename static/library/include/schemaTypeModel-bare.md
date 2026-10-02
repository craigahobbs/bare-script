The "schemaTypeModel.bare" include library provides the
[Schema Markdown type model](model.html#var.vName='Types'&var.vURL='') - the model of type models -
and type model validation functions. Validate a type model you did not parse yourself, such as one
loaded from JSON:

```bare-script
include <schemaTypeModel.bare>

types = schemaTypeModelValidate(jsonParse(systemFetch('model.json')))
```
