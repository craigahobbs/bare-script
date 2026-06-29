---
name: barescript
description: Teaches a model how to write BareScript — language syntax, the built-in library, the include library, MarkdownUp client-rendered applications, and unit tests. Use this skill whenever the user asks you to write, read, modify, or review BareScript (`.bare`) code, a MarkdownUp Markdown application, a `markdown-script` code block, or any code that uses BareScript built-in functions (`array*`, `object*`, `string*`, `data*`, `markdownPrint`, `elementModelRender`, `drawNew`, etc.). Also use it when asked to write unit tests for BareScript code. Apply this skill even if the user does not say the word "BareScript" — recognize it from the `.bare` extension, the `markdown-script` fenced code block, or the function-naming style above.
---

# BareScript Skill

This file teaches a language model how to write correct, idiomatic
[BareScript](https://craigahobbs.github.io/bare-script/language/). It is plain
Markdown with concrete examples — any frontier model (Claude, GPT, Gemini,
Llama, …) can read it.

## When to use this skill

Use it whenever you write, modify, review, or debug BareScript — `.bare` files,
`markdown-script` fenced blocks, MarkdownUp apps, or their unit tests. Recognize
BareScript even when it isn't named: the `.bare` extension, `markdown-script`
code fences, function names like `arrayLength` / `objectGet` / `markdownPrint` /
`systemFetch`, or the `function:` … `endfunction` / `if:` … `endif` /
`for … in …:` … `endfor` block syntax.

## What BareScript is (one paragraph)

BareScript is a small, embeddable scripting language with Python-flavored
syntax. It runs in two implementations (JavaScript and Python) that share
100% of their test suite. There are no classes, no modules, no exceptions, no
imports — just functions, a literal-only data model (number, string, boolean,
null, array, object, datetime, regex, function), and ~200 library functions.
Long-running scripts can be executed in a synchronous interpreter; scripts
that do I/O (`systemFetch`, includes that fetch URLs) run in the async
interpreter and use `async function` declarations.

---

## 1. Language syntax (must-know)

### Statements end at newline

There are no semicolons. To continue a long statement onto the next line, end
the previous line with a backslash `\`:

```barescript
colors = [ \
    'red', \
    'green', \
    'blue' \
]
```

### Comments

`#` to end of line. **There are no block comments.**

```barescript
# This is a comment
x = 1  # Trailing comments are also fine
```

### Values

- `null`, `true`, `false` (special variables; cannot be reassigned)
- Numbers: integer, float, scientific (`1.5e10`), hex (`0xFF`)
- Strings: `'single'` or `"double"` — concatenate with `+`
- Arrays: `[1, 2, 3]`
- Objects: `{'name': 'Alice', 'age': 30}`
- Datetimes: produced by `datetimeNew(...)`, `datetimeISOParse(...)`, etc.
- Regex: produced by `regexNew('[0-9]+')`
- Functions are first-class values

### Variables and assignment

```barescript
x = 5
name = 'Alice'
items = [1, 2, 3]
```

Top-level assignments create globals. Assignments inside a `function` create
locals. Variable names with non-alphanumeric characters must be wrapped in
brackets: `[Height (ft)]`.

### **Critical: there is no bracket access for arrays/objects**

`obj['key']` and `arr[0]` are **NOT valid BareScript**. (Brackets are only used
for array *literals* and for variable names with special characters.) Always
use the library functions:

| You want…                 | Use this                          |
| ------------------------- | --------------------------------- |
| `arr[i]`                  | `arrayGet(arr, i)`                |
| `arr[i] = v`              | `arraySet(arr, i, v)`             |
| `obj['k']`                | `objectGet(obj, 'k')`             |
| `obj['k'] = v`            | `objectSet(obj, 'k', v)`          |
| `obj['k']` with default   | `objectGet(obj, 'k', defaultVal)` |
| check key existence       | `objectHas(obj, 'k')`             |
| array length              | `arrayLength(arr)`                |
| object keys               | `objectKeys(obj)`                 |

This is the single most common mistake when models write BareScript. **If you
catch yourself typing `[`, stop and check whether you mean a literal.**

### Control flow

Every block-opening statement ends with `:` and every block has an explicit
`endif` / `endwhile` / `endfor` / `endfunction`:

```barescript
if x < 0:
    y = -1
elif x > 0:
    y = 1
else:
    y = 0
endif

i = 0
while i < 10:
    i = i + 1
endwhile

for value in items:
    systemLog(value)
endfor

# With index
for value, ixValue in items:
    systemLog(ixValue + ': ' + value)
endfor

break       # exits the nearest while/for
continue    # next iteration of the nearest while/for
```

`jump label` / `jumpif (expr) label` / `label:` exist for hot loops but are
rarely used outside the standard library — prefer `while`/`for`.

### Functions

```barescript
function double(n):
    return n * 2
endfunction

# Async required if the body calls any async function (e.g., systemFetch,
# included libraries that fetch URLs). The closer is always `endfunction` —
# there is no separate `endasync` keyword.
async function fetchJson(url):
    return jsonParse(systemFetch(url))
endfunction
```

A function that calls **any** async function must itself be declared `async`.
Sync code cannot call async code.

`return` without an expression returns `null`. A function with no `return`
also returns `null`.

### The built-in `if(test, a, b)` expression function

This is special: only the chosen branch is evaluated.

```barescript
v = if(a == b, fn1(), fn2())
```

Use this for inline conditional values; use `if/elif/endif` for statements.

### Operators

Arithmetic: `+ - * / % **`
Comparison: `== != < <= > >=`
Logical: `&& ||` (short-circuit; `&&` returns left if falsy else right;
`||` returns left if truthy else right)
Bitwise: `& | ^ << >> ~`
Unary: `!` `-` `~`

`+` concatenates strings and coerces the other operand to string if either is
a string. Datetimes support `+ number` (milliseconds) and `datetime - datetime`
(milliseconds).

Operator on incompatible types returns `null`. **Library functions also return
`null` on invalid arguments** rather than raising.

### Truthiness

`if`, `&&`, `||`, `!`, and the `if(test, a, b)` expression function all use
the same boolean coercion. Falsy values:

- `null`
- `false`
- `0`
- `''` (empty string)
- `[]` (empty array)

Everything else is truthy — including the empty object `{}`.

This differs from JavaScript: empty arrays are **falsy** here. The practical
consequence: `if !arr:` is **not** equivalent to `if arr == null:` because the
former also triggers on `[]`. Only collapse `X == null` to `!X` when you can
prove `X` is either `null` or guaranteed-truthy (an object, or a string the
producer never returns as empty).

### Short-circuit evaluation

`&&`, `||`, and the `if(test, a, b)` expression function all short-circuit —
the unused branch is never evaluated:

```barescript
# regexMatch only runs when stringStartsWith returns true
m = stringStartsWith(s, '"') && regexMatch(quotedFieldRe, s)

# Equivalent using the if expression — same short-circuit behavior
m = if(stringStartsWith(s, '"'), regexMatch(quotedFieldRe, s))
```

Library functions don't short-circuit their arguments. Use the operators or
`if()` when you need to guard an expensive call behind a cheap predicate.

### Includes

```barescript
include 'util.bare'             # relative path (or URL)
include <unittest.bare>         # system include — resolved against the
                                 # interpreter's system-include prefix
```

`include` evaluates the file's top-level statements in the global scope,
making its functions available. The order matters: include before you call.
**`include` is idempotent** — a file's top-level statements run only the *first*
time it's included; re-`include`ing the same file is a safe no-op (it won't
re-run initializers or reset state).

