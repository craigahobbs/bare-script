The "barescriptParser.bare" include library parses
[BareScript](https://craigahobbs.github.io/bare-script/language/) script text into
[BareScript models](https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript').

Parse a BareScript script:

~~~ bare-script
include <barescriptParser.bare>

script = barescriptParseScript(scriptText)
if script == null:
    markdownPrint('Syntax error!')
endif
~~~

The [barescriptParseScript](#var.vGroup='barescriptParser.bare'&barescriptparsescript) function
returns null if parsing fails and logs the parser error in
[debug mode](https://craigahobbs.github.io/markdown-up/#debug-mode). For programmatic access to the
parser error, use the
[barescriptParseScriptEx](#var.vGroup='barescriptParser.bare'&barescriptparsescriptex) function:

~~~ bare-script
result = barescriptParseScriptEx(scriptText, 1, 'test.bare')
if objectHas(result, 'error'):
    markdownPrint('', 'Error: ' + markdownEscape(objectGet(objectGet(result, 'error'), 'error')))
else:
    script = objectGet(result, 'result')
endif
~~~

To parse a BareScript expression, use the
[barescriptParseExpression](#var.vGroup='barescriptParser.bare'&barescriptparseexpression) function
or, for programmatic error reporting, the
[barescriptParseExpressionEx](#var.vGroup='barescriptParser.bare'&barescriptparseexpressionex)
function.
