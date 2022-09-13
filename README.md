# calc-script

[![npm](https://img.shields.io/npm/v/calc-script)](https://www.npmjs.com/package/calc-script)
[![GitHub](https://img.shields.io/github/license/craigahobbs/calc-script)](https://github.com/craigahobbs/calc-script/blob/main/LICENSE)

The calc-script package is the JavaScript implementation of the
[CalcScript language](https://craigahobbs.github.io/calc-script/language/).


## Links

- [The CalcScript Language](https://craigahobbs.github.io/calc-script/language/)
- [The CalcScript Library](https://craigahobbs.github.io/calc-script/library/)
- [The CalcScript Expression Library](https://craigahobbs.github.io/calc-script/library/expression.html)
- [API Documentation](https://craigahobbs.github.io/calc-script/)
- [Source code](https://github.com/craigahobbs/calc-script)


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

return N + ' times 2 is ' + double(N)
`);

// Execute the script
const globals = {'N': 10};
console.log(executeScript(script, {'globals': globals}));
~~~

This outputs:

~~~
10 times 2 is 20
~~~


### The CalcScript Library

[The CalcScript Library](https://craigahobbs.github.io/calc-script/library/)
includes a set of built-in functions for mathematical operations, object manipulation, array
manipulation, regular expressions,
fetch
and more. The following example demonstrates the use of the
[fetch](https://craigahobbs.github.io/calc-script/library/#var.vName='fetch'),
[objectGet](https://craigahobbs.github.io/calc-script/library/#var.vName='objectGet'), and
[arrayLength](https://craigahobbs.github.io/calc-script/library/#var.vName='arrayLength') functions.

~~~ javascript
import {executeScriptAsync} from 'calc-script/lib/runtimeAsync.js';
import {parseScript} from 'calc-script/lib/parser.js';

// Parse the script
const script = parseScript(`\
# Fetch the CalcScript library documentation JSON
libraryDocs = fetch('https://craigahobbs.github.io/calc-script/library/library.json')

# Return the number of library functions
return 'The CalcScript Library has ' + arrayLength(objectGet(libraryDocs, 'functions')) + ' functions'
`);

// Execute the script
console.log(await executeScriptAsync(script, {'fetchFn': fetch}));
~~~

This outputs:

~~~
The CalcScript Library has 82 functions
~~~


## Evaluating CalcScript Expressions

To evaluate a
[CalcScript expression](https://craigahobbs.github.io/calc-script/language/#expressions),
parse the expression using the
[parseExpression](https://craigahobbs.github.io/calc-script/module-lib_parser.html#.parseExpression)
function. Then evaluate the expression using the
[evaluateExpression](https://craigahobbs.github.io/calc-script/module-lib_runtime.html#.evaluateExpression)
function or the
[evaluateExpressionAsync](https://craigahobbs.github.io/calc-script/module-lib_runtimeAsync.html#.evaluateExpressionAsync)
function.

Expression evaluation includes the
[CalcScript Expression Library](https://craigahobbs.github.io/calc-script/library/expression.html),
a set of built-in, spreadsheet-like functions.

For example:

~~~ javascript
import {evaluateExpression} from 'calc-script/lib/runtime.js';
import {parseExpression} from 'calc-script/lib/parser.js';

// Parse the expression
const expr = parseExpression('2 * max(a, b, c)');

// Evaluate the expression
const variables = {'a': 1, 'b': 2, 'c': 3};
console.log(evaluateExpression(expr, null, variables))
~~~

This outputs:

~~~
6
~~~


## Development

calc-script is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme)
and it was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme):

```
template-specialize javascript-template/template/ calc-script/ -k package calc-script -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
```