In the CLI, non-URL paths read from the local filesystem; same for non-URL
`systemFetch` calls.

### Multiline statements

Use a trailing backslash. Common in object and array literals:

```barescript
person = { \
    'name': 'Alice', \
    'age': 30, \
    'city': 'New York' \
}
```

### What is NOT in the language

- No classes, no `new`, no `this`.
- No imports/modules — only `include`.
- No exceptions, no `try`/`catch`. Functions return `null` on bad input.
- No `++` / `--` / `+=` / compound assignment. Write `i = i + 1`.
- No bracket access (covered above — the most important "no").
- No string interpolation. Concatenate with `+`.
- No `for (i = 0; i < n; i = i + 1)` C-style loops — use `while` or `for in`.
- No destructuring, no spread.
- No `null` coalescing operator. Use `objectGet(obj, 'k', default)` or
  `if(x == null, default, x)`.

### Performance

These hold up when writing or optimizing any BareScript. Each is a starting
hypothesis, not a guarantee — a-priori estimates of perf impact are routinely
off by 5–10× in both directions, so measure a candidate against a baseline
before committing to it.

- **Prefer native built-ins over interpreted replacements.** `regexMatch`,
  `jsonStringify` / `jsonParse`, `arrayJoin`, `stringEncode` run in the host
  language; don't reimplement them as BareScript loops to "skip overhead."
  `jsonParse(jsonStringify(x))` deep-clones faster than a per-element
  `arrayCopy` loop.
- **Hoist loop invariants**, and split a loop on a function-arg invariant
  rather than re-checking it per iteration (`if variables != null:` outside,
  two specialized loop bodies inside, beats one body with a per-iter
  `if(variables != null, ...)`).
- **`systemBoolean(X)` inside an `if` is redundant** — `if` already coerces.
- **Precompute per-field metadata as tuples** (e.g. `[field, attr, isMarkdown]`)
  once before a row loop when the same metadata is read across many rows.
- **Per-row dispatch is expensive.** Pre-group by function so a
  `elif fn == 'sum': … elif fn == 'avg': …` chain runs once per group, not once
  per row. When dispatch is unavoidable, an inline `if`/`elif` chain beats a
  `for`-loop sweep over candidate keys — it drops the loop-variable bookkeeping
  and lets each branch assign a string literal directly (~25% on one inner loop).
- **For single-key / member dispatch, avoid `arrayGet(objectKeys(obj), 0)`** —
  it allocates a fresh keys array per call; use direct `objectGet(obj, 'key')`
  truthy chains. For "which alternation member of a regex matched," wrap each
  member as `(?<name>...)` at compile time and identify it with one
  `objectGet(match.groups, name)`; chain lazily
  (`x = !prev && objectGet(groups, 'x')`) so later lookups short-circuit once an
  earlier sibling matched.
- **`regexMatchAll` + an `ixSearch` index beats `while + regexMatch +
  stringSlice`** for iterating matches — one scan with a pointer vs a fresh
  re-scan each iteration — and it's the idiomatic form across the markdown
  includes. Caveat: with the
  `m` flag, `^` / `$` in inner patterns match true line boundaries in the
  `regexMatchAll` form (usually what you want).
- **Don't assume "precompute into a lookup map" is free** — an `objectGet` into
  a map can cost more than the work it replaces (e.g. a concat of string
  literals). Likewise, don't gate `regexMatch(re, line)` with `stringIndexOf`
  pre-checks; the engine fails fast on anchored mismatches, and the gate usually
  costs more than it saves.

---

## 2. The built-in library

All functions are global — no namespacing. Names are camelCase, grouped by
prefix. Library functions **validate arguments and return `null` on type
mismatch** (with a debug log if debug mode is on).

