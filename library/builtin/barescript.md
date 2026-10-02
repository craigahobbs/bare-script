The "barescript" library evaluates BareScript expression models. To parse expression text into an
expression model, use the
[barescriptParseExpression](#var.vGroup='barescriptParser.bare'&barescriptparseexpression) function
of the "barescriptParser.bare" include library:

```bare-script
include <barescriptParser.bare>

expr = barescriptParseExpression('5 * N')
result = barescriptEvaluateExpression(expr, {'N': 10})
# result is 50
```
