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

Use this skill whenever you are asked to:

- Write or modify a `.bare` file.
- Write or modify a `markdown-script` fenced code block inside a Markdown
  document.
- Write a MarkdownUp client-rendered Markdown application.
- Write unit tests for any BareScript code.
- Explain, review, or debug BareScript.

Recognize BareScript without being told: `.bare` extension, `markdown-script`
code fences, function names like `arrayLength`, `objectGet`, `markdownPrint`,
`systemFetch`, or the `function:` / `endfunction` / `if:` / `endif` /
`for ... in ...:` / `endfor` block syntax.

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

### Performance principles

When optimizing `.bare` code, a few rules of thumb that hold up in practice:

- **Native built-ins generally beat interpreted replacements.** Things like
  `regexMatch`, `jsonStringify` / `jsonParse`, `arrayJoin`, and `stringEncode`
  are implemented in JS/C — don't rewrite them as BareScript loops to "skip
  overhead." A pure-BareScript deep-clone via `arrayCopy` per row loses to
  `jsonParse(jsonStringify(x))`. Measure before assuming.
- **Hoist loop invariants.** `objectGet(config, 'key')`, `arrayLength(constArr)`,
  `precision != null`, etc. that don't depend on the loop variable should live
  above the loop. Per-row × per-field overhead adds up fast.
- **Split a loop on a function-arg invariant** instead of re-checking it
  per iteration. `if variables != null:` outside, with two specialized loop
  bodies inside, beats one body with a per-iter `if(variables != null, ...)`.
- **`if X:` is cheaper than `if X != null:`** because it skips a binary
  comparison op — but only safe when X is null or guaranteed-truthy. The
  empty-array-is-falsy rule (see Truthiness above) breaks this for `X` that
  could be `[]`; the empty-string-is-falsy and `0`-is-falsy rules break it
  for `X` that could be `''` or `0` (e.g. a parsed list-start number that
  accepts `0.` as a valid mark, or a regex-captured title that may be empty).
- **`systemBoolean(X)` inside `if` is redundant** — `if` already coerces.
- **Precompute per-field metadata as tuples** (e.g.
  `[field, attr, isMarkdown]`) once before the row loop when the same
  metadata is read across many rows. Read the tuple with `arrayGet(meta, N)`
  or destructure to named locals at the top of each iteration.
- **Per-row dispatch is expensive — avoid it when you can.** A chain like
  `elif fn == 'sum': ... elif fn == 'avg': ...` inside a hot per-row loop
  can cost more than the work it dispatches to. Pre-group by function
  beforehand so dispatch happens once per group, not once per row.
