# bare-script

[![npm](https://img.shields.io/npm/v/bare-script)](https://www.npmjs.com/package/bare-script)
[![GitHub](https://img.shields.io/github/license/craigahobbs/bare-script)](https://github.com/craigahobbs/bare-script/blob/main/LICENSE)

The bare-script package is the JavaScript implementation of the
[BareScript language](https://craigahobbs.github.io/bare-script/language/).


## Links

- [The BareScript Language](https://craigahobbs.github.io/bare-script/language/)
- [The BareScript Library](https://craigahobbs.github.io/bare-script/library/)
- [The BareScript Expression Library](https://craigahobbs.github.io/bare-script/library/expression.html)
- [API Documentation](https://craigahobbs.github.io/bare-script/)
- [Source code](https://github.com/craigahobbs/bare-script)


## Executing BareScript Scripts

To execute a BareScript script, parse the script using the
[parseScript](https://craigahobbs.github.io/bare-script/module-lib_parser.html#.parseScript)
function. Then execute the script using the
[executeScript](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.executeScript)
function or the
[executeScriptAsync](https://craigahobbs.github.io/bare-script/module-lib_runtimeAsync.html#.executeScriptAsync)
function. For example:

~~~ javascript
import {executeScript} from 'bare-script/lib/runtime.js';
import {parseScript} from 'bare-script/lib/parser.js';

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
console.log(executeScript(script, {globals}));
~~~

This outputs:

~~~
10 times 2 is 20
~~~


### The BareScript Library

[The BareScript Library](https://craigahobbs.github.io/bare-script/library/)
includes a set of built-in functions for mathematical operations, object manipulation, array
manipulation, regular expressions, HTTP fetch and more. The following example demonstrates the use
of the
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vName='systemFetch'),
[objectGet](https://craigahobbs.github.io/bare-script/library/#var.vName='objectGet'), and
[arrayLength](https://craigahobbs.github.io/bare-script/library/#var.vName='arrayLength')
functions.

~~~ javascript
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';
import {parseScript} from 'bare-script/lib/parser.js';

// Parse the script
const script = parseScript(`\
# Fetch the BareScript library documentation JSON
docs = systemFetch('https://craigahobbs.github.io/bare-script/library/library.json')

# Return the number of library functions
return 'The BareScript Library has ' + arrayLength(objectGet(docs, 'functions')) + ' functions'
`);

// Execute the script
console.log(await executeScriptAsync(script, {'fetchFn': fetch}));
~~~

This outputs:

~~~
The BareScript Library has 89 functions
~~~


## Evaluating BareScript Expressions

To evaluate a
[BareScript expression](https://craigahobbs.github.io/bare-script/language/#expressions),
parse the expression using the
[parseExpression](https://craigahobbs.github.io/bare-script/module-lib_parser.html#.parseExpression)
function. Then evaluate the expression using the
[evaluateExpression](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.evaluateExpression)
function or the
[evaluateExpressionAsync](https://craigahobbs.github.io/bare-script/module-lib_runtimeAsync.html#.evaluateExpressionAsync)
function.

Expression evaluation includes the
[BareScript Expression Library](https://craigahobbs.github.io/bare-script/library/expression.html),
a set of built-in, spreadsheet-like functions.

For example:

~~~ javascript
import {evaluateExpression} from 'bare-script/lib/runtime.js';
import {parseExpression} from 'bare-script/lib/parser.js';

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


## The BareScript Command-Line Interface (CLI)

You can run BareScript from the command line using the BareScript CLI, "bare". BareScript script
files use the ".bare" file extension.

~~~
bare script.bare
~~~

**Note:** In the BareScript CLI, import statements and the
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vName='systemFetch')
function read non-URL paths from the local file system.


## MarkdownUp, a Markdown Viewer with BareScript

[MarkdownUp](https://craigahobbs.github.io/markdown-up/)
is a Markdown Viewer that executes BareScript embedded within Markdown documents.
[MarkdownUp](https://craigahobbs.github.io/markdown-up/)
extends its
[standard library](https://craigahobbs.github.io/markdown-up/library/)
with functions for dynamically rendering Markdown text, drawing SVG images, etc.

For example:

```
# Markdown Application

This is a Markdown document with embedded BareScript:

~~~ markdown-script
markdownPrint('Hello, Markdown!')
~~~
```


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

~~~
template-specialize javascript-template/template/ bare-script/ -k package bare-script -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
~~~
