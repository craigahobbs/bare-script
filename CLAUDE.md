# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BareScript is a lightweight, embeddable scripting and expression language with a Python-like syntax. This repository is the **JavaScript implementation**; a companion **Python implementation** lives at `../bare-script-py/` and shares the same include-library `.bare` files and unit tests (synced via `make sync`). Both implementations are kept at 100% test coverage with identical test suites — changes here generally need a mirrored change in the Python repo.

## Authoring BareScript code

When writing, modifying, or reviewing BareScript code (`.bare` files, `markdown-script` blocks, MarkdownUp apps, or BareScript unit tests), first read `SKILL.md` at the repo root. It's the model-agnostic reference for the language, built-in library, include library, MarkdownUp app pattern, and unit-test / mocking pattern.

## Common commands

Build driven by `Makefile` + `Makefile.base` (the latter downloaded from `javascript-build`). Set `USE_DOCKER=1` or `USE_PODMAN=1` to containerize.

- `make test` — run the Node test suite (`node --test test/`)
- `make test TEST=<pattern>` — run a single Node test by name pattern
- `make lint` — ESLint over `lib/`, `test/`, `bin/`, `perf/`
- `make cover` — c8 coverage; enforces 100% on `lib/` and `test/`
- `make doc` — JSDoc + library docs build (writes to `build/doc/`)
- `make commit` — full pre-publish gate (test + lint + doc + cover)
- `make test-include` — run the `.bare` test suite under `lib/include/test/` via the `bare` CLI
- `make test-include TEST=<name>` — single `.bare` test
- `make perf` — benchmark BareScript (JS) vs JavaScript vs Python
- `make sync` — push `lib/include/` and `static/` to the Python repo
- `make clean` / `make superclean` — remove `build/`, downloaded base files, container images
- `npm test` — bare `node --test test/` invocation (skips container/build setup)

`make perf` benchmarks the runtime itself. For optimizing an individual include file, write a throwaway `.bare` harness under `perf/` and run with `node bin/bare.js perf/<file>.bare` — `perf/` is outside the shipped package and isn't synced cross-repo, so harnesses can live there until you're done and then be removed (regenerate as needed).

## Architecture

### Modules

The runtime is split so the synchronous path stays free of `async`:

- `lib/parser.js` — text → AST (the "BareScript model", a plain JSON object validated against the schema in `lib/model.js`). `parseScript` and `parseExpression` are the entry points.
- `lib/runtime.js` — synchronous `executeScript` / `evaluateExpression`. Implements statement counting (`maxStatements`, default 1e9), coverage recording, and the core interpreter loop.
- `lib/runtimeAsync.js` — `executeScriptAsync` / `evaluateExpressionAsync`. Required when the script uses async globals (e.g. `systemFetch`, includes). Mirrors the sync runtime's structure.
- `lib/library.js` — all ~200 built-in functions (`scriptFunctions`) and the smaller expression-only set (`expressionFunctions`).
- `lib/model.js` — Schema-Markdown type model for the BareScript AST + `lintScript`.
- `lib/value.js` — type coercion and comparison primitives (`valueType`, `valueCompare`, `valueArgsValidate`, etc.). Argument validation is declarative via `valueArgsModel`.
- `lib/options.js` — runtime option typedefs and the `urlFileRelative` URL resolver (platform-neutral).
- `lib/optionsNode.js` — Node-only `fetchFn` implementations (`fetchReadOnly`, `fetchReadWrite`) and `logStdout`. The browser/embedded use case skips this file.

### CLI

`bin/bare.js` is a thin shim around `lib/bare.js#main` that wires in `fetchReadWrite` + `logStdout`. `lib/bare.js` implements the `bare` CLI: argument parsing, `-c`/`-m`/`-d`/`-v`/`-x` flags, HTML/MarkdownUp render modes, and the `-x` lint/syntax-check mode.

### Include library (`lib/include/*.bare`)

Pure-BareScript libraries (args parsing, data aggregation/charts, markdown rendering, diff, unittest framework, etc.) live under `lib/include/`. They are part of the **shipped package** (`files` in `package.json`) and are loaded via `include <name.bare>` using the system include prefix. Each has a `testXxx.bare` counterpart in `lib/include/test/` driven by `unittest.bare`. Modify with `make test-include` (not just `make test`).

### Library function documentation

`lib/library.js` and `.bare` files use the `// $function:` / `# $function:` doc-comment convention. `baredoc` (CLI installed via `package.json` `bin`) reads these to generate `library.json`. To add a new built-in function:

1. Implement in `lib/library.js`, register in `scriptFunctions` (and `expressionFunctions` if expression-callable, plus `expressionFunctionMap` if the expression-context name differs).
2. Add the `$function: / $group: / $doc: / $arg:` doc block above it.
3. Add test cases in `test/testLibrary.js`.

## Conventions

- ESM throughout (`"type": "module"`). Use the `.js` extension in import paths.
- ESLint runs `js.configs.all` with project overrides in `eslint.config.js`; max line length 140, 4-space tabs, single quotes.
- All `lib/` code must keep coverage at 100% (c8 `--100`). New code without tests will fail `make commit`. Beware: defensive checks that become unreachable after a refactor (e.g. a `continue` guard left in place when the surrounding logic now guarantees its condition is false) will break coverage. Either remove the dead check and rely on the proven invariant, or add a test that exercises the defensive path.
- The sync runtime (`lib/runtime.js`) must remain non-async; only `lib/runtimeAsync.js` may use `await`. The two interpreters are kept structurally parallel — when changing one, mirror the change in the other.
- Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `lib/value.js`; do not hand-roll type checks in library functions.
- Only one runtime dependency (`schema-markdown`); avoid adding more.

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

## Cross-repo workflow

Changes to `lib/include/` or `static/`: make the change here, run `make test-include`, then `make sync` to push to `../bare-script-py/`. JavaScript-side changes in `lib/*.js` typically need a parallel edit in the Python implementation.