- **When dispatch IS unavoidable, prefer inline `if`/`elif` over a `for`
  loop sweep.** When you must dispatch per item (e.g. "which named group of
  this regex match matched?"), inline the choices as an `if`/`elif` chain
  instead of iterating a list of candidate keys. Two wins: per-iteration
  loop-variable bookkeeping goes away, and each branch can assign a string
  literal directly instead of building one by concatenating with the loop
  variable. We saw ~25% on one inner loop from this change alone.
- **`arrayGet(objectKeys(obj), 0)` is an anti-pattern for single-key
  dispatch.** This pattern — used to pick a span/part by its sole key —
  allocates a fresh keys array per call. Replace with direct
  `objectGet(obj, 'key')` truthy chains: same dispatch, no array allocation,
  and the same lookup caches the inner value for use in the matching branch.
- **Named-group regex dispatch.** When a regex is an alternation of member
  patterns and you need to know which member matched, wrap each part with
  `(?<name>...)` at compile time. A single `objectGet(match.groups, name)`
  truthy check then identifies the member — no extra `regexMatch` calls
  per match.
- **Lazy chained lookups.** Useful when you want a named local for each
  candidate group AND only the first matching group should do real work.
  Each subsequent line guards on the prior siblings' results:

  ```barescript
  boldStr = objectGet(matchGroups, 'bold')
  italicStr = !boldStr && objectGet(matchGroups, 'italic')
  codeStr = !boldStr && !italicStr && objectGet(matchGroups, 'code')
  ```

  Once an earlier sibling matched, later lines short-circuit on `!prev` and
  skip their `objectGet`. Each `xxx` ends up as the captured value if its
  group matched, or `false` if some earlier sibling already matched.
- **`regexMatchAll` + `ixSearch` index beats `while + regexMatch +
  stringSlice`** for iterating matches in a string. The former is one regex
  scan with an index pointer; the latter re-scans a fresh slice each
  iteration. Even when perf is close, prefer `regexMatchAll` — it's the
  idiomatic form used in `markdownParserParagraphSpans` and
  `markdownHighlightElements`. Caveat: with the `m` flag, `^` / `$` in
  inner patterns match true line boundaries in the `regexMatchAll` form, but
  the slice point in the `while+slice` form. The `regexMatchAll` semantics
  are usually what you want.
- **`objectGet` on a precomputed lookup map is not "free"** and is often
  *slower* than re-doing the work it replaces. The library function call
  into `objectGet` can exceed the cost of, say, a string concat of literals.
  Don't reach for "precompute into a map and look up" as a default — measure
  first. The same lesson applies to sharing small precomputed dicts (e.g.
  a shared `{'style': '...'}`): host runtimes allocate fresh small objects
  efficiently enough that the saved allocations often don't register.
- **Native regex calls on anchored no-match patterns are cheap.** Don't gate
  `regexMatch(re, line)` with `stringIndexOf` / single-character pre-checks
  hoping to skip the regex; the engine fails fast on anchored mismatches,
  and the gating string ops typically cost more than they save.
- **Always measure within a single session.** System load drifts run-to-run,
  so before/after numbers from different minutes can mislead. Save the diff,
  revert, measure, reapply, measure.
- **Trust measurement over intuition.** A-priori estimates of perf impact are
  often wrong by 5–10× in both directions — wins predicted to be large turn
  out marginal, and "cleanup-grade" changes occasionally land big. Estimate
  to prioritize what to try first; let the measurement decide what stays.

---

## 2. The built-in library

All functions are global — no namespacing. Names are camelCase, grouped by
prefix. Library functions **validate arguments and return `null` on type
mismatch** (with a debug log if debug mode is on).

Full reference: <https://craigahobbs.github.io/bare-script/library/> — also
published as a single-page Markdown document that can be fetched directly into
context: <https://craigahobbs.github.io/bare-script/library/barescript-library.md>.
What follows is what you need to *recall the right name* without searching.

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
`regexMatch` returns `null` on no match, otherwise `{'index': N, 'groups': {'0': '...', '1': '...'}}`.

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
calling. Each is documented in detail at
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
| `markdownUp.bare` | Stub implementations of the MarkdownUp runtime functions. **Loaded automatically by `bare -m` / `-l`; never `include` it yourself** — see Section 4. | `markdownPrint`, `elementModelRender`, `documentSetTitle`, `documentInputValue`, `documentURL`, `documentSetFocus`, `documentSetKeyDown`, `documentSetReset`, `documentFontSize`, `windowWidth`, `windowHeight`, `windowSetLocation`, `windowSetResize`, `windowSetTimeout`, `windowURLObject`, `windowClipboardRead`, `windowClipboardWrite`, `localStorageGet/Set/Remove/Clear`, `sessionStorageGet/Set/Remove/Clear` |
| `pager.bare` | Multi-page MarkdownUp app shell | `pagerMain`, `pagerValidate` |
| `qrcode.bare` | Render QR codes | `qrcodeDraw`, `qrcodeElements`, `qrcodeMatrix` |
| `schemaDoc.bare` | Schema-markdown documentation app | `schemaDocMain`, `schemaDocMarkdown` |
| `unittest.bare` | Unit-test framework | `unittestRunTest`, `unittestEqual`, `unittestDeepEqual`, `unittestCoverageStart`, `unittestCoverageStop`, `unittestReport` |
| `unittestMock.bare` | Mock library functions during tests | `unittestMockAll`, `unittestMockOne`, `unittestMockOneGeneric`, `unittestMockEnd` |
| `baredoc.bare` / `baredocCLI.bare` | Generate `library.json` from doc comments | `baredocMain`, `baredocCLIMain` |

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

When code runs inside MarkdownUp (in the browser), these "document" / "window"
/ "storage" functions are provided by the runtime:

- **Output:** `markdownPrint(line1, line2, ...)` — print Markdown lines
  (empty string = blank line / paragraph break);
  `elementModelRender(model)` — render an element model.
- **Document:** `documentSetTitle(s)`, `documentURL(url)`,
  `documentInputValue(id)`, `documentFontSize()`, `documentSetFocus(id)`,
  `documentSetKeyDown(fn)`, `documentSetReset(fn)`.
- **Window:** `windowWidth()`, `windowHeight()`, `windowSetLocation(url)`,
  `windowSetResize(fn)`, `windowSetTimeout(fn, ms)`, `windowURLObject(url)`,
  `windowClipboardRead()`, `windowClipboardWrite(s)`.
- **Storage:** `localStorageGet/Set/Remove/Clear`, `sessionStorageGet/Set/Remove/Clear`.

In the browser, MarkdownUp itself provides these functions. Under the plain
`bare` CLI, pass `-m` (or `-l` for HTML output) and the CLI **automatically
prepends `include <markdownUp.bare>` for you** — a small library of stub
implementations:

```sh
bare -m app.bare          # run the app, output Markdown text
bare -l app.bare          # run the app, output an HTML document
bare -m -x app.bare       # lint / static-analyze a MarkdownUp app
```

> ⚠ **Never write `include <markdownUp.bare>` yourself.** Application code,
> test code, and `include`d helpers must not reference it. There are two
> independent reasons:
>
> 1. **In the real MarkdownUp runtime (browser)**, `markdownPrint`,
>    `elementModelRender`, the `document*` / `window*` / `*Storage*`
>    functions are **built-in**. `include <markdownUp.bare>` would
>    **overwrite those built-ins with the logging stubs** — your app would
>    silently stop rendering and just record calls.
> 2. **Under `bare -m` / `-l` (and therefore unit tests)**, the CLI has
>    already prepended `include <markdownUp.bare>` for you. Including it
>    again is redundant.
>
> Either way, the include is wrong.

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

### MarkdownUp gotchas

1. **Always escape user input** (URL args, fetched data, anything string-y)
   with `markdownEscape` before `markdownPrint`. Markdown is rendered as HTML;
   unescaped `<` and `&` will produce broken output or XSS.
2. **Anything that calls `systemFetch` must be `async`**, including event
   handlers wired through `forms.bare` callbacks.
3. **`markdownPrint(a, b)` with no empty-string separator** prints `a` and `b`
   on consecutive lines — same paragraph in Markdown. Pass `''` between them
   to force a paragraph break.
4. The MarkdownUp runtime is single-threaded JavaScript — there is no
   coroutine cancellation. Long synchronous loops will freeze the browser.
   For animation, schedule with `windowSetTimeout(fn, ms)`.

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

### `test/testApp.bare` — basic assertions

```barescript
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

### Running tests

```sh
bare -m test/runTests.bare        # exits non-zero on any failure
bare -m -x test/runTests.bare     # lint + run (lint warnings printed alongside test results)
```

`-m` automatically prepends `include <markdownUp.bare>` — your test code must
not include it itself (see Section 4).

### Mocking the MarkdownUp runtime

`markdownPrint`, `documentSetTitle`, `systemFetch`, `windowSetLocation`, etc.
all have side effects you don't want in unit tests.
[unittestMock.bare](https://craigahobbs.github.io/bare-script/include/)
intercepts every library function and records calls.

```barescript
include '../app.bare'
include <unittestMock.bare>

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
- [ ] **Never `include <markdownUp.bare>`** (see Section 4 for the two
      reasons). Run/lint MarkdownUp apps with `bare -m -x app.bare`, not
      `bare -x app.bare`.
- [ ] **Use `for value, ixValue in items:`** to get both value and index;
      don't reinvent with `while`.

---

## 8. Notes for the model

- **Examples beat prose.** Pattern-match on the concrete examples above. If
  you're unsure of an exact name, recall the camelCase prefix (`array*`,
  `object*`, `string*`, `data*`, `draw*`, `markdown*`, `unittest*`,
  `systemFetch`, …) and pick the function whose name literally describes the
  operation.
