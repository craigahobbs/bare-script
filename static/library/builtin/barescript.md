The "barescript" library contains functions for evaluating BareScript expressions. To parse an
expression, use the
[barescriptParseExpression](#var.vGroup='barescriptParser.bare'&barescriptparseexpression) function
of the "barescriptParser.bare" include library. To parse and evaluate a BareScript expression:

```bare-script
include <barescriptParser.bare>

exprStr = '5 * N'
expr = barescriptParseExpression(exprStr)
systemLog(barescriptEvaluateExpression(expr, {'N': 10}))
systemLog(barescriptEvaluateExpression(expr, {'N': 11}))
```

This outputs:

```
50
55
```
