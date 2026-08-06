The "barescriptLint.bare" include library statically analyzes
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript') for
common mistakes: unused variables, arguments, and labels; variables used before assignment; unknown
global variables and labels; redefined functions and labels; and pointless statements.

Lint a BareScript model:

```bare-script
include <barescriptLint.bare>

warnings = barescriptLintScript(script)
for warning in warnings:
    markdownPrint('', 'Warning: ' + markdownEscape(warning))
endfor
```

Pass the script's global variables to also perform the unknown-global lint checks:

```bare-script
warnings = barescriptLintScript(script, globals)
```
