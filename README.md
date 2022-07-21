# calc-script

[![npm](https://img.shields.io/npm/v/calc-script)](https://www.npmjs.com/package/calc-script)
[![GitHub](https://img.shields.io/github/license/craigahobbs/calc-script)](https://github.com/craigahobbs/calc-script/blob/main/LICENSE)

[calc-script API Documentation](https://craigahobbs.github.io/calc-script/)

The calc-script package is a JavaScript implementation of the
[CalcScript language](https://craigahobbs.github.io/calc-script/reference/).


## Executing CalcScript Scripts

To execute a CalcScript script, parse the script using the
[parseScript](https://craigahobbs.github.io/calc-script/module-lib_parser.html#.parseScript)
function. Then execute the script using the
[executeScript](https://craigahobbs.github.io/calc-script/module-lib_runtime.html#.executeScript)
function or the
[executeScriptAsync](https://craigahobbs.github.io/calc-script/module-lib_runtimeAsync.html#.executeScriptAsync)
function. For example:

~~~ javascript
import {executeScript} from 'calc-script/lib/runtime.js';
import {parseScript} from 'calc-script/lib/parser.js';

// Parse the script
const script = parseScript(`\
# Double a number
function double(n)
    return n * 2
endfunction

return double(N)
`);

// Execute the script
const globals = {'N': 10};
const result = executeScript(script, globals);

console.log(`${globals.N} times 2 is ${result}`);
~~~

This yields the following log output:

~~~
10 times 2 is 20
~~~


### The CalcScript Library

CalcScript includes a set of built-in functions for mathematical operations, object manipulation,
array manipulation, regular expressions,
[fetch](https://craigahobbs.github.io/calc-script/library/#var.vName='fetch'),
and more. The CalcScript library
documentation is available at the following link:

[The CalcScript Library](https://craigahobbs.github.io/calc-script/library/)


## Evaluating CalcScript Expressions

To evaluate a
[CalcScript expression](https://craigahobbs.github.io/calc-script/reference/#Expressions),
parse the expression using the
[parseExpression](https://craigahobbs.github.io/calc-script/module-lib_parser.html#.parseExpression)
function. Then evaluate the expression using the
[evaluateExpression](https://craigahobbs.github.io/calc-script/module-lib_runtime.html#.evaluateExpression)
function or the
[evaluateExpressionAsync](https://craigahobbs.github.io/calc-script/module-lib_runtimeAsync.html#.evaluateExpressionAsync)
function. For example:

~~~ javascript
import {evaluateExpression} from 'calc-script/lib/runtime.js';
import {parseExpression} from 'calc-script/lib/parser.js';

// Parse the expression
const expr = parseExpression('n * 2');

// Evaluate the expression
const globals = {'n': 10};
const result = evaluateExpression(expr, globals);

console.log(`${globals.n} times 2 = ${result}`);
~~~

This yields the following log output:

~~~
10 times 2 = 20
~~~


### The CalcScript Expression Library

CalcScript expressions have access to a set of built-in, spreadsheet-like functions. The CalcScript
expression library documentation is available at the following link:

[The CalcScript Expression Library](https://craigahobbs.github.io/calc-script/library-expr/)


## Development

calc-script is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme)
and it was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme):

```
template-specialize javascript-template/template/ calc-script/ -k package calc-script -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
```