- **When uncertain, grep before guessing.** Function names live in
  `lib/library.js` (built-ins) and `lib/include/*.bare` (includes); they're
  stable and 100%-covered.
- **Don't translate from JavaScript or Python without re-checking.** The
  syntactic similarity hides three pitfalls: bracket access, augmented
  assignment, and exceptions. None exist here.
- **Don't introduce abstractions.** BareScript apps are small. Inline the
  logic; one `appMain()` is fine.

### Your obligations, in order

1. **Apply Section 7's checklist** before returning code.
2. **Match the examples' style** — 4-space indent, trailing `\` for
   continuation inside literals, `function` / `endfunction`, lowercase
   camelCase names.
3. **Recall function names from this file before inventing them.** If you
   need one that isn't listed, search `lib/library.js` and
   `lib/include/*.bare`.
4. **Never `include <markdownUp.bare>`** from application or test code (see
   Section 4). Lint MarkdownUp apps with `bare -m -x app.bare`.
5. **For tests, use the `unittest.bare` + `unittestMock.bare` pattern** from
   Section 5. Don't invent your own assertions.

---

## 9. Links

- Language: <https://craigahobbs.github.io/bare-script/language/>
- Built-in library: <https://craigahobbs.github.io/bare-script/library/>
- Include library: <https://craigahobbs.github.io/bare-script/include/>
- Expression library: <https://craigahobbs.github.io/bare-script/library/expression.html>
- Built-in library, single-page Markdown (fetch for the full reference): <https://craigahobbs.github.io/bare-script/library/barescript-library.md>
- Library models, single-page Markdown: <https://craigahobbs.github.io/bare-script/library/barescript-library-model.md>
- MarkdownUp: <https://craigahobbs.github.io/markdown-up/>
- MarkdownUp example applications (fetchable Markdown): <https://craigahobbs.github.io/MarkdownUpApplications.md>
- JS source: <https://github.com/craigahobbs/bare-script>
- Python source: <https://github.com/craigahobbs/bare-script-py>
