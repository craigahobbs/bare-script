The "barescriptParser.bare" include library parses
[BareScript](https://craigahobbs.github.io/bare-script/language/) script and expression text into
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript').

```bare-script
include <barescriptParser.bare>

script = barescriptParseScript(scriptText)
expr = barescriptParseExpression('5 * N')
```
