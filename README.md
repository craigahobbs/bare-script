# bare-script

[![npm](https://img.shields.io/npm/v/bare-script)](https://www.npmjs.com/package/bare-script)
[![GitHub](https://img.shields.io/github/license/craigahobbs/bare-script)](https://github.com/craigahobbs/bare-script/blob/main/LICENSE)

[BareScript](https://craigahobbs.github.io/bare-script/language/)
is a simple, lightweight, and portable programming language. Its Pythonic syntax is influenced by
JavaScript, C, and the Unix Shell. BareScript also has a library of built-in functions for common
programming operations. BareScript can be embedded within applications or used as a stand-alone
programming language using the command-line interface.

There are two implementations of BareScript:
[BareScript for JavaScript](https://github.com/craigahobbs/bare-script#readme)
(this package) and
[BareScript for Python](https://github.com/craigahobbs/bare-script-py#readme).
Both implementations have 100% unit test coverage with identical unit test suites, so you can be
confident that BareScript will execute the same regardless of the underlying runtime environment.


## Links

- [The BareScript Language](https://craigahobbs.github.io/bare-script/language/)
- [The BareScript Library](https://craigahobbs.github.io/bare-script/library/)
- [The BareScript Include Library Tests](https://craigahobbs.github.io/bare-script/include/test/)
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

``` javascript
import {executeScript} from 'bare-script/lib/runtime.js';
import {parseScript} from 'bare-script/lib/parser.js';

// Parse the script
const script = parseScript(`\
# Double a number
function double(n):
    return n * 2
endfunction

return N + ' times 2 is ' + double(N)
`);

// Execute the script
const globals = {'N': 10};
console.log(executeScript(script, {globals}));
```

This outputs:

```
10 times 2 is 20
```


### The BareScript Library

[The BareScript Library](https://craigahobbs.github.io/bare-script/library/)
includes a set of built-in functions for mathematical operations, object manipulation, array
manipulation, regular expressions, HTTP fetch and more. The following example demonstrates the use
of the
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='System'&systemfetch),
[objectGet](https://craigahobbs.github.io/bare-script/library/#var.vGroup='Object'&objectget), and
[arrayLength](https://craigahobbs.github.io/bare-script/library/#var.vGroup='Array'&arraylength)
functions.

``` javascript
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';
import {parseScript} from 'bare-script/lib/parser.js';

// Parse the script
const script = parseScript(`\
# Fetch the BareScript builtin library documentation JSON
docs = jsonParse(systemFetch('https://craigahobbs.github.io/bare-script/library/library-builtin.json'))

# Return the number of builtin functions
return 'The BareScript Library has ' + arrayLength(objectGet(docs, 'functions')) + ' builtin functions'
`);

// Execute the script
console.log(await executeScriptAsync(script, {'fetchFn': fetch}));
```

This outputs:

```
The BareScript Library has 108 builtin functions
```


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

``` javascript
import {evaluateExpression} from 'bare-script/lib/runtime.js';
import {parseExpression} from 'bare-script/lib/parser.js';

// Parse the expression
const expr = parseExpression('2 * max(a, b, c)');

// Evaluate the expression
const variables = {'a': 1, 'b': 2, 'c': 3};
console.log(evaluateExpression(expr, null, variables))
```

This outputs:

```
6
```


## The BareScript Command-Line Interface (CLI)

You can run BareScript from the command line using the BareScript CLI, "bare". BareScript script
files use the ".bare" file extension.

```
bare script.bare
```

**Note:** In the BareScript CLI, import statements and the
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='System'&systemfetch)
function read non-URL paths from the local file system.
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='System'&systemfetch)
calls with a non-URL path and a
[request body](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest')
write the body to the path.


## MarkdownUp, a Markdown Viewer with BareScript

[MarkdownUp](https://craigahobbs.github.io/markdown-up/) is a Markdown Viewer that executes
BareScript embedded within Markdown documents. The MarkdownUp runtime contains functions for
dynamically rendering Markdown text, drawing SVG images, etc. For example:

~~~
# Markdown Application

This is a Markdown document with embedded BareScript:

``` markdown-script
markdownPrint('Hello, Markdown!')
```
~~~


## Using BareScript with an AI Assistant

This repository ships a
[`SKILL.md`](https://github.com/craigahobbs/bare-script-py/blob/main/SKILL.md)
file that teaches an AI coding assistant how to write idiomatic BareScript — language syntax, the
built-in and include libraries, the MarkdownUp application pattern, and the unit-test conventions.
It is plain Markdown and applies to either BareScript implementation.

For [Claude Code](https://claude.com/claude-code) and other tools that follow the
[Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
convention, install it as a project or user skill:

```
mkdir -p .claude/skills/bare-script
cp SKILL.md .claude/skills/bare-script/SKILL.md
```

Use `~/.claude/skills/bare-script/SKILL.md` instead to make it available across all projects. For
other assistants, include the file's contents in your system prompt or rules file.

Once installed, prompt the assistant with a task like:

```
claude "Build a MarkdownUp application that plays tic-tac-toe against the user, with a reset button and a running win/loss/draw tally rendered as a bar chart. Save it as ticTacToe.md"
```

To run the resulting MarkdownUp application locally, install the
[markdown-up](https://pypi.org/project/markdown-up/) viewer and point it at the Markdown file:

```
pip install markdown-up
markdown-up ticTacToe.md
```

The BareScript library is also documented as single-page Markdown, which can be fetched directly
into an assistant's context alongside `SKILL.md`:

- [The BareScript Library](https://craigahobbs.github.io/bare-script/library/barescript-library.md)
- [The BareScript Library Models](https://craigahobbs.github.io/bare-script/library/barescript-library-model.md)


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

```
template-specialize javascript-template/template/ bare-script/ -k package bare-script -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
```
