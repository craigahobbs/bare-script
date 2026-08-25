# AGENTS.md

Notes for coding agents working in this repository.

## Project overview

BareScript is a lightweight, embeddable scripting and expression language with a Python-like syntax. This repository is the **JavaScript implementation**; a companion **Python implementation** lives at `../bare-script-py/` and shares the same include-library `.bare` files and unit tests (synced via `make sync`). Both implementations are kept at 100% test coverage with identical test suites — changes here generally need a mirrored change in the Python repo.

## Authoring BareScript code

When writing, modifying, or reviewing BareScript code (`.bare` files, `markdown-script` blocks, MarkdownUp apps, or BareScript unit tests), first read `SKILL.md` at the repo root. It's the model-agnostic reference for the language, built-in library, include library, MarkdownUp app pattern, and unit-test / mocking pattern.

## javascript-build

This is a [javascript-build](https://github.com/craigahobbs/javascript-build#readme) package. Read the javascript-build skill before running tests, lint, coverage, or changing the Makefile: [`../javascript-build/SKILL.md`](../javascript-build/SKILL.md) if that file exists, otherwise [https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md](https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md).

Local Makefile overrides:

- `ESLINT_ARGS` — also `bin/` and `perf/`
- `commit` also depends on `test-include`

Package-specific targets:

- `make test-include` — run the `.bare` test suite under `lib/include/test/` via the `bare` CLI
- `make test-include TEST=<name>` — single `.bare` test. Note the asymmetry with `make test`: this is an **exact**
  test name, not a pattern (`unittest.bare` compares with `!=`), so a prefix like `testSchemaValidate` silently runs 0 tests
- `make perf` — benchmark BareScript (JS) and JavaScript across the `perf/` test suite (mandelbrot,
  schemaParse, schemaValidate, markdownParse, markdownElements, urlEncode, urlDecode, and the BareScript-only qrcodeMatrix —
  urlEncode/urlDecode race `urlEncodeQueryString`/`urlDecodeQueryString` against schema-markdown-js's
  `encodeQueryString`/`decodeQueryString`, the closest native analog even though they differ in percent-encoding
  scheme); if `../bare-script-py` exists, its
  `make perf` (BareScript (PyC), BareScript (Py), and Python) also runs and its data is merged into the report. Each `perf/test.*` program takes a language
  label and an optional test name (all tests when omitted; iteration counts are tuned per test) and outputs
  `language,test,runs,timeMs` CSV rows — e.g. `node perf/test.js "JavaScript" schemaParse` or
  `bare perf/test.bare -v vLanguage "'BareScript (JS)'" -v vTest "'mandelbrot'"`
- `make perf TEST=<name>` — run a single perf test across all languages (a program silently skips a test it doesn't
  implement; an unknown test name fails the run)
- `make sync` — push `lib/include/` and `static/` to the Python repo

`make perf` benchmarks the runtime itself. For optimizing an individual include file, write a throwaway `.bare` harness under `perf/` and run with `node bin/bare.js perf/<file>.bare` — `perf/` is outside the shipped package and isn't synced cross-repo, so harnesses can live there until you're done and then be removed (regenerate as needed).

## Architecture

### Modules

The runtime is split so the synchronous path stays free of `async`:

- **The parser is self-hosted**: `lib/include/barescriptParser.bare` (a line-for-line port of the former `lib/parser.js`) is the only parser implementation. `lib/includeSource.js` embeds **every include as its parser-compiled JSON script model** — dictionary-compressed, chunked, and decoded at module load, with `scriptLines` omitted (unused at runtime for system includes) — and the runtimes' system-include code JSON-parses any system include whose text starts with `{`; that's how the parser loads without a native parser and how all system includes skip parsing. `lib/runtime.js` exports the native-API wrappers `barescriptParseScript` / `barescriptParseExpression` (lazy bootstrap, throw `BareScriptParserError`), used by the CLI and non-system include parsing. The parsed model is validated against the schema in `lib/include/barescriptModel.bare`.
- `lib/runtime.js` — synchronous `executeScript` / `evaluateExpression`. Implements statement counting (`maxStatements`, default 1e9), coverage recording, and the core interpreter loop. System includes (`include <name.bare>`) execute synchronously from the embedded `systemIncludes` map; non-system includes require the async runtime. Also exports `barescriptLintScript`, an include-like stub that lazily executes the embedded `barescriptLint.bare` include library and computes the async-function names from the globals — used by the CLI's `-x`/`-s` modes and both runtimes' debug-mode include linting.
- `lib/runtimeAsync.js` — `executeScriptAsync` / `evaluateExpressionAsync`. Required when the script uses async globals (e.g. `systemFetch`, non-system includes). Mirrors the sync runtime's structure.
- `lib/includeSource.js` — **generated** module (Makefile target; regenerated when `lib/include/*.bare` or the Makefile's generator script changes) exporting each include file's parser-compiled script model as JSON text (compressed; decoded at module load) plus the `systemIncludes` file-name → model-JSON map. Checked in; never edit by hand — run `make lib/includeSource.js`. Caveat: regeneration parses the includes with the **previous** embed's parser, so a `barescriptParser.bare` change that alters generated script models needs a second regen pass (`touch lib/include/barescriptParser.bare && make lib/includeSource.js`) to reach a fixed point; semantics-neutral parser edits converge in one pass. Never delete the generated file to force a rebuild — the generator imports `lib/runtime.js`, which needs the embed to exist.
- `lib/library.js` — the 100 built-in functions (`scriptFunctions`) and the 47-alias expression-only set (`expressionFunctions`).
- `lib/include.js` — executes the include library (barescriptModel, data, markdown, qrcode, schema, url, etc.) from the embedded include source into a single module-private globals via the sync runtime at module load, and exports native stub functions for the include libraries' public functions (`barescriptValidateScript`, `dataAggregate`, `markdownParse`, `schemaParse`, `schemaValidate`, `urlEncode`, etc.). MarkdownUp-render, app-main, and async include functions are not stubbed. Only the doc build (and the tests) depends on it, so the core execution path and CLI skip the include bootstrap.
- `lib/value.js` — type coercion and comparison primitives (`valueType`, `valueCompare`, `valueArgsValidate`, etc.). Argument validation is declarative via `valueArgsModel`.
- `lib/options.js` — runtime option typedefs and the `urlFileRelative` URL resolver (platform-neutral).
- `lib/optionsNode.js` — Node-only `fetchFn` implementations (`fetchReadOnly`, `fetchReadWrite`) and `logStdout`. The browser/embedded use case skips this file.

### CLI

`bin/bare.js` is a thin shim around `lib/bare.js#main` that wires in `fetchReadWrite` + `logStdout`. `lib/bare.js` implements the `bare` CLI: argument parsing, `-c`/`-m`/`-d`/`-v`/`-s`/`-x` flags, HTML/MarkdownUp render modes, and the `-s`/`-x` lint modes (`-s` parse+lint only, `-x` lint with execution).

### Include library (`lib/include/*.bare`)

Pure-BareScript libraries (args parsing, data aggregation/charts, markdown rendering, diff, unittest framework, etc.) live under `lib/include/`. The `.bare` sources are **not** in the npm package — they ship embedded in the generated `lib/includeSource.js` and are loaded via `include <name.bare>` from its source map. Each has a `testXxx.bare` counterpart in `lib/include/test/` driven by `unittest.bare`. Modify with `make test-include` (not just `make test`).

### Library function documentation

`lib/library.js` and `.bare` files use the `// $function:` / `# $function:` doc-comment convention. `baredocCLI.bare` (run via the `bare` CLI in the `doc` target) reads these to generate the library documentation model JSON (e.g. `library-builtin.json`). To add a new built-in function:

1. Implement in `lib/library.js`, register in `scriptFunctions` (and `expressionFunctions` if expression-callable, plus `expressionFunctionMap` if the expression-context name differs).
2. Add the `$function: / $group: / $doc: / $arg:` doc block above it.
3. Add test cases in `test/testLibrary.js`.

`make doc` (and therefore `make commit`) also renders single-page Markdown versions of the library docs — `build/doc/library/barescript-library.md`, `barescript-library-model.md`, and `barescript-expression-library.md`, plus the runtime model as `build/doc/model/barescript-model.md` — published under <https://craigahobbs.github.io/bare-script/library/> and <https://craigahobbs.github.io/bare-script/model/>. Together with the language reference (published raw at <https://craigahobbs.github.io/bare-script/language/README.md>), these are the Markdown equivalents of the HTML docs, intended for fetching into an AI assistant's context alongside `SKILL.md`.

## Conventions

- ESM throughout (`"type": "module"`). Use the `.js` extension in import paths.
- ESLint runs `js.configs.all` with project overrides in `eslint.config.js`; max line length 140, 4-space indent,
  single quotes, and `padded-blocks: never` (no blank line directly inside a block — this bites when restructuring
  an `if`/`else` chain).
- The `.bare` include library is held to 100% too, by a separate mechanism: the include-test runners pass
  `'coverageMin': 100`, so a change that adds an unreached branch fails `make test-include` — not `make cover`.
  Either cover the new path with a test or drop it; the same dead-defensive-check caution below applies.
- All `lib/` code must keep coverage at 100% (c8 `--100`). New code without tests will fail `make commit`. Beware: defensive checks that become unreachable after a refactor (e.g. a `continue` guard left in place when the surrounding logic now guarantees its condition is false) will break coverage. Either remove the dead check and rely on the proven invariant, or add a test that exercises the defensive path.
- The sync runtime (`lib/runtime.js`) must remain non-async; only `lib/runtimeAsync.js` may use `await`. The two interpreters are kept structurally parallel — when changing one, mirror the change in the other. Exception: perf-only machinery is sync-only (e.g. the intrinsics fast path, the `evaluateExpressionHelper` globals-threading split). `evaluateExpressionAsync` delegates non-async expressions to the sync evaluator and non-`async` script functions execute through the sync interpreter, so runtime optimization work targets `lib/runtime.js`; mirror semantic changes (e.g. the statement loop) into `lib/runtimeAsync.js`, not perf-only structure.
- BareScript literals: write objects as `{}` / `{'key': value}` and arrays as `[]` / `[a, b]` — never `objectNew()`
  or `arrayNew()`. The parser lowers both literal forms to the same `objectNew` / `arrayNew` AST nodes, so this is
  purely stylistic with no perf difference. (`arrayNewSize(n, value)` is a different function and stays.)
- Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `lib/value.js`; do not hand-roll type checks in library functions.
- No runtime dependencies; avoid adding any.

## Perf measurement

When optimizing an include file, measure within a single session — system load drifts noticeably between runs minutes apart and will produce false-positive or false-negative wins. The reliable pattern:

```bash
git diff lib/include/foo.bare > /tmp/foo.patch
git checkout lib/include/foo.bare
node bin/bare.js perf/foo.bare    # BEFORE
git apply /tmp/foo.patch
node bin/bare.js perf/foo.bare    # AFTER
```

Have the harness run each scenario 3–5 times; the first iteration is usually slow due to JIT warmup — focus on the steady-state numbers. Treat changes under ~2% as noise. Optimization ideas that look promising in isolation often regress in real workloads — measure each candidate against a same-session baseline before committing.

The perf report aggregates by **best** per-run timing per language, not mean, which is why best-of-N interleaving is
the right protocol. The report's non-BareScript rows (`JavaScript`, `Python`) never touch the include library, so
their deltas in the same runs are a free noise control.

Same-session alone is not enough for small deltas — load drifts a few percent even within minutes, enough to fake or mask a win. For A/B comparisons, interleave the configurations in one loop (baseline, then candidate, repeated 3×) and compare best-of-N per configuration. This works for runtime changes too: save baseline and candidate copies of the changed module (e.g. `lib/runtime.js`) and copy the right one into place before each perf invocation — each CLI run is a fresh process, so swapping files between invocations is safe.

Prefer a *real* document over a synthetic one for the harness input. The distribution of features in real content — span density, link patterns, code-block sizes, paragraph length — reflects what users actually feed the library; a hand-built blob can over-weight one feature and miss the actual bottleneck. For markdown-rendering work, `static/language/README.md` is a convenient ~14 KB sample. Two practical notes:

- `systemFetch` is async, so a harness that calls it needs `async function main():`.
- `systemFetch` resolves relative paths against the script's directory, not the process CWD. From `perf/foo.bare`, the README is `'../static/language/README.md'`.

When an optimization is behaviorally correct but fails a test, consider whether the test is asserting on a "don't care" edge case — for example, a code-block-line input with a baked-in trailing `\n` that the parser pipeline never actually produces. Modifying the test input is sometimes the right call. Check whether the corner case is documented behavior first.

### Finding the hot spots: the statement profiler

Timings tell you *whether* a change helped, not *where* to look. For that, use the runtime's coverage recorder as a per-line statement profiler. Coverage is skipped for system includes (`!script.system`), so the target must be included as a *local* file — copy it into `perf/` and include it by path, which also overrides the system definitions loaded earlier:

```
include <unittest.bare>
include 'fooVariant.bare'          # copy of lib/include/foo.bare

unittestCoverageStart()
fooEntryPoint(input)               # one representative call
unittestCoverageStop()

scripts = objectGet(unittestCoverageGlobal(), 'scripts')
for scriptName in objectKeys(scripts):
    covered = objectGet(objectGet(scripts, scriptName), 'covered')
    for lineno in objectKeys(covered):
        systemLog(scriptName + ' ' + lineno + ' ' + objectGet(objectGet(covered, lineno), 'count'))
    endfor
endfor
```

Annotating the source with those counts is what surfaces structural waste that reading the code does not — e.g. a guard chain whose remaining tests are still walked after a match, or a loop iterating declared members when most are absent from the value. Note that a `for ... in` loop costs ~4 recorded statements per iteration of index bookkeeping, and each `elif` costs ~2, so those lines look hot even when the body is trivial.

### Statement count is only a proxy when the statements do real work

Reducing recorded statements does **not** reliably reduce time. Measured on `schemaValidate`: statements removed that were jump/label/assignment bookkeeping cost about **5.5 ns each**, while `objectHas`-and-loop-work statements cost about **36 ns** and the overall average was about **71 ns**. A change that removed 5.7% of statements (converting every branch to an explicit return, eliminating the shared `valueNew = value` / `return valueNew` tail) delivered **0.4%** — noise. A change that removed a comparable share but included 160 `regexMatch` calls per run delivered nearly its full statement share.

So before trusting a statement-count estimate, check *what kind* of statement the change removes. Prioritize eliminating built-in calls (especially `regexMatch`/`regexReplace`), allocations, and interpreted function calls. Deprioritize eliminating jumps, `endif` labels, and plain assignments — and always confirm with an interleaved A/B before committing to the idea.

Two related traps worth remembering: the perf report's non-BareScript languages (`JavaScript`, `Python`) never touch `lib/include/`, so their deltas in the same runs are a free noise control — if they move as much as the BareScript numbers, you have measured nothing. And a candidate that adds a per-call memo only pays when one call does repeated work; it is a net loss on small inputs.

## Cross-repo workflow / tandem development

The JS and Python implementations are mirrors of each other — great effort has been made to keep `lib/*.js` and the corresponding `bare_script/*.py` files (runtime, value, parser, library, options, etc.) as close to line-for-line identical as possible, and they must stay that way. **Any change to one implementation needs a parallel change to the other in the same working session** — features, bug fixes, refactors, optimizations, and test additions all apply.

**`make sync` pushes outward, and the mirror repo defines the same target pushing the other way.** Always invoke it
as `make -C <repo> sync` — a shell left sitting in the mirror repo will silently sync in reverse and revert the work
you just finished.

Workflow for a tandem change:

- Changes to `lib/include/` or `static/` (the shared `.bare` sources and include-library tests): make the change here, run `make test-include`, then `make sync` to push to `../bare-script-py/`. Do not hand-edit those files in the Python repo.
- Changes to `lib/*.js`: make the parallel edit in `../bare-script-py/`'s corresponding module. Keep structure, naming, and ordering aligned so the two files diff cleanly.
- After editing both repos, run the full gate in each: `make commit` (tests + lint + 100% coverage), plus `make test-include`. For perf-sensitive changes also run `make perf` in both.
- For optimization work specifically: measure interleaved in both repos before recommending, and favor wins that make `bare-script` (JavaScript) faster, since JS is the more performance-sensitive target. Line-for-line parity beats one-sided gains — an optimization that requires structural divergence between the ports is dropped even if it wins big in one engine. (Verified: inlining leaf-expression evaluation into the expression evaluator's binary/argument sites gained 10–20% in CPython, which rewards eliminating function calls, but cost V8 8–40% by bloating the JIT-inlined hot function; it was rejected to keep the ports identical.) Stage the changes in each repo with a prepared commit message but don't commit until the measured deltas confirm the change helps — or at least doesn't regress — both implementations.

### The schema-markdown reference ports

`schema.bare`, `schemaParser.bare`, `schemaTypeModel.bare`, and `schemaUtil.bare` are ports of the **reference Schema
Markdown implementations**, which live in two more repositories:

- `../schema-markdown-js/lib/schema.js` and `lib/parser.js` (JavaScript)
- `../schema-markdown/src/schema_markdown/schema.py` and `parser.py` (Python)

These are kept as close to line-for-line identical with the `.bare` sources as the languages allow, so **a change to the
schema include files needs a matching change in both reference repos in the same session** — and vice versa. Each has its
own `make commit` gate (tests + lint + 100% coverage) that must pass. They are separate repositories with their own
branches; nothing syncs automatically.

Two corollaries, both learned the hard way:

- **Port changes that are perf-neutral in native code anyway.** A branch reorder or a restructured conditional may win
  several percent in the BareScript interpreter and nothing in JS/Python — port it regardless, to keep the sources
  aligned. A pure block move with no line-level churn is the ideal shape; verify it as one by comparing the sorted line
  multiset against `HEAD` before and after.
- **Drop optimizations that force structural divergence.** The reference implementations raise/throw on validation error
  and thread no state, so a BareScript optimization that hangs a per-call memo off the threaded `error` object has
  nowhere to live in them without adding a parameter to every recursive call. Prefer the change that keeps all four
  sources parallel, even when it measures slower.

