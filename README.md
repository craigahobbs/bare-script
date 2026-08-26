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
- [API Documentation](https://craigahobbs.github.io/bare-script/)
- [Source code](https://github.com/craigahobbs/bare-script)


## Installation

Install the bare-script package in your project with npm:

```
npm install bare-script
```

This package is ESM-only. Import from subpaths such as `bare-script/lib/runtime.js` — there is no
package root export.

To use the `bare` command-line interface, install the package globally:

```
npm install -g bare-script
```


## Executing BareScript Scripts

To execute a BareScript script, parse the script using the
[barescriptParseScript](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.barescriptParseScript)
function. Then execute the script using the
[executeScript](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.executeScript)
function or the
[executeScriptAsync](https://craigahobbs.github.io/bare-script/module-lib_runtimeAsync.html#.executeScriptAsync)
function. For example:

```javascript
import {barescriptParseScript, executeScript} from 'bare-script/lib/runtime.js';

// Parse the script
const script = barescriptParseScript(`\
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


## The BareScript Library

[The BareScript Library](https://craigahobbs.github.io/bare-script/library/)
documents the built-in functions available to every script and the include libraries loaded with
the [include statement](https://craigahobbs.github.io/bare-script/language/#include-statements).
Built-in functions cover mathematical operations, object and array manipulation, regular
expressions, HTTP fetch, and more. Angle-bracket includes (`include <markdown.bare>`) load libraries
bundled with the runtime. Quoted includes (`include 'util.bare'`) load a local file or URL.

The following example uses the built-in
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='system'&systemfetch),
[objectGet](https://craigahobbs.github.io/bare-script/library/#var.vGroup='object'&objectget), and
[arrayLength](https://craigahobbs.github.io/bare-script/library/#var.vGroup='array'&arraylength)
functions:

```javascript
import {barescriptParseScript} from 'bare-script/lib/runtime.js';
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';

// Parse the script
const script = barescriptParseScript(`\
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
The BareScript Library has 100 builtin functions
```

Include libraries are loaded before use:

```javascript
import {barescriptParseScript, executeScript} from 'bare-script/lib/runtime.js';

// Parse the script
const script = barescriptParseScript(`\
include <markdownParser.bare>
include <markdown.bare>

markdown = markdownParse('# Hello, Markdown!')
return markdownTitle(markdown)
`);

// Execute the script
console.log(executeScript(script));
```

This outputs:

```
Hello, Markdown!
```

Quoted includes and
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='system'&systemfetch)
calls with a non-URL path need a filesystem-aware fetch function. In Node.js, pass
[fetchReadOnly](https://craigahobbs.github.io/bare-script/module-lib_optionsNode.html#.fetchReadOnly)
or
[fetchReadWrite](https://craigahobbs.github.io/bare-script/module-lib_optionsNode.html#.fetchReadWrite)
from `bare-script/lib/optionsNode.js` to
[executeScriptAsync](https://craigahobbs.github.io/bare-script/module-lib_runtimeAsync.html#.executeScriptAsync):

```javascript
import {barescriptParseScript} from 'bare-script/lib/runtime.js';
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';
import {fetchReadWrite} from 'bare-script/lib/optionsNode.js';

const script = barescriptParseScript("include 'util.bare'");
await executeScriptAsync(script, {'fetchFn': fetchReadWrite});
```


### Stub Functions

Include library functions are also callable directly from JavaScript using the native stub functions
exported by the
[include module](https://craigahobbs.github.io/bare-script/module-lib_include.html) — for example,
[dataAggregate](https://craigahobbs.github.io/bare-script/module-lib_include.html#.dataAggregate),
[markdownParse](https://craigahobbs.github.io/bare-script/module-lib_include.html#.markdownParse),
[qrcodeMatrix](https://craigahobbs.github.io/bare-script/module-lib_include.html#.qrcodeMatrix),
[schemaParse](https://craigahobbs.github.io/bare-script/module-lib_include.html#.schemaParse),
[schemaValidate](https://craigahobbs.github.io/bare-script/module-lib_include.html#.schemaValidate), and
[urlEncode](https://craigahobbs.github.io/bare-script/module-lib_include.html#.urlEncode).
Each stub function executes its corresponding include library function using the BareScript
runtime. For example:

```javascript
import {markdownParse, markdownTitle} from 'bare-script/lib/include.js';

// Parse the Markdown text
const markdown = markdownParse(`\
# Hello, Markdown!

This is some text.
`);

// Print the Markdown title
console.log(markdownTitle(markdown));
```

This outputs:

```
Hello, Markdown!
```


## Evaluating BareScript Expressions

To evaluate a
[BareScript expression](https://craigahobbs.github.io/bare-script/language/#expressions),
parse the expression using the
[barescriptParseExpression](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.barescriptParseExpression)
function. Then evaluate the expression using the
[evaluateExpression](https://craigahobbs.github.io/bare-script/module-lib_runtime.html#.evaluateExpression)
function or the
[evaluateExpressionAsync](https://craigahobbs.github.io/bare-script/module-lib_runtimeAsync.html#.evaluateExpressionAsync)
function.

Expression evaluation includes the
[BareScript Expression Library](https://craigahobbs.github.io/bare-script/library/expression.html),
a set of built-in, spreadsheet-like functions.

For example:

```javascript
import {barescriptParseExpression, evaluateExpression} from 'bare-script/lib/runtime.js';

// Parse the expression
const expr = barescriptParseExpression('2 * max(a, b, c)');

// Evaluate the expression
const variables = {'a': 1, 'b': 2, 'c': 3};
console.log(evaluateExpression(expr, null, variables));
```

This outputs:

```
6
```


## The BareScript Command-Line Interface (CLI)

You can run BareScript from the command line using the BareScript CLI, "bare". BareScript script
files use the ".bare" file extension.

```
bare script.bare                      # run a script
bare -c 'systemLog("Hello, World!")'  # execute inline code
bare -v N 10 script.bare              # set the global N to 10
bare -d script.bare                   # debug mode
bare -m app.bare                      # MarkdownUp text output
bare -l app.bare                      # MarkdownUp HTML output
bare -s script.bare                   # parse and lint only
bare -x script.bare                   # lint with execution
```

**Note:** In the BareScript CLI, include statements and the
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='system'&systemfetch)
function read non-URL paths from the local file system.
[systemFetch](https://craigahobbs.github.io/bare-script/library/#var.vGroup='system'&systemfetch)
calls with a non-URL path and a request body write the body to the path.


## MarkdownUp, a Markdown Viewer with BareScript

[MarkdownUp](https://craigahobbs.github.io/markdown-up/) is a Markdown Viewer that executes
BareScript embedded within Markdown documents. The MarkdownUp runtime contains functions for
dynamically rendering Markdown text, drawing SVG images, etc. For example:

~~~
# Markdown Application

This is a Markdown document with embedded BareScript:

```markdown-script
markdownPrint('Hello, Markdown!')
```
~~~

To run a MarkdownUp script (`.bare`) from this package, use `bare -m` (Markdown text) or `bare -l`
(HTML). To view a MarkdownUp document (`.md` with `markdown-script` blocks), install the
[markdown-up](https://github.com/craigahobbs/markdown-up-py#readme) viewer or open the file in the
[MarkdownUp web app](https://craigahobbs.github.io/markdown-up/).


## Performance

The `make perf` target benchmarks the BareScript runtime with a suite of compute-intensive tests —
Mandelbrot set computation, Markdown parsing and rendering, QR code generation, Schema Markdown
parsing and validation, and URL encoding and decoding — and compares each test with an equivalent
native JavaScript program (using the
[markdown-model](https://www.npmjs.com/package/markdown-model) and
[schema-markdown](https://www.npmjs.com/package/schema-markdown) packages).

The following results are from `make perf PERF_MERGE=` (Node.js 24, Apple M-series). Times are the
best per-run timing in milliseconds per 1,000 runs. Multiples are relative to the native JavaScript
time. Tests without a native JavaScript equivalent are omitted.

| Test             | Language        | Time (ms) | Multiple |
| ---------------- | --------------- | --------: | -------: |
| markdownParse    | JavaScript      |     649.1 |          |
|                  | BareScript (JS) |    3020.0 |     4.7x |
| schemaParse      | JavaScript      |      72.5 |          |
|                  | BareScript (JS) |    1192.0 |    16.4x |
| urlDecode        | JavaScript      |       5.0 |          |
|                  | BareScript (JS) |      90.0 |    18.0x |
| urlEncode        | JavaScript      |       2.6 |          |
|                  | BareScript (JS) |      51.0 |    19.8x |
| markdownElements | JavaScript      |      32.7 |          |
|                  | BareScript (JS) |     737.0 |    22.5x |
| schemaValidate   | JavaScript      |      56.9 |          |
|                  | BareScript (JS) |    1936.0 |    34.0x |
| mandelbrot       | JavaScript      |    2037.3 |          |
|                  | BareScript (JS) |  305000.0 |   149.7x |


## Using BareScript with an AI Assistant

This repository ships a
[`SKILL.md`](https://github.com/craigahobbs/bare-script/blob/main/SKILL.md)
file that teaches an AI coding assistant how to write idiomatic BareScript — language syntax, the
built-in and include libraries, the MarkdownUp application pattern, and the unit-test conventions.
It is plain Markdown and applies to either BareScript implementation. Assistants that discover
`SKILL.md` at the repository root can use it without copying.

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
[markdown-up](https://github.com/craigahobbs/markdown-up-py#readme) viewer and point it at the Markdown file:

```
pip install markdown-up
markdown-up ticTacToe.md
```

The BareScript documentation is also published as plain Markdown, which can be fetched directly
into an assistant's context alongside `SKILL.md`:

- [The BareScript Language](https://craigahobbs.github.io/bare-script/language/README.md)
- [The BareScript Library](https://craigahobbs.github.io/bare-script/library/barescript-library.md)
- [The BareScript Library Models](https://craigahobbs.github.io/bare-script/library/barescript-library-model.md)
- [The BareScript Expression Library](https://craigahobbs.github.io/bare-script/library/barescript-expression-library.md)
- [The BareScript Runtime Model](https://craigahobbs.github.io/bare-script/model/barescript-model.md)

`SKILL.md` itself is published at <https://craigahobbs.github.io/bare-script/SKILL.md>, and
<https://craigahobbs.github.io/bare-script/llms.txt> indexes all of the fetchable documentation.


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

```
template-specialize javascript-template/template/ bare-script/ -k package bare-script -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
```