Full reference: <https://craigahobbs.github.io/bare-script/library/> — also
published as a single-page Markdown document that can be fetched directly into
context: <https://craigahobbs.github.io/bare-script/library/barescript-library.md>
(that one page documents **both** the built-in library here and the include
library in Section 3, with full signatures — fetch it whenever you need a
signature this skill doesn't spell out). What follows is what you need to
*recall the right name* without searching.

### Array (`array*`)

`arrayCopy(arr)` · `arrayDelete(arr, i)` · `arrayExtend(arr, other)` ·
`arrayFlat(arr, depth?)` · `arrayGet(arr, i)` ·
`arrayIndexOf(arr, value, start?)` · `arrayJoin(arr, sep)` ·
`arrayLastIndexOf(arr, value, start?)` · `arrayLength(arr)` ·
`arrayNew(values...)` · `arrayNewSize(size, fill?)` · `arrayPop(arr)` ·
`arrayPush(arr, values...)` · `arrayReverse(arr)` · `arraySet(arr, i, v)` ·
`arrayShift(arr)` · `arraySlice(arr, start?, end?)` · `arraySort(arr, cmp?)`

```barescript
nums = [3, 1, 4, 1, 5]
arrayPush(nums, 9, 2, 6)
sorted = arraySort(arrayCopy(nums))     # don't mutate the original
first  = arrayGet(sorted, 0)
```

**An out-of-range index to `arrayGet` / `arraySet` is an *invalid argument*, not
a free `null`.** Unlike `objectGet` (which takes a default and quietly returns it
for a missing key), an index `>= arrayLength(arr)` returns `null` and **emits a
debug log** in debug mode — so you can't use `arrayGet` to "peek" at an optional
trailing element. Guard the length, and let short-circuiting skip the read:

```barescript
desc = arrayGet(sort, 1)                          # BAD: logs when sort is just [field]
desc = if(arrayLength(sort) >= 2, arrayGet(sort, 1))   # GOOD: null when absent
```

Prefer `if()` when *binding the optional value to a variable* — a missing
element becomes `null`, the natural "absent" value. `&&` works too
(`arrayLength(sort) >= 2 && arrayGet(sort, 1)`) but yields `false` rather than
`null` for the short tuple, so reserve it for feeding a boolean test. This is
the array analog of guarding with `objectHas` before a no-default `objectGet`.

### Object (`object*`)

`objectAssign(target, source)` · `objectCopy(obj)` · `objectDelete(obj, k)` ·
`objectGet(obj, k, default?)` · `objectHas(obj, k)` · `objectKeys(obj)` ·
`objectNew(k1, v1, ...)` · `objectSet(obj, k, v)`

Iterate keys with `for`:

```barescript
for key in objectKeys(obj):
    systemLog(key + ' = ' + objectGet(obj, key))
endfor
```

### String (`string*`)

`stringCharAt(s, i)` · `stringCharCodeAt(s, i)` · `stringDecode(bytes)` ·
`stringEncode(s)` · `stringEndsWith(s, suffix)` · `stringFromCharCode(...)` ·
`stringIndexOf(s, sub, start?)` · `stringLastIndexOf(s, sub, start?)` ·
`stringLength(s)` · `stringLower(s)` · `stringNew(value)` ·
`stringRepeat(s, n)` · `stringReplace(s, find, replace)` ·
`stringSlice(s, start, end?)` · `stringSplit(s, sep)` ·
`stringSplitLines(s)` · `stringStartsWith(s, prefix)` · `stringTrim(s)` ·
`stringUpper(s)`

There is **no string interpolation**. Use `+`:

```barescript
greeting = 'Hello, ' + name + '! You are ' + age + ' years old.'
```

### Number (`number*`)

`numberParseFloat(s)` · `numberParseInt(s, radix?)` ·
`numberToFixed(n, decimals?, trimZeros?)` · `numberToString(n)`

### Math (`math*`)

`mathAbs` · `mathAcos` · `mathAsin` · `mathAtan` · `mathAtan2(y, x)` ·
`mathCeil` · `mathCos` · `mathE()` · `mathFloor` · `mathLn` · `mathLog(x, base?)` ·
`mathMax(...)` · `mathMin(...)` · `mathPi()` · `mathRandom()` · `mathRound` ·
`mathSign` · `mathSin` · `mathSqrt` · `mathTan`

### Regex (`regex*`)

`regexEscape(s)` · `regexMatch(re, s)` · `regexMatchAll(re, s)` ·
`regexNew(pattern, flags?)` · `regexReplace(re, s, replace)` ·
`regexSplit(re, s)`

Regex literals are not part of the syntax — always call `regexNew(...)`.
`regexMatch` returns `null` on no match, otherwise `{'index': N, 'input': s,
'groups': {'0': '...', '1': '...'}}` — `groups` holds every capture by numeric
string key, plus any `(?<name>...)` group under its name.

### JSON (`json*`)

`jsonParse(text)` · `jsonStringify(value, indent?)`

### Datetime (`datetime*`)

`datetimeDay` · `datetimeHour` · `datetimeISOFormat(dt, isDate?)` ·
`datetimeISOParse(s)` · `datetimeMillisecond` · `datetimeMinute` ·
`datetimeMonth` · `datetimeNew(year, month, day, hour?, min?, sec?, ms?)` ·
`datetimeNow()` · `datetimeSecond` · `datetimeToday()` · `datetimeYear`

Add/subtract milliseconds: `tomorrow = today + 86400000`.

### URL (`url*`)

`urlEncode(s)` · `urlEncodeComponent(s)`

### Schema (`schema*`) — Schema Markdown

`schemaParse(line1, line2, ...)` · `schemaParseEx(lines, types?, filename?)` ·
`schemaTypeModel()` · `schemaValidate(types, typeName, value)` ·
`schemaValidateTypeModel(types)`

### System (`system*`)

`systemBoolean(v)` · `systemCompare(a, b)` · `systemFetch(url|request|urls)` ·
`systemGlobalGet(name, default?)` · `systemGlobalSet(name, value)` ·
`systemIs(a, b)` · `systemLog(msg)` · `systemLogDebug(msg)` ·
`systemPartial(fn, args...)` · `systemType(v)`

`systemFetch` is the **only** I/O primitive — and it's async. Any function
that calls it (directly or transitively) must be `async`.

```barescript
async function loadDocs():
    return jsonParse(systemFetch('https://example.com/data.json'))
endfunction
```

`systemType` returns one of `'null'`, `'boolean'`, `'number'`, `'string'`,
`'datetime'`, `'array'`, `'object'`, `'function'`, `'regex'`.

### BareScript (`barescript*`)

`barescriptParseExpression(text)` · `barescriptEvaluateExpression(expr, globals?)`

Use these to evaluate user-authored formula expressions (e.g. for a
spreadsheet-style data filter).

---

## 3. The include library (`include <name.bare>`)

Pure-BareScript libraries that ship with the package. Always include before
calling. Every include function — full signatures and option shapes — is in the
single-page Markdown reference
(<https://craigahobbs.github.io/bare-script/library/barescript-library.md>);
fetch it for any signature the table below doesn't spell out, rather than reading
the `.bare` source. Each include is also documented at
<https://craigahobbs.github.io/bare-script/include/>.

| Include | Purpose | Key functions |
| --- | --- | --- |
| `args.bare` | Parse MarkdownUp URL args, build links | `argsParse`, `argsLink`, `argsURL`, `argsValidate`, `argsHelp` |
| `data.bare` | Tabular data manipulation | `dataParseCSV`, `dataFilter`, `dataSort`, `dataAggregate`, `dataJoin`, `dataCalculatedField`, `dataTop`, `dataValidate` |
| `dataTable.bare` | Render data array as Markdown table | `dataTable`, `dataTableMarkdown`, `dataTableElements`, `dataTableValidate` |
| `dataLineChart.bare` | Render line charts as SVG | `dataLineChart`, `dataLineChartElements`, `dataLineChartValidate` |
| `diff.bare` | Line diff between strings/arrays | `diffLines` |
| `draw.bare` | Imperative SVG drawing | `drawNew`, `drawRect`, `drawCircle`, `drawEllipse`, `drawLine`, `drawMove`, `drawClose`, `drawPathRect`, `drawArc`, `drawText`, `drawTextStyle`, `drawTextWidth`, `drawTextHeight`, `drawImage`, `drawStyle`, `drawOnClick`, `drawWidth`, `drawHeight`, `drawHLine`, `drawVLine`, `drawRender`, `drawElements` |
| `elementModel.bare` | Validate / stringify element models | `elementModelValidate`, `elementModelToString` |
| `forms.bare` | Form-control element-model helpers | `formsTextElements`, `formsLinkElements`, `formsLinkButtonElements` |
| `markdown.bare` | Markdown utilities | `markdownEscape`, `markdownHeaderId`, `markdownTitle`, `markdownParagraphText`, `markdownValidate` |
| `markdownParser.bare` | Markdown text → Markdown model | `markdownParse` |
| `markdownElements.bare` | Markdown model → element model | `markdownElements`, `markdownElementsAsync` |
| `markdownHighlight.bare` | Code-block syntax highlighting | `markdownHighlightElements`, `markdownHighlightCodeBlockElements`, `markdownHighlightCodeBlockElementsAsync`, `markdownHighlightCompileHighlightModels` |
| `markdownUp.bare` | Stub implementations of the MarkdownUp runtime functions. **Loaded automatically by `bare -m` / `-l`; never `include` it yourself** — see Section 4. | `markdownPrint`, `elementModelRender`, `documentSetTitle`, `documentInputValue`, `documentURL`, `documentSetFocus`, `documentSetKeyDown`, `documentSetReset`, `documentFontSize`, `windowWidth`, `windowHeight`, `windowKeyState`, `windowPlaySound`, `windowSetLocation`, `windowSetResize`, `windowSetTimeout`, `windowURLObject`, `windowClipboardRead`, `windowClipboardWrite`, `localStorageGet/Set/Remove/Clear`, `sessionStorageGet/Set/Remove/Clear` |
| `pager.bare` | Multi-page MarkdownUp app shell | `pagerMain`, `pagerValidate` |
| `qrcode.bare` | Render QR codes | `qrcodeDraw`, `qrcodeElements`, `qrcodeMatrix` |
| `schemaDoc.bare` | Schema-markdown documentation app | `schemaDocMain`, `schemaDocMarkdown` |
| `unittest.bare` | Unit-test framework | `unittestRunTest`, `unittestEqual`, `unittestDeepEqual`, `unittestCoverageStart`, `unittestCoverageStop`, `unittestReport` |
| `unittestMock.bare` | Mock library functions during tests | `unittestMockAll`, `unittestMockOne`, `unittestMockOneGeneric`, `unittestMockEnd` |
| `baredoc.bare` / `baredocCLI.bare` | Generate library model JSON from doc comments | `baredocMain`, `baredocCLIMain` |

### `data.bare` quick examples

```barescript
include <data.bare>

rows = [ \
    {'name': 'Alice', 'age': 30, 'city': 'NY'}, \
    {'name': 'Bob',   'age': 25, 'city': 'BOS'}, \
    {'name': 'Cara',  'age': 35, 'city': 'NY'} \
]

# Filter rows using an expression evaluated against each row
adults = dataFilter(rows, 'age >= 30')

# Sort: array of [field, descending?] pairs
sorted = dataSort(rows, [['city', false], ['age', true]])

# Add a calculated field IN PLACE
dataCalculatedField(rows, 'label', 'name + " (" + city + ")"')

# Aggregate (categories = group-by; measures = aggregations)
summary = dataAggregate(rows, { \
    'categories': ['city'], \
    'measures': [ \
        {'field': 'age', 'function': 'average', 'name': 'avgAge'}, \
        {'field': 'age', 'function': 'count',   'name': 'n'} \
    ] \
})

# Join two data arrays on a shared key
cities = [{'city': 'NY', 'state': 'NY'}, {'city': 'BOS', 'state': 'MA'}]
joined = dataJoin(rows, cities, 'city')
```

### `draw.bare` quick example

```barescript
include <draw.bare>

drawNew(400, 300)
drawStyle('black', 2, '#88ccff')
drawRect(20, 20, 360, 260)
drawTextStyle(24, 'black', true)
drawText('Hello', 200, 150)
drawRender()                # prints SVG via markdownPrint in MarkdownUp
```

### `elementModel.bare`: element models

Element models are plain BareScript objects shaped like:

```barescript
{ \
    'html': 'div',                              # or 'svg': '...' for SVG
    'attr': {'id': 'main', 'class': 'box'}, \   # optional attributes
    'elem': [ \                                 # children: object | array | {'text': '...'}
        {'html': 'h1', 'elem': {'text': 'Hi'}}, \
        {'html': 'p',  'elem': {'text': 'World'}} \
    ], \
    'callback': {'click': onClickFn} \          # optional event handlers
}
```

Render with `elementModelRender(model)` (MarkdownUp), or stringify with
`elementModelToString(model)` for use as raw HTML/SVG.

**Event callbacks receive event-specific arguments.** At event time MarkdownUp
*appends* arguments to a `callback` handler, after any you bound with
`systemPartial`:

- **a click whose target is an SVG element** → four numbers `x, y, width,
  height`: the click point *relative to the SVG's top-left corner*, plus the
  SVG's rendered width and height. A plain HTML click appends nothing.
- **`keydown` / `keypress` / `keyup`** → the numeric `keyCode`.

Best practice: **`systemPartial`-bind every parameter the handler declares**, so
the appended event args fall onto no parameter and are ignored — write
`systemPartial(onClick, args, id, 'delete')` for `onClick(args, id, action)`, not
`systemPartial(onClick, args, id)`, which lets the click's `x` arrive as
`action` — a string parameter silently becomes an integer like `14`, or a flag
parameter becomes truthy. The exception is a handler that *wants* the event arg:
`forms.bare`'s `formsTextOnKeyup(onEnter, keyCode)` binds `onEnter` and leaves
`keyCode` for the event.

---

## 4. MarkdownUp client-rendered applications

[MarkdownUp](https://craigahobbs.github.io/markdown-up/) is a Markdown viewer
that executes BareScript embedded in fenced `markdown-script` code blocks. A
MarkdownUp app is a Markdown file plus one or more `.bare` files.

### Minimum app

**app.md**

````markdown
~~~ markdown-script
include 'app.bare'
~~~
````

**app.bare**

```barescript
function appMain():
    documentSetTitle('Hello App')
    markdownPrint('# Hello, MarkdownUp!', '')

    i = 0
    while i < 5:
        markdownPrint('- Item ' + (i + 1))
        i = i + 1
    endwhile
endfunction

appMain()
```

### The runtime functions you have

When code runs inside MarkdownUp, these "document" / "window"
/ "storage" functions are provided by the runtime:

- **Output:** `markdownPrint(line1, line2, ...)` — print Markdown lines
  (empty string = blank line / paragraph break);
  `elementModelRender(model)` — render an element model.
- **Document:** `documentSetTitle(s)`, `documentURL(url)`,
  `documentInputValue(id)`, `documentFontSize()`, `documentSetFocus(id)`,
  `documentSetKeyDown(fn)`, `documentSetReset(id)`.
- **Window:** `windowWidth()`, `windowHeight()`, `windowSetLocation(url)`,
  `windowSetResize(fn)`, `windowSetTimeout(fn, ms)`, `windowURLObject(url)`,
  `windowClipboardRead()`, `windowClipboardWrite(s)`,
  `windowKeyState(code, ctrl?, shift?, alt?, meta?)`,
  `windowPlaySound(name)`.
- **Storage:** `localStorageGet/Set/Remove/Clear`, `sessionStorageGet/Set/Remove/Clear`.

Notes on a few of these:

- `documentSetKeyDown(fn)` — the event passed to `fn` carries `.key` (the
  logical key, e.g. `'r'` or `'ArrowLeft'`), `.code` (the physical key,
  e.g. `'KeyR'` or `'ArrowLeft'`), `.keyCode` (legacy numeric code), `.repeat`
  (true while the key auto-repeats), `.location`, and `.ctrlKey` / `.shiftKey` /
  `.altKey` / `.metaKey`.
- `documentSetReset(id)` — tells the runtime to clear everything below the
  element with this id before the next re-render. Pair with an invisible
  `<div>` you render once so the MarkdownUp menu DOM stays stable while
  your canvas repaints (see the Animation apps section below).
- `windowKeyState(code, ...)` — *polls* the current keyboard state for a
  physical key (e.g. `'ArrowLeft'`, `'Space'`, `'KeyR'`). For game /
  animation loops, polling inside the tick is preferable to a
  `documentSetKeyDown` handler — see gotcha #5 below.
- `windowWidth()` / `windowHeight()` return the **full window size** (not a
  reduced content area). MarkdownUp's stylesheet puts a **1.5em border around the
  document body**, so a drawing sized to the full window overflows it and the page
  scrolls. To fit exactly, subtract the border — 1.5em each side, i.e.
  `3 * documentFontSize()` — from each dimension:
  `width = windowWidth() - 3 * documentFontSize()` (and likewise for height).
- `windowPlaySound(name)` — built-in SFX, sourced from `markdownUp.bare`:
  - **UI:** `beep`, `click`, `error`, `success`, `warning`
  - **Arcade:** `coin`, `jump`, `laser`, `explosion`, `powerup`,
    `powerdown`, `hit`, `blip`, `gameover`
  - **Notes:** `noteC4` … `noteC5` (including sharps `noteCs4`,
    `noteDs4`, `noteFs4`, `noteGs4`, `noteAs4`)
  - **Drums:** `drumKick`, `drumSnare`, `drumHihat`, `drumOpenhat`,
    `drumTomLow/Mid/High`, `drumClap`, `drumCrash`, `drumRide`

In the browser, MarkdownUp itself provides these functions. Under the plain
`bare` CLI, pass `-m` (or `-l` for HTML output) and the CLI **automatically
prepends `include <markdownUp.bare>` for you** — a small library of stub
implementations:

```sh
bare -m app.bare          # run the app, output Markdown text
bare -l app.bare          # run the app, output an HTML document
bare -m -x app.bare       # lint / static-analyze a MarkdownUp app
```

> ⚠ **Never write `include <markdownUp.bare>` yourself** — not in app code,
> test code, or `include`d helpers. In the real browser runtime these
> functions are built-in, and the include would **overwrite them with the
> logging stubs**, silently turning rendering into call-recording. Under
> `bare -m` / `-l` (and unit tests) the CLI already prepends it for you, so
> a manual include is at best redundant. Either way it's wrong.

In tests, the stubs let you assert what the app *would have rendered*.

### URL arguments with `args.bare`

```barescript
include <args.bare>

arguments = [ \
    {'name': 'name',  'default': 'World'}, \
    {'name': 'count', 'type': 'int', 'default': 3} \
]

function appMain():
    args  = argsParse(arguments)
    name  = objectGet(args, 'name')
    count = objectGet(args, 'count')

    documentSetTitle('Hello ' + name)
    markdownPrint('# Hello, ' + markdownEscape(name) + '!', '')

    i = 0
    while i < count:
        markdownPrint('- Greeting ' + (i + 1))
        i = i + 1
    endwhile

    # Links that round-trip current args, overriding 'count'
    markdownPrint( \
        '', argsLink(arguments, 'More', {'count': count + 1}), \
        '', argsLink(arguments, 'Less', {'count': count - 1}), \
        '', argsLink(arguments, 'Reset', null, true) \
    )
endfunction

appMain()
```

### Interactive forms with `forms.bare`

```barescript
include <args.bare>
include <forms.bare>

arguments = [{'name': 'value', 'default': ''}]

function appMain():
    args = argsParse(arguments)
    documentSetTitle('Echo')

    markdownPrint('# Echo', '')
    elementModelRender(formsTextElements('input', objectGet(args, 'value'), 30, onEnter))
    markdownPrint('', 'You typed: ' + markdownEscape(objectGet(args, 'value')))
endfunction

function onEnter():
    value = documentInputValue('input')
    windowSetLocation(argsURL(arguments, {'value': value}))
endfunction

appMain()
```

### Multi-page apps with `pager.bare`

```barescript
include <pager.bare>

function pageHello(args):
    markdownPrint('# Hello', '', 'On the Hello page.')
endfunction

function pageAbout(args):
    markdownPrint('# About', '', 'This is an example.')
endfunction

pagerMain({ \
    'pages': [ \
        {'name': 'Hello', 'type': {'function': {'function': pageHello}}}, \
        {'name': 'About', 'type': {'function': {'function': pageAbout}}} \
    ] \
})
```

### Animation apps (the tick pattern)

Animation in MarkdownUp is a tick function that runs every N ms and
reschedules itself via `windowSetTimeout`. Two non-obvious pieces make it
work cleanly:

- **An invisible "reset anchor" `<div>` rendered once + `documentSetReset(id)`
  before each redraw.** Without it, the SVG fights the MarkdownUp burger
  menu on every redraw. With it, the runtime preserves everything up to the
  anchor element and replaces only what's below — so the menu DOM stays
  stable while the canvas repaints.
- **Polled input via `windowKeyState`**, *not* `documentSetKeyDown`. See
  gotcha #5 below: a keydown handler that doesn't itself call
  `windowSetTimeout` silently kills the animation loop on the next
  keypress.

A minimal skeleton:

```barescript
include <draw.bare>

appAnchorId = 'app-anchor'
appTickMs = 50
appState = {'x': 100, 'spaceWasDown': false}


function appMain():
    documentSetTitle('Animated')
    elementModelRender([{'html': 'div', 'attr': {'id': appAnchorId, 'style': 'display: none;'}}])
    appRenderAndSchedule()
endfunction


function appRenderAndSchedule():
    documentSetReset(appAnchorId)
    appDraw()
    windowSetTimeout(appTick, appTickMs)
endfunction


function appTick():
    # Continuous: held-down motion
    if windowKeyState('ArrowRight'):
        objectSet(appState, 'x', objectGet(appState, 'x') + 2)
    endif
    # Edge-triggered: fire only on rising edge of Space
    spaceNow = windowKeyState('Space')
    if spaceNow && !objectGet(appState, 'spaceWasDown'):
        windowPlaySound('laser')
    endif
    objectSet(appState, 'spaceWasDown', spaceNow)
    appRenderAndSchedule()
endfunction


function appDraw():
    drawNew(200, 200)
    drawStyle('#000', 0, '#000')
    drawRect(0, 0, 200, 200)
    drawStyle('#0f0', 0, '#0f0')
    drawRect(objectGet(appState, 'x'), 100, 20, 20)
    drawRender()
endfunction
```

For apps that need to survive a hamburger toggle or hash-param change
(which tear down all BareScript globals), persist the state object with
`sessionStorageSet(key, jsonStringify(appState))` at the end of each tick
and restore it in `appMain` — Tunguska is the canonical example. Version
the saved blob so a schema change ignores stale saves rather than
producing partial state.


### MarkdownUp gotchas

1. **Always escape user input** (URL args, fetched data, anything string-y)
   with `markdownEscape` before `markdownPrint`. Markdown is rendered as HTML;
   unescaped `<` and `&` will produce broken output or XSS.
2. **Anything that calls `systemFetch` must be `async`**, including event
   handlers wired through `forms.bare` callbacks.
3. **`markdownPrint(a, b)` with no empty-string separator** prints `a` and `b`
   on consecutive lines — same paragraph in Markdown. Pass `''` between them
   to force a paragraph break.
4. The MarkdownUp runtime is single-threaded — there is no
   coroutine cancellation. Long synchronous loops will freeze the UI.
   For animation, schedule with `windowSetTimeout(fn, ms)`.
5. **MarkdownUp cancels the pending `windowSetTimeout` at the end of every
   script invocation.** After a `documentSetKeyDown` handler, a
   `windowSetResize` handler, or any other event callback returns, the
   runtime clears whatever timer was armed *before* the callback ran and
   only re-installs one if **this** invocation called
   `windowSetTimeout(...)`. Practical consequence: a `documentSetKeyDown`
   handler that doesn't itself reschedule will silently kill an animation
   loop on the next keypress. The safest pattern for game / animation apps
   is to poll all input via `windowKeyState` **inside the tick** and skip
   `documentSetKeyDown` entirely — the tick is then the only invocation
   that runs, and it always reschedules itself.
6. **Element-model event callbacks get extra trailing args** — SVG-element
   clicks append `(x, y, width, height)` and key events append `keyCode` (see
   Section 3). `systemPartial`-bind every parameter the handler declares so those args
   land on none of them; an under-bound handler silently reads a coordinate (or
   keyCode) as its own data.

### Real-world example applications

Complete, working MarkdownUp apps to study — each is a single `.bare` file
exercising the patterns above. Grouped by what they demonstrate (full gallery:
<https://craigahobbs.github.io/MarkdownUpApplications.md>):

**Canvas drawing & animation (`draw.bare`)**

- **Mandelbrot Set Explorer** — fractal rendering, zoom/pan via URL args.
  [App](https://craigahobbs.github.io/mandelbrot/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/mandelbrot/mandelbrot.bare)
- **Conway's Game of Life** — `windowSetTimeout` animation loop with
  `forms.bare` controls.
  [App](https://craigahobbs.github.io/life/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/life/life.bare)
- **Chaos Balls** — animated bouncing-ball physics; `forms.bare` +
  `schemaDoc.bare` settings.
  [App](https://craigahobbs.github.io/chaosBalls/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/chaosBalls/chaosBalls.bare)
- **Color Ramp** — color-space drawing driven by form controls.
  [App](https://craigahobbs.github.io/color-ramp/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/color-ramp/colorRamp.bare)
- **The Fruit Fly Trap Maker** — generates a printable diagram from inputs.
  [App](https://craigahobbs.github.io/fruit-fly-trap/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/fruit-fly-trap/fruit-fly-trap.bare)
- **Happy Holidays!** — a seasonal greeting drawing; custom message via URL
  arg, full-screen mode, redraws on resize.
  [App](https://craigahobbs.github.io/happy-holidays/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/happy-holidays/happy-holidays.bare)
- **Snack Attack** — a Galaxian-like arcade game; `windowSetTimeout` game loop,
  `windowKeyState` input, `windowPlaySound` effects, and title/play/game-over
  screens with full-window `drawNew`.
  [App](https://craigahobbs.github.io/snackAttack/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/snackAttack/snackAttack.bare)
- **Tunguska Event Simulation** — the largest example (~1200 lines), a pure
  `draw.bare` simulation.
  [App](https://craigahobbs.github.io/tunguska/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/tunguska/tunguska.bare)

**Data dashboards (`data.bare` + `dataTable.bare` / `dataLineChart.bare`, often `pager.bare`)**

- **Solar Dashboard** — multi-page dashboard of fetched data; charts + tables.
  [App](https://craigahobbs.github.io/solar/) ·
  [Source](https://github.com/craigahobbs/solar/blob/main/solar.bare)
- **Sunrise Dashboard** — sunrise/sunset-time dashboard; pager + charts + tables.
  [App](https://craigahobbs.github.io/sunrise/) ·
  [Source](https://github.com/craigahobbs/sunrise/blob/main/sunrise.bare)
- **Day Hikes Dashboard** — multi-page hike data with charts and tables.
  [App](https://craigahobbs.github.io/day-hikes/) ·
  [Source](https://github.com/craigahobbs/day-hikes/blob/main/dayHikes.bare)
- **Money** — financial-data dashboard; pager + charts + `schemaDoc.bare`.
  [App](https://craigahobbs.github.io/money/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/money/money.bare)
- **Package Downloads Dashboard** — package download stats as charts/tables.
  [App](https://craigahobbs.github.io/downloads/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/downloads/downloads.bare)
- **npm Dependency Explorer** — fetches and aggregates the npm registry;
  `forms.bare`-driven.
  [App](https://craigahobbs.github.io/npm-dependency-explorer/) ·
  [Source](https://github.com/craigahobbs/npm-dependency-explorer/blob/main/npmDependencyExplorer.bare)

**Forms, widgets & documentation viewers (`forms.bare`, `schemaDoc.bare`)**

- **QR Code** — generates QR codes with `qrcode.bare` + `elementModel.bare`.
  [App](https://craigahobbs.github.io/qrcode/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/qrcode/qrcodeApp.bare)
- **Emoji** — searchable emoji table; `forms.bare` + `dataTable.bare`.
  [App](https://craigahobbs.github.io/emoji/) ·
  [Source](https://github.com/craigahobbs/craigahobbs.github.io/blob/main/emoji/emoji.bare)
- **The Hobbs Family Cookbook** — a "Markdown book" reader app.
  [App](https://craigahobbs.github.io/hobbs-family-cookbook/) ·
  [Source](https://github.com/craigahobbs/hobbs-family-cookbook/blob/main/markdownBook.bare)
- **BareScript Library Documentation Viewer** — renders library JSON docs with
  `schemaDoc.bare` + `markdown.bare` (this skill's own library reference).
  [App](https://craigahobbs.github.io/bare-script/library/) ·
  [Source](https://github.com/craigahobbs/bare-script/blob/main/lib/include/baredoc.bare)
- **Chisel Documentation Viewer** — smallest example (~90 lines): renders API
  schema docs via `schemaDoc.bare`.
  [App](https://craigahobbs.github.io/chisel/example/#var.vName='chisel_doc_request') ·
  [Source](https://github.com/craigahobbs/chisel/blob/main/src/chisel/static/chiselDoc.bare)

---

## 5. Unit testing BareScript

### Layout

```
myapp/
├── app.bare
└── test/
    ├── runTests.md          # entry point for MarkdownUp / browser
    ├── runTests.bare        # entry point for `bare -m`
    └── testApp.bare
```

### `test/runTests.md`

````markdown
~~~ markdown-script
include 'runTests.bare'
~~~
````

### `test/runTests.bare`

```barescript
include <unittest.bare>
include <unittestMock.bare>     # only if you need mocking

unittestCoverageStart()

include 'testApp.bare'

unittestCoverageStop()

return unittestReport({'coverageMin': 100})
```

`unittestReport({'coverageMin': N})` **fails the run when coverage falls below
the floor**, separately from assertion failures — so "every assertion passed"
and "the suite is green" are two different checks. A new branch (an added
`if`/`elif`, a new `objectGet` default path) with no fixture that exercises it
turns the suite red on coverage even when every test passes; new code paths
need new tests. (Pass `'coverageExclude': ['runTests.bare']` to drop the runner
itself from the denominator.)

Reaching a 100% floor, in practice:

- **Coverage is statement-level, not branch-level.** A *line* that never runs is
  missing; an unevaluated arm of an `if(test, a, b)` *expression* is not (both
  arms are one statement). So you need a fixture per `if:` / `elif:` *body*, per
  loop body, and per early `return` — but not per `if()` arm.
- **The summary table gives per-file counts, not line numbers** (`unittestCoverageData()`
  returns the same summary) — but a per-script details page highlights the
  *uncovered statements* in red, and you can render it straight from the CLI, no
  browser: `bare -l test/runTests.bare -v vUnittestScript "'app.bare'"`, then read
  (or `grep`) the HTML — uncovered lines are wrapped in a `background-color: #f08080`
  span. Pass the script name **exactly as it appears in the coverage table** (e.g.
  `app.bare`, not `../app.bare`); a mismatched name silently renders "No data".
  Far faster than reasoning about which bodies no test reaches.
- **Keep coverage deterministic** so the floor can't flake — pin anything random.
  For an animation/game, one end-to-end playthrough with `mathRandom` mocked
  (`unittestMockOne('mathRandom', …)`), a fixed seed, and scripted `windowKeyState`
  input covers in-context paths that isolated unit tests miss, identically every run.

### `test/testApp.bare` — basic assertions

```barescript
include <unittest.bare>          # so the file lints standalone (see below)
include '../app.bare'

function testAddNumbers():
    unittestEqual(addNumbers(1, 2), 3)
    unittestEqual(addNumbers(0, 0), 0)
endfunction
unittestRunTest('testAddNumbers')

function testFlatten():
    unittestDeepEqual( \
        flatten([[1, 2], [3, [4, 5]]]), \
        [1, 2, 3, 4, 5] \
    )
endfunction
unittestRunTest('testFlatten')
```

Use `unittestEqual` for primitives and identity, `unittestDeepEqual` for
arrays and objects. Both log a failure and continue; `unittestReport` totals
them up.

**Each test file must itself `include <unittest.bare>`** (and `<unittestMock.bare>`
if it mocks) **plus the module(s) it tests** — even though the runner includes
them too. The project lint `bare -x -m *.bare test/*.bare` static-analyzes *each
file independently*, so a test file that relies on the runner for
`unittestRunTest` / `unittestEqual` fails with `Undefined function`. Because
`include` is idempotent (Section 1), the runner re-including them is harmless.

### Running tests

```sh
bare -m test/runTests.bare        # exits non-zero on any failure
bare -m -x test/runTests.bare     # lint + run (lint warnings printed alongside test results)
bare -d -m test/runTests.bare     # debug mode — surfaces builtin debug logs (see below)
bare -x -m *.bare test/*.bare     # the standard project lint: every file, standalone
bare -m test/runTests.bare -v vUnittestTest "'testName'"   # run only one test by name
```

Running a single test (`vUnittestTest`) is the way to **isolate a hang**: the
report prints all results in one batch at the very end, so a suite that hangs
shows *no test output at all* (it isn't "stuck before the first test" — it's stuck
in some test). Re-run each suspect test by name to find the culprit.

`-m` automatically prepends `include <markdownUp.bare>` — your test code must
not include it itself (see Section 4).

Tests usually run in **debug mode** (`bare -d -m …`, e.g. via `make test`), which
prints a builtin's debug log whenever it's handed an invalid argument — most often
an out-of-range `arrayGet` / `arraySet` index (Section 2). A clean suite has
**zero** such lines, so a test that quietly triggers one is a defect to fix even
though assertions pass. Check with
`bare -d -m test/runTests.bare 2>&1 | grep "failed with error"`.

### Mocking the MarkdownUp runtime

`markdownPrint`, `documentSetTitle`, `systemFetch`, `windowSetLocation`, etc.
all have side effects you don't want in unit tests.
[unittestMock.bare](https://craigahobbs.github.io/bare-script/include/)
intercepts every library function and records calls.

```barescript
include <unittest.bare>
include <unittestMock.bare>
include '../app.bare'

function testAppMain():
    unittestMockAll()

    appMain()

    unittestDeepEqual( \
        unittestMockEnd(), \
        [ \
            ['documentSetTitle', ['Hello App']], \
            ['markdownPrint', ['# Hello, MarkdownUp!', '']], \
            ['markdownPrint', ['- Item 1']], \
            ['markdownPrint', ['- Item 2']] \
        ] \
    )
endfunction
unittestRunTest('testAppMain')
```

Patterns:

- **`unittestMockAll(data?)` at the top of the test** — mocks every MarkdownUp
  runtime function and `systemFetch`/`systemLog`. Each call is recorded as
  `[name, [args...]]`. The optional `data` argument supplies per-function
  mock inputs; the two supported keys are:
  - `'documentInputValue'`: object mapping input element id → value
  - `'systemFetch'`: object mapping URL → response text
  Example: `unittestMockAll({'systemFetch': {'data.json': '{"a": 1}'}})`.
  `systemFetch` also accepts an **array** of URLs and returns an array of
  responses (a batched, parallel fetch), recorded as
  `['systemFetch', [[url1, url2]]]`. Calling `systemFetch` with an empty array
  succeeds and returns `[]`, so consider guarding with `if arrayLength(urls):`
  before fetching to skip a wasted no-op call.
- **`unittestMockOne(funcName, mockFunc)`** — replace one library function
  with `mockFunc` (a function value). `mockFunc` is called instead of the
  real implementation; its return value is what callers see. The call is
  also recorded.
- **`unittestMockOneGeneric(funcName)`** — record-only mock; calls return
  `null`. Useful for side-effect-only functions.
- **`unittestMockEnd()` returns the recorded call log** as an array of
  `[name, [args...]]` entries, and stops mocking.

### Test conventions used in this repo

- One test function per behavior, named `test<Subject><Behavior>`.
- Last line of each test is `unittestRunTest('testName')` — the runner picks
  it up by name.
- Async tests use `async function` and the runner awaits them.
- For functions with side effects, **always** `unittestMockAll()` and assert
  on the call log — do not mock partially.
- **Reset the globals a test sets.** Apps read URL args from `v<Name>` globals
  (`systemGlobalSet('vName', 'x')`); a test that sets them should set each back
  to `null` at the end so state never leaks into the next test. Prefer
  unsetting exactly what the test set over a blanket "clear everything" helper.

### Builtin debug logs are NOT mockable

When a builtin fails on an invalid argument (e.g. an out-of-bounds `arrayGet`),
the runtime emits its debug log by calling the interpreter's log sink
**directly** — *not* through `systemLog` / `systemLogDebug`. So
`unittestMockAll()` / `unittestMockOne('systemLog', ...)` **cannot** capture it:
the mock records nothing while the message still prints. A test asserting "no
debug log" by mocking `systemLog` passes whether or not the bug is present, so
don't write one. (Mocking the failing builtin itself doesn't work either — the
unittest framework calls that same builtin.)

To prove a change produces no spurious debug output, run the suite in debug
mode (`bare -d …`; the include-test runner already passes `-d`) — a failing
builtin then prints `… BareScript: Function "X" failed with error: …`. This
repo's convention: a test that *intentionally* triggers an expected failure
precedes it with `systemLogDebug('NOTICE: The following "X" error is
expected:')`. So **every `failed with error` line must be immediately preceded
by a `NOTICE:` line** — `grep -B1 "failed with error"` over the output makes
that a one-look check; any un-NOTICE'd line is unintended logging.

### Asserting rendered output

Apps render through `markdownPrint` and `elementModelRender`; under
`unittestMockAll()` you assert the recorded call log. Three things make those
assertions tractable:

- **`unittestDeepEqual` compares `jsonStringify` output**, and that one fact
  drives the rest. Object keys serialize **sorted**, so key order never has to
  match. Every function serializes to the string `'<function>'` (and every
  regex to `'<regex>'`), so to assert an element model that carries an
  event-handler callback — e.g. `formsTextElements` stores
  `systemPartial(formsTextOnKeyup, onEnter)` under `callback.keyup` — just write
  the string `'<function>'` in that slot and the deep-equal matches. There is no
  literal for the anonymous partial, but none is needed and no scrubbing of the
  call log is needed either. Trade-off: all functions collapse to the same
  sentinel, so the assertion proves a callback is *present*, not *which* one.
  (`jsonStringify(value, 4)` on its own is also handy for dumping a captured log
  into a stable, diffable literal.)
- **To test a captured event callback, invoke it with the args MarkdownUp
  appends at event time** — `capturedFn(14, 7, 30, 30)` for an SVG-element click, `capturedFn(13)`
  for a keyup. Calling it with no args passes whether or not the handler leaks an
  event arg into a real parameter, so a no-arg call won't catch that bug.

---

## 6. Running BareScript

### CLI (`bare`)

```sh
bare script.bare              # run a plain BareScript script
bare -m app.bare              # run a MarkdownUp app (Markdown text output)
bare -l app.bare              # run a MarkdownUp app (HTML output)
bare -c 'expr'                # run an inline expression
bare -d script.bare           # debug mode: log invalid library args
bare -v K=V script.bare       # set global K to JSON value V
bare -x script.bare           # run AND statically analyze (lint warnings + execution)
bare -s script.bare           # static analysis only — parse + lint, no execution
bare -m -x app.bare           # run + lint a MarkdownUp app (must combine -m with -x)
bare -m -s app.bare           # lint-only check of a MarkdownUp app
```

Note: `-x` is *static analysis **with** execution* — it runs the script and
also reports lint warnings. Use `-s` for parse/lint without execution. For
MarkdownUp apps and their tests, always combine `-m` (or `-l`) with `-x` or
`-s` so the runtime stubs are available (see Section 4).

Note: under `-m` (Markdown text) only `markdownPrint` output is emitted —
`elementModelRender`, and therefore `drawRender` (which calls it), render
**nothing**. To actually see an element-model or `draw.bare` drawing from the
CLI, use `-l` (HTML), which emits the `<svg>` / element markup. A canvas app
that looks blank under `bare -m` is usually fine; check it with `bare -l`. To
*see* the rendered frame, save that HTML and open it in a browser — or rasterize
it headless (e.g. `chrome --headless --screenshot=out.png --window-size=W,H frame.html`)
to eyeball a `draw.bare` scene without a manual click. To capture a specific
frame, point `-l` at a tiny driver script that sets up the state and calls your
draw function (parameterize which frame with `-v`).

In the CLI, `systemFetch('local/path.json')` reads a file; with a request
body it *writes* the body to the file.

### Embedding (JavaScript)

```javascript
import {parseScript} from 'bare-script/lib/parser.js';
import {executeScript} from 'bare-script/lib/runtime.js';
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';

const script = parseScript(`return N * 2`);

// Sync — no async functions used
console.log(executeScript(script, {globals: {N: 21}}));   // 42

// Async — required if the script uses systemFetch or any async include
console.log(await executeScriptAsync(script, {fetchFn: fetch}));
```

### Embedding (Python)

Identical API in the
[`bare-script` Python package](https://github.com/craigahobbs/bare-script-py#readme).

---

## 7. Idioms and pitfalls — the model's checklist

Before declaring code "done," scan it for these. They are the failures models
most commonly produce when writing BareScript for the first time.

- [ ] **No bracket access**: no `obj['k']`, no `arr[0]`. Use `objectGet`,
      `arrayGet`. (Brackets appear only in `[1, 2, 3]` literals and
      `[Variable Name]`-style identifiers.)
- [ ] **`[]`, `''`, and `0` are all falsy.** To tell `null` from an empty
      array/string, test `x == null` and `systemType(x)` / `arrayLength(x)`
      explicitly — don't lean on `if x:` or `if !x:` (see Truthiness).
- [ ] **No `+=`, `++`, `--`**. Write `i = i + 1`.
- [ ] **Every `function` has `endfunction`**, every `if` has `endif`, every
      `while` has `endwhile`, every `for` has `endfor`.
- [ ] **`async` is on the function declaration** (not `await` at call sites
      — there is no `await` keyword). If a function calls `systemFetch` or
      any other async function, it must be `async function fn(...)`.
- [ ] **Multiline continuation uses trailing `\`**, including inside object
      and array literals.
- [ ] **Strings are concatenated with `+`** — no f-strings, no `${...}`.
- [ ] **Invalid arguments return `null`**, not an exception. Defensively check
      `if x == null:` before chaining.
- [ ] **Regex literals don't exist** — always `regexNew(pattern, flags?)`.
- [ ] **`markdownPrint` arguments are separate lines.** Pass `''` between
      blocks to get a Markdown paragraph break.
- [ ] **Escape Markdown** with `markdownEscape` before printing user content.
- [ ] **Includes go at the top**, before any code that uses their functions.
- [ ] **Never `include <markdownUp.bare>`** (see Section 4). Run/lint
      MarkdownUp apps with `bare -m -x app.bare`, not `bare -x app.bare`.
- [ ] **Element-model callbacks `systemPartial`-bind all handler args** — event
      callbacks get extra trailing args (SVG-click coords, `keyCode`); an unbound
      param catches them (see Section 3).
- [ ] **Use `for value, ixValue in items:`** to get both value and index;
      don't reinvent with `while`.

---

## 8. Notes for the model

- **Examples beat prose.** Pattern-match on the concrete examples above, and
  match their style — 4-space indent, trailing `\` for continuation inside
  literals, `function` / `endfunction`, lowercase camelCase names.
- **Recall names before inventing them; fetch the reference before guessing.**
  If you're unsure of a name, recall its camelCase prefix (`array*`, `object*`,
  `string*`, `data*`, `draw*`, `markdown*`, `unittest*`, `systemFetch`, …) and
  pick the function that literally describes the operation. If it isn't in this
  file, fetch the single-page library reference
  (<https://craigahobbs.github.io/bare-script/library/barescript-library.md>),
  which documents every built-in *and* include function. Only read the
  implementation source — the library module and the shared `.bare` include
  files — as a last resort, and freely when you're working inside a BareScript
  implementation repo itself.
- **Don't translate from JavaScript or Python without re-checking.** The
  syntactic similarity hides three pitfalls — bracket access, augmented
  assignment, and exceptions — none of which exist here.
- **Don't introduce abstractions.** BareScript apps are small; inline the
  logic, one `appMain()` is fine.
- **For tests, use the `unittest.bare` + `unittestMock.bare` pattern** from
  Section 5 — don't invent your own assertions.

---

## 9. Links

- Language: <https://craigahobbs.github.io/bare-script/language/>
- Built-in library: <https://craigahobbs.github.io/bare-script/library/>
- Include library: <https://craigahobbs.github.io/bare-script/include/>
- Expression library: <https://craigahobbs.github.io/bare-script/library/expression.html>
- Built-in + include library, single-page Markdown (fetch for the full reference — both libraries, full signatures): <https://craigahobbs.github.io/bare-script/library/barescript-library.md>
- Library models, single-page Markdown: <https://craigahobbs.github.io/bare-script/library/barescript-library-model.md>
- MarkdownUp: <https://craigahobbs.github.io/markdown-up/>
- MarkdownUp example applications (fetchable Markdown): <https://craigahobbs.github.io/MarkdownUpApplications.md>
- JS source: <https://github.com/craigahobbs/bare-script>
- Python source: <https://github.com/craigahobbs/bare-script-py>
