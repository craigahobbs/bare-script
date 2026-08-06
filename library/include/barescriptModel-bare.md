The "barescriptModel.bare" include library provides the BareScript type model and model validation
functions.

A [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript') is
an object representation of a BareScript script. It is produced by the BareScript parser and
consumed by the BareScript runtime. The
[BareScript type model](https://craigahobbs.github.io/bare-script/model/) is the
[Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) schema that describes
the BareScript model.

Get the BareScript type model:

```bare-script
include <barescriptModel.bare>

typeModel = barescriptTypeModel()
```

Validate a BareScript model (for example, one loaded from a JSON resource):

```bare-script
scriptJSON = jsonParse(systemFetch('script.json'))
script = barescriptValidateScript(scriptJSON)
if script == null:
    markdownPrint('Invalid BareScript model!')
endif
```

The [barescriptValidateScript](#var.vGroup='barescriptModel.bare'&barescriptvalidatescript) and
[barescriptValidateExpression](#var.vGroup='barescriptModel.bare'&barescriptvalidateexpression)
functions return null if validation fails and log the validation error in
[debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode). For programmatic access to the
validation error, use the
[barescriptValidateScriptEx](#var.vGroup='barescriptModel.bare'&barescriptvalidatescriptex) and
[barescriptValidateExpressionEx](#var.vGroup='barescriptModel.bare'&barescriptvalidateexpressionex)
functions:

```bare-script
result = barescriptValidateScriptEx(scriptModel)
if objectHas(result, 'error'):
    markdownPrint('', 'Error: ' + markdownEscape(objectGet(result, 'error')))
else:
    script = objectGet(result, 'result')
endif
```
