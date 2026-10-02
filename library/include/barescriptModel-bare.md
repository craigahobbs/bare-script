The "barescriptModel.bare" include library provides the
[BareScript type model](https://craigahobbs.github.io/bare-script/model/) and model validation
functions. A [BareScript model](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript')
is the object representation of a script - the BareScript parser produces it and the BareScript
runtime executes it. Validate a model you did not parse yourself, such as one loaded from JSON:

```bare-script
include <barescriptModel.bare>

script = barescriptValidateScript(jsonParse(systemFetch('script.json')))
```
