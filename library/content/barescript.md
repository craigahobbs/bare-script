The "barescript" library contains functions for parsing and evaluating BareScript expressions. To
parse and evaluate a BareScript expression:

```barescript
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
