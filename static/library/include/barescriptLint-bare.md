The "barescriptLint.bare" include library statically analyzes
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript') for
common mistakes: unused variables, arguments, and labels; variables used before assignment; unknown
global variables and labels; redefined functions and labels; and pointless statements. It also
computes a script's unbound global variables - the inputs its host must provide.

```bare-script
include <barescriptLint.bare>

for warning in barescriptLintScript(script):
    markdownPrint('', 'Warning: ' + markdownEscape(warning))
endfor
```
